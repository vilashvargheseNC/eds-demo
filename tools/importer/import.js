/* global WebImporter */
/* eslint-disable no-console, class-methods-use-this */

/**
 * Import rules for STANLEY Access Technologies product pages
 * (https://www.stanleyaccess.com/products/*).
 *
 * All product pages share the same Drupal template, so this file is written
 * to be reused across the full product catalog via the Bulk Import tool, not
 * just this one page. When adding a new sibling product page to the import
 * list, first do a single-page "Import - Workbench" run and diff the result
 * against this page's block set before trusting the bulk run.
 */

const createHeroTabs = (main, document) => {
  const hero = main.querySelector('.hero-product');
  if (!hero) return;

  const tag = hero.querySelector('.product-tag');
  const title = hero.querySelector('.product-title h1');
  const tagline = hero.querySelector('.product-desc');
  const tabLinks = [...hero.querySelectorAll('.product-tabs__product-modes a')];
  const ctaLinks = [...hero.querySelectorAll('.product-tabs__links a')];

  const cells = [
    ['hero-tabs'],
    [tag ? tag.textContent.trim() : ''],
    [title],
    [tagline],
    ...tabLinks.map((a) => [a]),
    ...ctaLinks.map((a) => [a]),
  ];

  const block = WebImporter.DOMUtils.createTable(cells, document);
  hero.before(block);
};

const createDownloadList = (main, document) => {
  const box = main.querySelector('.popular-products');
  if (!box) return;

  const heading = box.querySelector('.popular-products__title');
  const links = [...box.querySelectorAll('.popular-products__links a')];
  const viewAll = box.querySelector('.popular-products__default-link a');

  const cells = [
    ['download-list'],
    [heading ? heading.textContent.trim() : 'Popular Downloads'],
    ...links.map((a) => [a]),
  ];
  if (viewAll) cells.push([viewAll]);

  const block = WebImporter.DOMUtils.createTable(cells, document);
  box.closest('.popular-products__wrapper').replaceWith(block);
};

const createCarousel = (main, document) => {
  const slider = main.querySelector('.product-image-slider .slick-track, .product-image-slider');
  if (!slider) return;

  // slick creates cloned slides for infinite-loop behavior; dedupe by src.
  const seen = new Set();
  const images = [...slider.querySelectorAll('img')].filter((img) => {
    if (seen.has(img.src)) return false;
    seen.add(img.src);
    return true;
  });
  if (!images.length) return;

  const cells = [
    ['carousel'],
    ...images.map((img) => [img]),
  ];

  const block = WebImporter.DOMUtils.createTable(cells, document);
  main.querySelector('.product-image-slider').replaceWith(block);
};

const createFeatures = (main, document) => {
  // Product pages have 1-N ".paragraph--type--bp-columns" instances stacked
  // inside one shared grey background section (e.g. Dura-Care 7200 has one
  // "Features and Benefits"; Dura-Care 7000TL has two: "The Dura-Care
  // Difference" then a reverse-order "Features and Benefits"). Each becomes
  // its own "columns" block, using the source DOM's own column order -
  // "component-style--reverse-responsive" instances already put the text
  // column before the image column in the markup itself, so no special
  // casing is needed, just preserve document order.
  const instances = [...main.querySelectorAll('.paragraph--type--bp-columns')];
  if (!instances.length) return;

  const outerSection = instances[0].closest('.paragraph--type--background') || instances[0].parentElement;

  const tables = instances.map((instance) => {
    const cols = [...instance.querySelectorAll(':scope > .content-column-wrapper > .paragraph--type--bp-columns__2col')];
    const cells = cols.map((col) => {
      const img = col.querySelector('.paragraph--type--bp-image img');
      if (img) return img;

      const heading = col.querySelector('.component-wysiwyg__header h2');
      const list = col.querySelector('.component-wysiwyg__text ul');
      const para = col.querySelector('.component-wysiwyg__text p');
      const cell = document.createElement('div');
      if (heading) cell.append(heading);
      if (list) cell.append(list);
      else if (para) cell.append(para);
      return cell;
    });
    return WebImporter.DOMUtils.createTable([['columns'], cells], document);
  });

  outerSection.replaceWith(...tables);

  const metaCells = [['Section Metadata'], ['Style', 'grey']];
  tables[0].before(WebImporter.DOMUtils.createTable(metaCells, document));
};

const createModelShowcase = (main, document) => {
  const wrapper = main.querySelector('.component--scroll-slider');
  if (!wrapper) return;

  const heading = wrapper.querySelector('.component--scroll-slider__header h2');
  const intro = wrapper.querySelector('.component--scroll-slider__header p');

  const cards = [...wrapper.querySelectorAll('.scroll-slider-card')].map((card) => {
    const text = card.querySelector(':scope > .scroll-slider-card__slider-text');
    const cardHeading = text ? text.querySelector('h2, h3, h4') : null;
    const cardDesc = text ? text.querySelector('p') : null;
    const cardImg = card.querySelector(':scope > .scroll-slider-card__image img');
    return [cardImg, [cardHeading, cardDesc].filter(Boolean)];
  });

  const cells = [
    ['model-showcase'],
    ...cards,
  ];
  const table = WebImporter.DOMUtils.createTable(cells, document);

  const intro2col = document.createElement('div');
  if (heading) intro2col.append(heading);
  if (intro) intro2col.append(intro);

  const section = wrapper.closest('.paragraph--type--background') || wrapper;
  section.replaceWith(intro2col, table);

  const metaCells = [['Section Metadata'], ['Style', 'dark']];
  intro2col.before(WebImporter.DOMUtils.createTable(metaCells, document));
};

