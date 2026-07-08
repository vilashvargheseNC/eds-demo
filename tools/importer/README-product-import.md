# STANLEY Access product page import

`import.js` in this folder transforms `stanleyaccess.com/products/*` pages
(all share the same Drupal template) into our block structure:

- `hero-tabs` — category tag, H1, tagline, Overview/Specs/Compare tab links, CTA buttons
- `download-list` — Popular Downloads heading + PDF links
- `carousel` — hero product image carousel
- `columns` (existing local block) — Features and Benefits (image + bullet list)
- `model-showcase` — Two-Panel/Four-Panel (or N-panel) model entries
- `cards` (existing local block) — Add-Ons & Accessories, and Add-Ons/Related
  products using the `related-products` variant
- default content — back link, section headings, "Speak with an Expert" CTA

`drafts/products/dura-care-7200.html` is the hand-verified reference output —
diff any bulk-imported sibling page against it before trusting the batch run.

## Running a single-page test import

1. `cd tools/importer/helix-importer-ui && npm install`
2. Serve the importer UI (see its README) and point "Import - Workbench" at
   this project's `import.js`.
3. Import one sibling product URL (e.g. a different door model) and compare
   the block set against `dura-care-7200.html`.
4. If the page has extra/missing sections (e.g. no downloads box, more than
   2 models, a compare table), extend the relevant `create*` function in
   `import.js` rather than one-off patching the output.

## Running the bulk import

Once 2-3 sibling pages match expectations, use "Import - Bulk" with the full
list of `/products/*` URLs and the same `import.js`.

## Known simplifications

- The footer's "Get In Touch / Get Started / Get Service" 3-icon row is part
  of the global footer template, not page content — it's removed along with
  `<footer>` and should never appear in imported product pages.
- `model-showcase` reproduces the source's scroll-driven active-entry
  highlight; the importer does not need to reproduce that — it just extracts
  the repeatable image/heading/description entries.
