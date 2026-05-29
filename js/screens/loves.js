// TELA: loves — lista vertical com scroll-reveal.

import { LOVES } from '../loves-data.js';
import { goToScreen, registerScreenEnter } from '../nav.js';
import { unlock } from '../achievements.js';

let listEl;
let rendered = false;
let observer = null;

const render = () => {
  if (rendered) return;
  rendered = true;

  listEl.innerHTML = '';
  LOVES.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'love-item';
    li.innerHTML = `
      <span class="love-emoji">${item.emoji}</span>
      <div class="love-text">
        <strong>${item.text}</strong>
        ${item.sub ? `<small>${item.sub}</small>` : ''}
      </div>
    `;
    listEl.appendChild(li);
  });

  observer?.disconnect();
  const scrollRoot = document.querySelector('.loves-scroll');
  let revealed = 0;
  observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        observer.unobserve(e.target);
        revealed++;
        if (revealed === LOVES.length) unlock('loves-read');
      }
    });
  }, { root: scrollRoot, threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

  Array.from(listEl.children).forEach((li) => observer.observe(li));
};

export const resetLoves = () => { rendered = false; };

export const initLoves = () => {
  listEl = document.getElementById('loves-list');

  document.getElementById('btn-to-game')?.addEventListener('click', () => goToScreen('game'));

  registerScreenEnter('loves', render);
};