const createAccessoryCards = (main, document) => {
  const wrapper = main.querySelector('.component--image-links');
  if (!wrapper) return;

  const heading = wrapper.querySelector('.component--image-links > .title, .component--image-links__prefix + .title');
  const items = [...wrapper.querySelectorAll('.component--image-link')];

  const cells = [
    ['cards'],
    ...items.map((item) => {
      const img = item.querySelector('img');
      const link = item.querySelector('a');
      const label = item.querySelector('.component--image-link__text-header');
      if (link && label) {
        const a = document.createElement('a');
        a.href = link.href;
        a.textContent = label.textContent.trim();
        const h3 = document.createElement('h3');
        h3.append(a);
        return [img, h3];
      }
      return [img, label];
    }),
  ];

  const table = WebImporter.DOMUtils.createTable(cells, document);
  wrapper.replaceWith(table);
  if (heading) table.before(heading);
};

const createCtaBanner = (main, document) => {
  const cta = main.querySelector('.component--cta');
  if (!cta) return;

  // Note: .component--cta__content > img is the source site's lazy-load
  // skeleton placeholder graphic (a decorative "loading" SVG), not a real
  // authored icon - intentionally excluded.
  const heading = cta.querySelector('.component--cta__label');
  const link = cta.querySelector('.component--cta__right a');

  const wrapper = document.createElement('div');
  if (heading) wrapper.append(heading);
  if (link) {
    const p = document.createElement('p');
    p.append(link);
    wrapper.append(p);
  }

  cta.replaceWith(wrapper);

  const metaCells = [['Section Metadata'], ['Style', 'dark']];
  wrapper.before(WebImporter.DOMUtils.createTable(metaCells, document));
};

const createRelatedProducts = (main, document) => {
  const wrapper = main.querySelector('.paragraph--type--related-products');
  if (!wrapper) return;

  const heading = wrapper.querySelector('.title-wrapper h2');
  const seeAll = wrapper.querySelector('.link-wrapper a');

  const teasers = [...wrapper.querySelectorAll('.product-teaser-wrapper')];
  const cells = [
    ['cards (related-products)'],
    ...teasers.map((teaser) => {
      const img = teaser.querySelector(':scope .field--name-field-product-featured-image img');
      const tag = teaser.querySelector(':scope .field--name-field-product-type');
      const category = teaser.querySelector(':scope .field--name-field-product-category h4');
      const model = teaser.querySelector(':scope .field--name-field-product-model');
      const bullets = [...teaser.querySelectorAll(':scope .field--name-field-product-teaser-callout .caption-text')];
      const seeDetails = teaser.querySelector(':scope .see-all-wrapper span, :scope .see-all-wrapper a');

      const body = document.createElement('div');
      if (tag) body.append(document.createElement('p')).append(tag.textContent.trim());
      if (category) body.append(category);
      if (model) {
        const p = document.createElement('p');
        p.textContent = model.textContent.trim();
        body.append(p);
      }
      if (bullets.length) {
        const ul = document.createElement('ul');
        bullets.forEach((b) => {
          const li = document.createElement('li');
          li.innerHTML = b.innerHTML;
          ul.append(li);
        });
        body.append(ul);
      }
      if (seeDetails) {
        const a = document.createElement('a');
        a.href = teaser.href;
        a.textContent = seeDetails.textContent.trim();
        const p = document.createElement('p');
        p.append(a);
        body.append(p);
      }

      return [img, body];
    }),
  ];

  const table = WebImporter.DOMUtils.createTable(cells, document);
  const section = wrapper.closest('.fluid-full.black') || wrapper;
  section.replaceWith(table);
  if (heading) table.before(heading);
  if (seeAll) {
    const p = document.createElement('p');
    p.append(seeAll);
    table.before(p);
  }

  const metaCells = [['Section Metadata'], ['Style', 'dark']];
  (heading || table).before(WebImporter.DOMUtils.createTable(metaCells, document));
};

const createMetadata = (main, document) => {
  const meta = {};

  const title = document.querySelector('title');
  if (title) meta.Title = title.textContent.replace(/\s*\|\s*STANLEY.*$/, '').trim();

  const desc = document.querySelector('[property="og:description"], [name="description"]');
  if (desc) meta.Description = desc.content;

  const ogImage = document.querySelector('[property="og:image"]');
  if (ogImage) {
    const el = document.createElement('img');
    el.src = ogImage.content;
    meta.Image = el;
  }

  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  main.append(block);
  return meta;
};

export default {
  transformDOM: ({ document }) => {
    const main = document.querySelector('main') || document.body;

    // Drop chrome that isn't per-page authored content: nav, footer,
    // cookie/consent widgets, hidden regions, and the sticky mobile menu dup.
    WebImporter.DOMUtils.remove(main, [
      'header',
      'footer',
      'nav',
      '.hidden',
      '.sticky-menu__mobile',
      '#onetrust-consent-sdk',
      'script',
      'noscript',
    ]);

    // Back link stays as default content (plain paragraph link).
    const backLink = main.querySelector('.back-link-secondary');
    if (backLink) {
      const p = document.createElement('p');
      p.append(backLink);
      main.querySelector('.product-hero')?.before(p);
    }

    createDownloadList(main, document);
    createCarousel(main, document);
    createHeroTabs(main, document);
    createFeatures(main, document);
    createModelShowcase(main, document);
    createAccessoryCards(main, document);
    createCtaBanner(main, document);
    createRelatedProducts(main, document);

    createMetadata(main, document);

    return main;
  },

  generateDocumentPath: ({ url }) => {
    const { pathname } = new URL(url);
    return WebImporter.FileUtils.sanitizePath(pathname.replace(/\/$/, ''));
  },
};
