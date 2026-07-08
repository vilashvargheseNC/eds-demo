import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const pictures = [];
  const entries = document.createElement('ul');
  entries.className = 'model-showcase-entries';

  rows.forEach((row, i) => {
    const [imageCell, textCell] = row.children;
    const img = imageCell?.querySelector('img');
    pictures.push(img ? createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]) : null);

    const li = document.createElement('li');
    li.className = 'model-showcase-entry';
    li.dataset.index = i;
    if (textCell) li.append(...textCell.childNodes);
    entries.append(li);
  });

  const sticky = document.createElement('div');
  sticky.className = 'model-showcase-sticky';
  if (pictures[0]) sticky.append(pictures[0].cloneNode(true));

  block.replaceChildren(sticky, entries);

  const entryEls = [...entries.children];
  entryEls[0]?.classList.add('active');

  if (entryEls.length <= 1) return;

  const observer = new IntersectionObserver((observedEntries) => {
    observedEntries.forEach((observed) => {
      if (!observed.isIntersecting) return;
      const i = Number(observed.target.dataset.index);
      entryEls.forEach((el) => el.classList.remove('active'));
      observed.target.classList.add('active');
      if (pictures[i]) sticky.replaceChildren(pictures[i].cloneNode(true));
    });
  }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });

  entryEls.forEach((el) => observer.observe(el));
}
