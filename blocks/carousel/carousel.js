import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const slides = document.createElement('ul');
  slides.className = 'carousel-slides';

  rows.forEach((row) => {
    const img = row.querySelector('img');
    const li = document.createElement('li');
    li.className = 'carousel-slide';
    if (img) li.append(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
    slides.append(li);
  });

  const track = document.createElement('div');
  track.className = 'carousel-track';
  track.append(slides);

  block.replaceChildren(track);

  if (rows.length <= 1) return;

  let index = 0;
  const dots = [];

  const goTo = (newIndex) => {
    index = (newIndex + rows.length) % rows.length;
    track.style.setProperty('--carousel-index', index);
    dots.forEach((dot, i) => {
      if (i === index) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  };

  const prevButton = document.createElement('button');
  prevButton.type = 'button';
  prevButton.className = 'carousel-arrow carousel-arrow-prev';
  prevButton.setAttribute('aria-label', 'Previous slide');
  prevButton.addEventListener('click', () => goTo(index - 1));

  const nextButton = document.createElement('button');
  nextButton.type = 'button';
  nextButton.className = 'carousel-arrow carousel-arrow-next';
  nextButton.setAttribute('aria-label', 'Next slide');
  nextButton.addEventListener('click', () => goTo(index + 1));

  const dotsContainer = document.createElement('div');
  dotsContainer.className = 'carousel-dots';
  rows.forEach((row, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel-dot';
    dot.setAttribute('aria-label', `Show slide ${i + 1} of ${rows.length}`);
    dot.addEventListener('click', () => goTo(i));
    dots.push(dot);
    dotsContainer.append(dot);
  });

  block.append(prevButton, nextButton, dotsContainer);
  goTo(0);
}
