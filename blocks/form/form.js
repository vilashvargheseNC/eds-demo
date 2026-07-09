import {
  loadBlock, decorateBlocks, fetchPlaceholders, toCamelCase,
} from '../../scripts/aem.js';
/** @type {Record<string, string>} */
let placeholders = {};

/**
 * Loads all blocks found within a fragment (JS + CSS). Mirrors aem.js's
 * loadSections/loadSection pattern, but operates directly on .block
 * elements rather than section wrappers, since no such helper is exported.
 * @param {DocumentFragment|Element} fragment
 * @returns {Promise<void>}
 */
async function loadBlocks(fragment) {
  const blocks = [...fragment.querySelectorAll('.block')];
  await Promise.all(blocks.map((block) => loadBlock(block)));
}

/**
 * Returns the translated string for the given key, falling back to an explicit
 * fallback or the key string itself. Keys are matched as camelCase against the
 * placeholders sheet (e.g. "This field is required." → thisFieldIsRequired).
 * @param {string} str - English string used as both lookup key and implicit fallback
 * @param {string} [fallback] - explicit fallback when str is not a suitable default (e.g. URLs)
 * @returns {string}
 */
const t = (str, fallback) => placeholders[toCamelCase(str)] || fallback || str;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Splits an Options cell into a trimmed list. Newline-delimited when the
 * value contains a newline (safe for option text with embedded commas),
 * otherwise comma-delimited.
 * @param {string} options
 * @returns {string[]}
 */
function parseOptions(options = '') {
  const delimiter = options.includes('\n') ? '\n' : ',';
  return options.split(delimiter).map((o) => o.trim()).filter(Boolean);
}

/**
 * Converts a hyphenated sheet name into a display title, e.g.
 * "primary-details" → "Primary Details".
 * @param {string} str
 * @returns {string}
 */
