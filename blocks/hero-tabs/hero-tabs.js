export default function decorate(block) {
  const rows = [...block.children];

  const textRows = [];
  const linkRows = [];
  rows.forEach((row) => {
    const link = row.querySelector('a');
    if (link) linkRows.push(link);
    else textRows.push(row.querySelector('div') || row);
  });

  const [badgeRow, titleRow, taglineRow] = textRows;
  const tabLinks = linkRows.slice(0, 3);
  const ctaLinks = linkRows.slice(3);

  let badgeEl;
  if (badgeRow) {
    badgeEl = document.createElement('p');
    badgeEl.className = 'hero-tabs-badge';
    badgeEl.append(...badgeRow.childNodes);
  }

  let titleEl;
  if (titleRow) {
    const existingHeading = titleRow.querySelector('h1, h2, h3');
    titleEl = existingHeading || document.createElement('h1');
    if (!existingHeading) titleEl.append(...titleRow.childNodes);
  }

  let taglineEl;
  if (taglineRow) {
    taglineEl = document.createElement('p');
    taglineEl.className = 'hero-tabs-tagline';
    taglineEl.append(...taglineRow.childNodes);
  }

  let tabsNav;
  if (tabLinks.length) {
    tabsNav = document.createElement('nav');
    tabsNav.className = 'hero-tabs-tabs';
    tabsNav.setAttribute('aria-label', 'Product sections');
    const ul = document.createElement('ul');
    tabLinks.forEach((a) => {
      if (a.pathname === window.location.pathname) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      }
      const li = document.createElement('li');
      li.append(a);
      ul.append(li);
    });
    tabsNav.append(ul);
  }

  let ctasEl;
  if (ctaLinks.length) {
    ctasEl = document.createElement('p');
    ctasEl.className = 'hero-tabs-ctas button-wrapper';
    ctaLinks.forEach((a, i) => {
      a.classList.add('button', i === 0 ? 'secondary' : 'primary');
      ctasEl.append(a);
    });
  }

  block.replaceChildren(...[badgeEl, titleEl, taglineEl, tabsNav, ctasEl].filter(Boolean));
}
