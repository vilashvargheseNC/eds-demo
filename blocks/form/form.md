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
| `Options` | Newline-delimited list. Powers `select` options and `checkbox` groups. |
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
| `checkbox` (with `Options`) | Checkbox group, one input per option |
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

## Minimal example

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
