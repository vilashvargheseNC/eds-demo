# STANLEY Access product page import

`import.js` in this folder transforms `stanleyaccess.com/products/*` pages
(all share the same Drupal template) into our block structure:

- `hero-tabs` — category tag, H1, tagline, Overview/Specs/Compare tab links, CTA buttons
- `download-list` — Popular Downloads heading + PDF links
- `carousel` — hero product image carousel (any number of images, deduped
  from slick's cloned slides)
- `columns` (existing local block) — one instance per
  `.paragraph--type--bp-columns` found (a page can have 1-N of these stacked
  in the same grey section, e.g. "The Dura-Care Difference" + a
  reverse-order "Features and Benefits"); column order is taken directly
  from the source DOM, so reverse-order instances are handled automatically
- `model-showcase` — Two-Panel/Four-Panel (or N-panel) model entries;
  **optional** — omitted entirely on pages with no
  `.component--scroll-slider` (e.g. Dura-Care 7000TL has no model variants)
- `cards` (existing local block) — Add-Ons & Accessories, and Add-Ons/Related
  products using the `related-products` variant
- default content — back link, section headings, "Speak with an Expert" CTA

Validated against two real pages so far — Dura-Care 7200 (2 carousel images,
1 columns instance, has model-showcase) and Dura-Care 7000TL (5 carousel
images, 2 columns instances one reversed, no model-showcase) — both pushed
live to `sat/products/*` in DA and confirmed rendering correctly with zero
console errors. Diff any further bulk-imported page against these two
before trusting a full batch run.

## Running a single-page test import

1. `cd tools/importer/helix-importer-ui && npm install`
2. Serve the importer UI (see its README) and point "Import - Workbench" at
   this project's `import.js`.
3. Import one sibling product URL (e.g. a different door model) and compare
   the block set against the two reference pages already in DA:
   `sat/products/dura-care-7200` and `sat/products/dura-care-7000tl`.
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
