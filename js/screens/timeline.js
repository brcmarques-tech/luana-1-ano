// TELA: journey/timeline — 13 cards horizontais com flip 3D livro,
// swipe/drag, dots indicadores, troca de track por card, easter egg counter.

import { TIMELINE } from '../timeline-data.js';
import { goToScreen, registerScreenEnter } from '../nav.js';
import { unlock } from '../achievements.js';
import { playTrack, preloadTrack } from '../music.js';
import { setupEggTimelineCounter } from '../easter-eggs.js';

let timelineEl, dotsEl, counterEl;
let rendered = false;
let lastIdx = 0;

export const getLastTimelineIdx = () => lastIdx;

const renderCards = () => {
  timelineEl.innerHTML = '';
  dotsEl.innerHTML = '';

  TIMELINE.forEach((item, idx) => {
    const card = document.createElement('article');
    card.className = 'timeline-card' + (item.isFinal ? ' is-final' : '');
    card.dataset.index = idx;

    if (item.isFinal) {
      card.innerHTML = `
        <div class="final-emoji">💛</div>
        <div class="final-title">${item.caption}</div>
        <div class="final-text">${item.finalText || ''}</div>
        <button class="btn" id="btn-to-loves" type="button">continuar →</button>
      `;
    } else {
      const photoContent = item.photo
        ? `<img src="${item.photo}" alt="${item.caption}" loading="lazy"
               class="img-loading"
               onload="this.classList.remove('img-loading');this.closest('.card-photo').classList.remove('card-photo--skeleton')"
               onerror="this.style.display='none';this.closest('.card-photo').classList.remove('card-photo--skeleton')" />`
        : `<div>
             <div class="placeholder-icon">📷</div>
             <div class="placeholder-text">foto de ${item.date.toLowerCase()}</div>
           </div>`;
      card.innerHTML = `
        <div class="card-photo${item.photo ? ' card-photo--skeleton' : ''}">${photoContent}</div>
        <div class="card-info">
          <div class="card-date">${item.date}</div>
          <div class="card-caption">${item.caption}</div>
        </div>
      `;
    }
    timelineEl.appendChild(card);

    const dot = document.createElement('span');
    dot.className = 'dot' + (idx === 0 ? ' active' : '');
    dot.dataset.index = idx;
    dotsEl.appendChild(dot);
  });

  counterEl.textContent = `1 / ${TIMELINE.length}`;
};

const wireDots = () => {
  dotsEl.addEventListener('click', (e) => {
    const dot = e.target.closest('.dot');
    if (!dot) return;
    const card = timelineEl.children[Number(dot.dataset.index)];
    card?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  });
};

const wireMouseDrag = () => {
  let dragging = false, startX = 0, startScroll = 0;
  timelineEl.addEventListener('mousedown', (e) => {
    dragging = true;
    startX = e.clientX;
    startScroll = timelineEl.scrollLeft;
    timelineEl.style.cursor = 'grabbing';
    timelineEl.style.userSelect = 'none';
    timelineEl.style.scrollSnapType = 'none';
  });
  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    timelineEl.scrollLeft = startScroll - (e.clientX - startX);
  });
  window.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    timelineEl.style.cursor = '';
    timelineEl.style.userSelect = '';
    timelineEl.style.scrollSnapType = '';
    const cardW = timelineEl.children[0]?.offsetWidth ?? timelineEl.clientWidth;
    const idx = Math.round(timelineEl.scrollLeft / (cardW + 16));
    timelineEl.children[idx]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  });
};

const applyBookTilt = () => {
  const center = timelineEl.scrollLeft + timelineEl.clientWidth / 2;
  const halfW = timelineEl.clientWidth / 2;
  Array.from(timelineEl.children).forEach((card) => {
    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
    const offset = (cardCenter - center) / halfW;
    const clamped = Math.max(-1.2, Math.min(1.2, offset));
    const rotY = clamped * -28;
    const scale = 1 - Math.abs(clamped) * 0.08;
    const opacity = Math.max(0.4, 1 - Math.abs(clamped) * 0.45);
    card.style.transform = `rotateY(${rotY}deg) scale(${scale})`;
    card.style.opacity = opacity;
  });
};

const wireScroll = () => {
  const seen = new Set([0]);
  let scrollTimer;
  let rafId;
  timelineEl.addEventListener('scroll', () => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(applyBookTilt);

    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const center = timelineEl.scrollLeft + timelineEl.clientWidth / 2;
      let closest = 0, closestDist = Infinity;
      Array.from(timelineEl.children).forEach((card, i) => {
        const cc = card.offsetLeft + card.offsetWidth / 2;
        const d = Math.abs(cc - center);
        if (d < closestDist) { closestDist = d; closest = i; }
      });
      Array.from(dotsEl.children).forEach((d, i) => d.classList.toggle('active', i === closest));
      counterEl.textContent = `${closest + 1} / ${TIMELINE.length}`;
      seen.add(closest);
      if (seen.size === TIMELINE.length) unlock('all-cards-seen');
      if (closest !== lastIdx) {
        lastIdx = closest;
        const key = `timeline-${String(closest + 1).padStart(2, '0')}`;
        playTrack(key);
        if (closest + 2 <= TIMELINE.length) {
          preloadTrack(`timeline-${String(closest + 2).padStart(2, '0')}`);
        }
      }
    }, 80);
  }, { passive: true });

  requestAnimationFrame(applyBookTilt);
};

const wireFinalButton = () => {
  timelineEl.addEventListener('click', (e) => {
    if (e.target.id === 'btn-to-loves') goToScreen('serendipity');
  });
};

const render = () => {
  if (rendered) return;
  rendered = true;
  renderCards();
  wireDots();
  wireMouseDrag();
  wireScroll();
  wireFinalButton();
};

export const resetTimeline = () => {
  rendered = false;
  lastIdx = 0;
};

export const initTimeline = () => {
  timelineEl = document.getElementById('timeline');
  dotsEl     = document.getElementById('timeline-dots');
  counterEl  = document.getElementById('journey-counter');

  setupEggTimelineCounter(counterEl);

  registerScreenEnter('journey', () => {
    render();
    playTrack(`timeline-${String(lastIdx + 1).padStart(2, '0')}`);
  });
};