function titleCase(str) {
  return str.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/**
 * Builds the submission payload from all submittable form elements.
 * Submit buttons are excluded. Checked radio/checkbox values are comma-joined
 * when multiple inputs share the same name; unchecked elements are omitted.
 * @param {HTMLFormElement} form
 * @returns {Record<string, string>}
 */
function constructPayload(form) {
  const payload = {};
  [...form.elements].forEach((el) => {
    const {
      type, checked, name, value,
    } = el;
    if (type === 'submit' || !name) return;
    if (type === 'checkbox' || type === 'radio') {
      if (checked) {
        const val = value || 'on';
        payload[name] = payload[name] ? `${payload[name]},${val}` : val;
      }
    } else {
      payload[name] = value;
    }
  });
  return payload;
}

/**
 * POSTs the form payload to the configured endpoint.
 * Submission metadata (sent timestamp, referrer) is appended here, not in
 * constructPayload, so it is not evaluated on every change event.
 * @param {HTMLFormElement} form
 * @returns {Promise<Record<string, string>|null>} payload on success, null on failure
 */
async function submitForm(form) {
  const payload = {
    ...constructPayload(form),
    sent: new Date().toUTCString(),
    referrer: window.location.href,
  };
  const resp = await fetch(form.dataset.action, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (resp.ok) {
    await resp.text();
    return payload;
  }
  return null;
}

/**
 * Hides and removes the validation tooltip anchored to a field wrapper.
 * Waits for the CSS opacity transition to finish before removing the element.
 * @param {HTMLElement} wrapper - the .field-wrapper element owning the tooltip
 */
function removeFieldTooltip(wrapper) {
  const tooltip = wrapper?.querySelector('.field-tooltip');
  if (!tooltip) return;
  tooltip.classList.remove('is-visible');
  tooltip.addEventListener('transitionend', () => tooltip.remove(), { once: true });
}

/**
 * Shows a validation tooltip anchored below a field wrapper.
 * Any existing tooltips within the same form are dismissed first.
 * @param {HTMLElement} wrapper - the .field-wrapper element to anchor the tooltip to
 * @param {string} message - validation text to display
 */
function showFieldTooltip(wrapper, message) {
  if (!wrapper) return;
  wrapper.closest('form')?.querySelectorAll('.field-tooltip').forEach((existing) => {
    existing.classList.remove('is-visible');
    existing.addEventListener('transitionend', () => existing.remove(), { once: true });
  });
  const tooltip = document.createElement('div');
  tooltip.className = 'field-tooltip';
  const arrowWrap = document.createElement('div');
  arrowWrap.className = 'field-tooltip-arrow-wrap';
  const arrow = document.createElement('div');
  arrow.className = 'field-tooltip-arrow';
  arrowWrap.append(arrow);
  const msg = document.createElement('div');
  msg.className = 'field-tooltip-msg';
  msg.setAttribute('role', 'alert');
  msg.textContent = message;
  tooltip.append(arrowWrap, msg);
  wrapper.append(tooltip);
  // Double rAF ensures the element is painted at opacity:0 before transitioning to 1
  requestAnimationFrame(() => requestAnimationFrame(() => tooltip.classList.add('is-visible')));
}

/**
 * Finds the first invalid field wrapper within a scope, in DOM order.
 * Validates required fields, required checkbox groups, and email format.
 * Scoping to a single .form-step (rather than the whole form) is what lets
 * multi-step forms validate only the currently visible step.
 * @param {HTMLFormElement|HTMLElement} root - the form, or a single .form-step within it
 * @returns {{ el: HTMLElement, wrapper: HTMLElement, message: string }|null}
 */
function getFirstInvalid(root) {
  return Array.from(root.querySelectorAll('.field-wrapper')).reduce((found, wrapper) => {
    if (found) return found;
    const groupLabel = wrapper.querySelector('.checkbox-group-label.required');
    if (groupLabel) {
      const anyChecked = [...wrapper.querySelectorAll('input[type="checkbox"]')].some((cb) => cb.checked);
      return anyChecked ? null : { el: wrapper.querySelector('input[type="checkbox"]'), wrapper, message: t('Please select at least one option.') };
    }
    const el = wrapper.querySelector('input[required], select[required], textarea[required]');
    if (!el) return null;
    if (el.type === 'checkbox' && !el.checked) return { el, wrapper, message: t('This field is required.') };
    if (el.type !== 'checkbox' && !el.value.trim()) return { el, wrapper, message: t('This field is required.') };
    if (el.type === 'email' && !EMAIL_REGEX.test(el.value.trim())) return { el, wrapper, message: t('Must be valid email. example@yourdomain.com') };
    return null;
  }, null);
}

/**
 * Creates a submit or plain button element.
 * Submit buttons validate the current step (a .form-step ancestor, or the
 * whole form for single-step forms) on click, POST to the configured
 * endpoint, and handle the success redirect — either an inline plain-HTML
 * fragment or a full-page navigation. On failure the button is re-enabled
 * and an error message is appended below it.
 * @param {object} fd - field data object
 * @param {string} fd.Field - button name attribute
 * @param {string} fd.Type - 'submit' or 'button'
 * @param {string} fd.Label - visible button text
 * @param {string} [fd.Extra] - redirect URL after successful submission
 * @returns {HTMLButtonElement}
 */
function createButton(fd) {
  const {
    Field: name, Type: type, Label: text, Extra: redirectTo,
  } = fd;
  const button = document.createElement('button');
  button.name = name;
  button.textContent = text;
  button.classList.add('button');
  if (type === 'submit') {
    button.addEventListener('click', async (event) => {
      event.preventDefault();
      const form = button.closest('form');
      const scope = button.closest('.form-step') || form;
      const invalid = getFirstInvalid(scope);
      if (invalid) {
        showFieldTooltip(invalid.wrapper, invalid.message);
        invalid.el.focus();
        return;
      }
      button.setAttribute('disabled', '');
      form.querySelector('.form-error')?.remove();
      const payload = await submitForm(form);
      if (payload) {
        if (redirectTo?.endsWith('.plain.html')) {
          const resp = await fetch(redirectTo);
          if (resp.ok) {
            const html = await resp.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const main = doc.querySelector('main') || doc.body;
            const fragment = document.createDocumentFragment();
            [...main.childNodes].forEach((node) => fragment.append(node));
            decorateBlocks(fragment);
            button.closest('.block').replaceWith(fragment);
            await loadBlocks(fragment);
          }
        } else if (redirectTo) {
          window.location.href = redirectTo;
        }
      } else {
        button.removeAttribute('disabled');
        const errorMsg = document.createElement('p');
        errorMsg.className = 'form-error';
        errorMsg.textContent = t('Something went wrong. Please try again.');
        button.closest('.form-submit-wrapper')?.append(errorMsg);
      }
    });
  }
  return button;
}

/**
 * Creates an <h3> heading element for visual section breaks within a form.
 * @param {object} fd - field data object
 * @param {string} fd.Label - heading text
 * @returns {HTMLHeadingElement}
 */
function createHeading(fd) {
  const heading = document.createElement('h3');
  heading.textContent = fd.Label;
  return heading;
}

/**
 * Creates an <input> element for any standard HTML input type.
 * @param {object} fd - field data object
 * @param {string} fd.Type - input type (text, email, radio, checkbox, etc.)
 * @param {string} fd.Field - name and id attribute value
 * @param {string} [fd.Value] - initial value
 * @param {string} [fd.Placeholder] - placeholder text
 * @param {string} [fd.Mandatory] - 'x' marks the field as required
 * @returns {HTMLInputElement}
 */
function createInput(fd) {
  const {
    Type: type, Field: name, Value: value, Placeholder: placeholder, Mandatory: isRequired,
  } = fd;
  const input = document.createElement('input');
  input.type = type;
  input.id = name;
  input.name = name;
  if (value) input.value = value;
  if (placeholder) input.setAttribute('placeholder', placeholder);
  if (isRequired === 'x') input.setAttribute('required', 'required');
  return input;
}

/**
 * Creates a <textarea> element.
 * @param {object} fd - field data object
 * @param {string} fd.Field - name attribute value
 * @param {string} [fd.Value] - initial value
 * @param {string} [fd.Placeholder] - placeholder text
 * @param {string} [fd.Mandatory] - 'x' marks the field as required
 * @returns {HTMLTextAreaElement}
 */
function createTextArea(fd) {
  const {
    Field: name, Value: value, Placeholder: placeholder, Mandatory: isRequired,
  } = fd;
  const textarea = document.createElement('textarea');
  textarea.name = name;
  if (value) textarea.value = value;
  if (placeholder) textarea.setAttribute('placeholder', placeholder);
  if (isRequired === 'x') textarea.setAttribute('required', 'required');
  return textarea;
}

/**
 * Creates a <select> element populated from Options (see parseOptions).
 * Prepends a disabled placeholder option as the default visible choice.
 * @param {object} fd - field data object
 * @param {string} fd.Field - name attribute value
 * @param {string} fd.Options - option labels (used as both label and value)
 * @param {string} [fd.Placeholder] - placeholder option text (falls back to "Select...")
 * @param {string} [fd.Mandatory] - 'x' marks the field as required
 * @returns {HTMLSelectElement}
 */
function createSelect(fd) {
  const {
    Field: name, Options: options, Placeholder: placeholder, Mandatory: isRequired,
  } = fd;
  const select = document.createElement('select');
  select.name = name;
  const ph = document.createElement('option');
  ph.textContent = placeholder || t('Select...');
  ph.value = '';
  ph.setAttribute('selected', '');
  ph.setAttribute('disabled', '');
  select.append(ph);
  parseOptions(options).forEach((o) => {
    const option = document.createElement('option');
    option.textContent = o;
    option.value = o;
    select.append(option);
  });
  if (isRequired === 'x') select.setAttribute('required', 'required');
  return select;
}

/**
 * Creates a <label> element, optionally embedding a hyperlink within the label text.
 * The Extra field specifies an inline link formatted as "link text, href".
 * @param {object} fd - field data object
 * @param {string} fd.Field - id of the associated form control
 * @param {string} fd.Label - label text
 * @param {string} [fd.Extra] - optional inline link as "link text, href"
 * @param {string} [fd.Mandatory] - 'x' adds a required indicator
 * @returns {HTMLLabelElement}
 */
function createLabel(fd) {
  const {
    Field: id, Label: text, Extra: linkString, Mandatory: isRequired,
  } = fd;
  const label = document.createElement('label');
  label.setAttribute('for', id);
  label.textContent = text;
  if (isRequired === 'x') label.classList.add('required');
  if (linkString) {
    const [linkText, href] = linkString.split(',').map((str) => str.trim());
    if (href) {
      const labelTexts = label.textContent.split(linkText);
      label.innerHTML = '';
      const link = document.createElement('a');
      link.textContent = linkText;
      link.href = href;
      link.target = '_blank';
      label.append(labelTexts[0], link, labelTexts[1]);
    }
  }
  return label;
}

/**
 * Stores an arbitrary value on the form's dataset for use at submission time.
 * @param {object} fd - field data object
 * @param {HTMLFormElement} fd.form - the form element
 * @param {string} fd.Field - dataset key
 * @param {string} fd.Extra - value to store
 */
function addExtraFormData(fd) {
  fd.form.dataset[fd.Field] = fd.Extra;
}

/**
 * Overrides the form's POST endpoint from the content sheet.
 * Takes precedence over the placeholder-configured default endpoint.
 * @param {object} fd - field data object
 * @param {HTMLFormElement} fd.form - the form element
 * @param {string} [fd.Value] - endpoint URL (preferred)
 * @param {string} [fd.Extra] - fallback endpoint URL
 */
function setFormAction(fd) {
  fd.form.dataset.action = fd.Value || fd.Extra;
}

/**
 * Creates a <p> paragraph element for static informational text within a form.
 * @param {object} fd - field data object
 * @param {string} fd.Label - message text
 * @returns {HTMLParagraphElement}
 */
function createMessage(fd) {
  const p = document.createElement('p');
  p.textContent = fd.Label;
  return p;
}

/**
 * Creates a helper-text paragraph for a field, e.g. "Please do not include
 * parenthesis" under a Phone Number input. Applies to any field type via
 * buildField, appended after the field's own control(s).
 * @param {object} fd - field data object
 * @param {string} [fd.Description] - helper text; no element is created if absent
 * @returns {HTMLParagraphElement|undefined}
 */
function createDescription(fd) {
  if (!fd.Description) return undefined;
  const p = document.createElement('p');
  p.className = 'field-description';
  p.textContent = fd.Description;
  return p;
}

/**
 * Creates a group of related checkboxes from Options (see parseOptions).
 * Renders a shared group label followed by individual checkbox+label pairs.
 * @param {object} fd - field data object
 * @param {string} fd.Field - shared name attribute for all checkboxes in the group
 * @param {string} fd.Label - group label text
 * @param {string} fd.Options - option values
 * @param {string} [fd.Mandatory] - 'x' marks the group as required
 * @returns {DocumentFragment}
 */
function createCheckboxGroup(fd) {
  const {
    Field: name, Label: legend, Options: options, Mandatory: isRequired,
  } = fd;
  const fragment = document.createDocumentFragment();
  const groupLabel = document.createElement('span');
  groupLabel.classList.add('checkbox-group-label');
  groupLabel.textContent = legend;
  if (isRequired === 'x') groupLabel.classList.add('required');
  fragment.append(groupLabel);
  parseOptions(options).forEach((option, i) => {
    const item = document.createElement('div');
    item.classList.add('checkbox-item');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = `${name}-${i}`;
    input.name = name;
    input.value = option;
    const label = document.createElement('label');
    label.setAttribute('for', `${name}-${i}`);
    label.textContent = option;
    item.append(input, label);
    fragment.append(item);
  });
  return fragment;
}

/**
 * Creates a group of mutually-exclusive radio buttons from Options (see
 * parseOptions). Structurally mirrors createCheckboxGroup, but inputs share
 * a name (so only one can be selected) and use type="radio".
 * @param {object} fd - field data object
 * @param {string} fd.Field - shared name attribute for all radios in the group
 * @param {string} fd.Label - group label text
 * @param {string} fd.Options - option values
 * @param {string} [fd.Mandatory] - 'x' marks the group as required
 * @returns {DocumentFragment}
 */
function createRadioGroup(fd) {
  const {
    Field: name, Label: legend, Options: options, Mandatory: isRequired,
  } = fd;
  const fragment = document.createDocumentFragment();
  const groupLabel = document.createElement('span');
  groupLabel.classList.add('checkbox-group-label');
  groupLabel.textContent = legend;
  if (isRequired === 'x') groupLabel.classList.add('required');
  fragment.append(groupLabel);
  parseOptions(options).forEach((option, i) => {
    const item = document.createElement('div');
    item.classList.add('checkbox-item');
    const input = document.createElement('input');
    input.type = 'radio';
    input.id = `${name}-${i}`;
    input.name = name;
    input.value = option;
    if (isRequired === 'x') input.setAttribute('required', 'required');
    const label = document.createElement('label');
    label.setAttribute('for', `${name}-${i}`);
    label.textContent = option;
    item.append(input, label);
    fragment.append(item);
  });
  return fragment;
}

/**
 * Shows or hides field wrappers based on their configured visibility rules.
 * Currently supports 'visible' rules with an 'eq' (equals) operator.
 * @param {HTMLFormElement} form
 * @param {
 *  Array<{
 *    fieldId: string,
 *    rule: {
 *      type: string,
 *      condition: {
 *        key: string,
 *        operator: string,
 *        value: string
 *      }
 *    }
 *   }>
 * } rules
 */
function applyRules(form, rules) {
  const payload = constructPayload(form);
  rules.forEach(({ fieldId, rule }) => {
    const { type, condition: { key, operator, value } } = rule;
    if (type === 'visible' && operator === 'eq') {
      form.querySelector(`.${fieldId}`)?.classList.toggle('hidden', payload[key] !== value);
    }
  });
}

/**
 * Maps a field type to the ordered list of creator functions that build its DOM.
 * A checkbox or radio field with Options renders as a group; all other
 * types use the lookup table.
 * @param {object} fd - field data object
 * @param {string} fd.Type - field type from the content sheet
 * @param {string} [fd.Options] - presence triggers group rendering for checkbox/radio
 * @returns {Array<Function>}
 */
function getFieldFunctionsByType(fd) {
  const type = fd.Type || 'message';
  if (type === 'checkbox' && fd.Options) return [createCheckboxGroup];
  if (type === 'radio' && fd.Options) return [createRadioGroup];
  const fieldType = {
    select: [createLabel, createSelect],
    heading: [createHeading],
    checkbox: [createInput, createLabel],
    'text-area': [createLabel, createTextArea],
    button: [createButton],
    submit: [createButton],
    data: [addExtraFormData],
    action: [setFormAction],
    message: [createMessage],
  };
  return fieldType[type] ?? [createLabel, createInput];
}

/**
 * Builds one field's wrapper (or row, when grouped via Style) and appends it
 * to the given container. Shared by both single-step forms (container is the
 * form itself) and multi-step forms (container is the current .form-step).
 * @param {object} fd - field data object (mutated: fd.form is set)
 * @param {HTMLFormElement} form - the form element, stored on fd for handlers that need it
 * @param {HTMLElement} container - element to append the built field into
 * @param {Array} rules - shared rules accumulator; visibility rules found on fd are pushed here
 */
const NON_LABEL_TYPES = new Set(['action', 'data']);

/**
 * Falls back to Value as the display label when Label is absent — the
 * convention actually used across authored sheets (no separate Label
 * column). Value is then cleared so createInput/createTextArea don't also
 * treat it as a pre-filled value. Skipped for action/data rows, which use
 * Value/Extra for their own non-label purpose (endpoint URL, stored data).
 * @param {object} fd - field data object (mutated)
 * @param {string} type - resolved field type
 */
function resolveLabel(fd, type) {
  if (!fd.Label && fd.Value && !NON_LABEL_TYPES.has(type)) {
    fd.Label = fd.Value;
    delete fd.Value;
  }
}

function buildField(fd, form, container, rules) {
  fd.form = form;
  const type = fd.Type || 'text';
  resolveLabel(fd, type);
  const { Style: theme, Rules: fieldRules } = fd;
  const fieldClass = `form-${type}-wrapper${theme ? ` form-${theme}` : ''}`;
  const fieldWrapper = document.createElement('div');
  fieldWrapper.className = `${fieldClass} field-wrapper`;
  getFieldFunctionsByType(fd).forEach((createField) => {
    const field = createField(fd);
    if (field) fieldWrapper.append(field);
  });
  const description = createDescription(fd);
  if (description) fieldWrapper.append(description);
  if (fieldRules) {
    try {
      rules.push({ fieldId: fieldClass, rule: JSON.parse(fieldRules) });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(`Invalid Rule ${fieldRules}: ${e}`);
    }
  }
  if (!fieldWrapper.children.length) return;
  if (theme) {
    const lastChild = container.lastElementChild;
    if (lastChild?.dataset.rowStyle === theme) {
      lastChild.append(fieldWrapper);
    } else {
      const row = document.createElement('div');
      row.className = 'fields-row';
      row.dataset.rowStyle = theme;
      row.append(fieldWrapper);
      container.append(row);
    }
  } else {
    container.append(fieldWrapper);
  }
}

/**
 * Builds a multi-step form: one .form-step per sheet (in :names order,
 * excluding "config"), auto-generated Back/Next navigation gated on
 * per-step validation, and a progress indicator. The final step's own
 * submit button (authored in its sheet) performs the real submission.
 * The "config" sheet supplies key/value settings — currently just
 * "endpoint", the POST target (falls back to the placeholder-configured
 * default, same as single-step forms, if absent).
 * @param {object} json - the fetched multi-sheet JSON
 * @param {HTMLFormElement} form
 * @returns {Array} rules - visibility rules collected across all steps
 */
function buildMultiStepForm(json, form) {
  const rules = [];
  const configMap = {};
  (json.config?.data ?? []).forEach(({ key, value }) => { configMap[key] = value; });
  form.dataset.action = configMap.endpoint || t('Form Submit Endpoint', 'https://api.example.com/forms/submit');

  const stepNames = (json[':names'] ?? Object.keys(json)).filter((name) => name !== 'config');

  const progress = document.createElement('div');
  progress.className = 'form-progress';
  form.append(progress);

  const steps = stepNames.map((stepName, stepIndex) => {
    const step = document.createElement('div');
    step.className = 'form-step';
    step.dataset.step = stepName;
    if (stepIndex > 0) step.classList.add('hidden');

    const heading = document.createElement('h2');
    heading.textContent = titleCase(stepName);
    step.append(heading);

    (json[stepName]?.data ?? []).forEach((fd) => {
      buildField(fd, form, step, rules);
    });

    form.append(step);
    return step;
  });

  const showStep = (index) => {
    steps.forEach((step, i) => step.classList.toggle('hidden', i !== index));
    progress.textContent = t('Step {0} of {1}', `Step ${index + 1} of ${steps.length}`)
      .replace('{0}', index + 1).replace('{1}', steps.length);
    applyRules(form, rules);
  };

  steps.forEach((step, index) => {
    const nav = document.createElement('div');
    nav.className = 'form-step-nav';
    if (index > 0) {
      const back = document.createElement('button');
      back.type = 'button';
      back.className = 'button form-step-back';
      back.textContent = t('Back');
      back.addEventListener('click', () => showStep(index - 1));
      nav.append(back);
    }
    if (index < steps.length - 1) {
      const next = document.createElement('button');
      next.type = 'button';
      next.className = 'button form-step-next';
      next.textContent = t('Next');
      next.addEventListener('click', () => {
        const invalid = getFirstInvalid(step);
        if (invalid) {
          showFieldTooltip(invalid.wrapper, invalid.message);
          invalid.el.focus();
          return;
        }
        showStep(index + 1);
      });
      nav.append(next);
    }
    if (nav.children.length) step.append(nav);
  });

  showStep(0);
  return rules;
}

/**
 * Fetches the form definition JSON and builds the <form> element. Dispatches
 * to a single flat field list (single-step) or a multi-step build (when the
 * JSON is a DA multi-sheet document, `:type === "multi-sheet"`), wires up
 * change-driven visibility rules, and attaches blur/input validation.
 * @param {URL} formURL - URL of the form definition JSON
 * @returns {Promise<HTMLFormElement>}
 */
async function createForm(formURL) {
  const { pathname } = formURL;
  const resp = await fetch(pathname);
  const json = await resp.json();
  const form = document.createElement('form');
  form.dataset.action = t('Form Submit Endpoint', 'https://api.example.com/forms/submit');
  form.id = pathname.split('/').pop().replace('.json', '');

  let rules;
  if (json[':type'] === 'multi-sheet') {
    form.classList.add('is-multi-step');
    rules = buildMultiStepForm(json, form);
  } else {
    rules = [];
    json.data.forEach((fd) => buildField(fd, form, form, rules));
  }

  form.noValidate = true;
  form.addEventListener('change', () => applyRules(form, rules));
  applyRules(form, rules);

  // Blur validation: show tooltip on required empty/invalid fields, clear on valid input
  form.querySelectorAll('input[required], select[required], textarea[required]').forEach((el) => {
    const getWrapper = () => el.closest('.field-wrapper');
    const clearTooltip = () => removeFieldTooltip(getWrapper());
    el.addEventListener('blur', () => {
      const empty = el.type === 'checkbox' ? !el.checked : !el.value.trim();
      if (empty) showFieldTooltip(getWrapper(), t('This field is required.'));
      else if (el.type === 'email' && !EMAIL_REGEX.test(el.value.trim())) showFieldTooltip(getWrapper(), t('Must be valid email. example@yourdomain.com'));
      else clearTooltip();
    });
    const clearEvent = (el.type === 'checkbox' || el.tagName === 'SELECT') ? 'change' : 'input';
    el.addEventListener(clearEvent, () => {
      if (el.type === 'checkbox' ? el.checked : el.value.trim()) clearTooltip();
    });
  });

  // Checkbox group: clear tooltip when any option is checked
  form.querySelectorAll('.form-checkbox-wrapper').forEach((cbWrapper) => {
    if (!cbWrapper.querySelector('.checkbox-group-label.required')) return;
    cbWrapper.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.addEventListener('change', () => { if (cb.checked) removeFieldTooltip(cbWrapper); });
    });
  });

  return form;
}

/**
 * Decorates the form block: fetches the linked form definition JSON and
 * builds the form.
 * @param {HTMLElement} block
 * @returns {Promise<void>}
 */
export default async function decorate(block) {
  try {
    const link = block.querySelector('a[href]');
    const target = new URL(link?.href);
    if (target.pathname.endsWith('.json')) {
      placeholders = await fetchPlaceholders();
      const form = await createForm(target);
      block.replaceChildren(form);
    } else {
      throw new Error(`Unsupported form URL: ${target.href}`);
    }
  } catch (error) {
    block.innerHTML = window.location.hostname.endsWith('.page')
      ? `Invalid form configuration: ${error}`
      : '<!-- invalid form configuration -->';
    // eslint-disable-next-line no-console
    console.error(error);
  }
}
