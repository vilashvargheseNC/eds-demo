import { decorateIcons } from '../../scripts/aem.js';

export default function decorate(block) {
  const rows = [...block.children];

  let heading;
  const linkRows = [];
  rows.forEach((row) => {
    const link = row.querySelector('a');
    if (link) {
      linkRows.push(link);
    } else if (!heading) {
      heading = row.querySelector('div') || row;
    }
  });

  const viewAllLink = linkRows.pop();

  const headingEl = document.createElement('p');
  headingEl.className = 'download-list-heading';
  if (heading) headingEl.append(...heading.childNodes);

  const list = document.createElement('ul');
  list.className = 'download-list-items';
  linkRows.forEach((link) => {
    const li = document.createElement('li');
    const icon = document.createElement('span');
    icon.className = 'icon icon-document';
    li.append(icon, link);
    list.append(li);
  });

  const viewAllP = document.createElement('p');
  viewAllP.className = 'download-list-view-all';
  if (viewAllLink) viewAllP.append(viewAllLink);

  const children = [headingEl];
  if (linkRows.length) children.push(list);
  if (viewAllLink) children.push(viewAllP);

  block.replaceChildren(...children);
  decorateIcons(block);
}
