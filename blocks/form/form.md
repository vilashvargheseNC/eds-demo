# Form

Renders an HTML form from a JSON-driven definition ("form sheet") rather than
raw hand-authored markup. Authors edit a spreadsheet-like document; the block
fetches it as JSON and builds the `<form>` at render time.

## Authoring model

1. Create a sheet document (e.g. `/form/contact-us.json`) with one row per
   form field, in the column schema below.
2. In the page, add a `form` block containing a single link to that sheet's
   JSON URL:
   ```
   | Form                          |
   |-------------------------------|
   | /form/contact-us.json         |
   ```
3. `decorate()` fetches the JSON, builds the form, and replaces the block's
   contents with it.

## Field schema

Each row in the sheet's `data` array supports these columns:

| Column | Purpose |
|---|---|
| `Field` | Input `name`/`id`. Required for every field row. |
| `Type` | See [Field types](#field-types) below. Defaults to a text input if omitted. |
| `Label` | Visible label text, button text, heading text, or message text (depending on `Type`). |
| `Mandatory` | `x` marks the field required. |
| `Placeholder` | Placeholder text (inputs, textareas) or placeholder option (select). |
| `Description` | Optional helper text rendered below the field's control, e.g. "Please do not include parenthesis" under a phone number input. Works on any field type. |
| `Options` | Option list for `select`, `checkbox` groups, and `radio` groups. Comma-delimited by default; if the value contains a newline, it's split on newlines instead (use this when an option's own text needs a literal comma). |
| `Style` | Consecutive rows sharing the same value are grouped into one side-by-side `fields-row`. |
| `Value` | Initial field value, or the endpoint override for an `action` row. |
| `Extra` | Multi-purpose: inline link as `"link text, https://example.com"` on a label; redirect URL on a `submit` button; fallback endpoint on an `action` row. |
| `Rules` | JSON visibility rule, e.g. `{"type":"visible","condition":{"key":"contactMethod","operator":"eq","value":"phone"}}`. |

## Field types

| `Type` | Renders |
|---|---|
| `text`, `email`, `tel`, ... (or omitted) | Labeled `<input>` of that HTML input type |
| `text-area` | Labeled `<textarea>` |
| `select` | Labeled `<select>` populated from `Options` |
| `checkbox` (no `Options`) | Single labeled checkbox |
| `checkbox` (with `Options`) | Checkbox group, one input per option (multiple selectable) |
| `radio` (with `Options`) | Radio group, one input per option (single selectable) |
| `heading` | `<h3>` — visual section break |
| `message` | Static `<p>` — informational text |
| `button` | Plain (non-submitting) `<button>` |
| `submit` | Submit `<button>`; validates the form, POSTs the payload, then redirects (`Extra`) or shows an inline error |
| `data` | Stores `Extra` on `form.dataset[Field]` — not rendered |
| `action` | Sets the form's POST endpoint from `Value` (or `Extra`) — not rendered |

## Submission

On submit, all named field values are collected into a JSON payload (plus
`sent` and `referrer` metadata) and POSTed to `form.dataset.action`. That
endpoint comes from, in order of precedence:

1. An `action`-type row in the sheet (`Value` or `Extra`)
2. The `"Form Submit Endpoint"` placeholder
3. A hardcoded fallback URL

Required fields, required checkbox groups, and email format are validated
on blur and on submit, surfaced as inline tooltips anchored to each field.

## Minimal example (single-step)

```json
{
  "data": [
    { "Field": "endpoint", "Type": "action", "Value": "https://example.com/api/forms/submit" },
    { "Field": "name", "Type": "text", "Label": "Name", "Mandatory": "x" },
    { "Field": "email", "Type": "email", "Label": "Email", "Mandatory": "x" },
    { "Field": "message", "Type": "text-area", "Label": "Message" },
    { "Field": "submit", "Type": "submit", "Label": "Send" }
  ]
}
```

## Multi-step forms

The same `form` block also renders multi-step wizards. Instead of one flat
`data` array, author a **multi-sheet** DA document: one sheet per step, plus
a `config` sheet for form-wide settings. The block detects this shape via
the standard DA/AEM multi-sheet marker (`":type": "multi-sheet"`) that DA
adds automatically when a document has multiple sheets — nothing extra to
author for that part.

```
| Sheet name          | Contents |
|----------------------|---------|
| primary-details      | Field rows for step 1 |
| site-location        | Field rows for step 2 |
| door-problem         | Field rows for step 3 |
| billing-information  | Field rows for step 4 (includes the final `submit` row) |
| config               | Form-wide key/value settings |
```

The step sheets use the same `Field`/`Type`/`Mandatory`/`Options` columns as
single-step forms, but use **`Value` as the display label** instead of a
separate `Label` column:

```json
{ "Field": "firstName", "Type": "text", "Value": "First Name", "Mandatory": "x" }
```

(`Label` still works if present — `Value` is only used as a label fallback,
and only for multi-step sheets, so single-step sheets that use `Value` for
an actual pre-filled value are unaffected.)

The `config` sheet uses a distinct `key`/`value` schema instead:

```json
{ "data": [ { "key": "endpoint", "value": "https://example.com/api/forms/submit" } ] }
```

**Behavior:**
- Steps render in the document's sheet order (excluding `config`), each as
  its own `.form-step`, titled from the sheet name (`site-location` →
  "Site Location").
- Only the active step is visible; all others get `.hidden`.
- Auto-generated **Back**/**Next** buttons appear on every step except the
  first/last respectively. **Next** validates only the current step's
  required fields (via the same tooltip UI as single-step forms) before
  advancing — a step is never left with invalid required fields.
- There's no auto-generated submit button: the **last step's own sheet**
  must include a `Type: submit` row, same as single-step forms. That
  button's validation is scoped to the last step only (earlier steps were
  already gated by their own Next click).
- The POST endpoint comes from `config`'s `endpoint` key, falling back to
  the `"Form Submit Endpoint"` placeholder if absent — same fallback chain
  as single-step forms.

**Known content-authoring gotcha:** since `Options` defaults to
comma-delimited, an option whose own text contains a comma (e.g. `"No
function, reset: no result"`) will be split incorrectly. Use newline
delimiters for that `Options` cell instead — the block auto-detects
whichever delimiter is present.
