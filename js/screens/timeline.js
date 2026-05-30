// TELA: journey/timeline — 13 cards horizontais com flip 3D livro,
// swipe/drag, dots indicadores, troca de track por card, easter egg counter.

import { TIMELINE } from '../timeline-data.js';
import { goToScreen, registerScreenEnter } from '../nav.js';
import { unlock } from '../achievements.js';
import { setupEggTimelineCounter } from '../easter-eggs.js';
import { playDirect, TIMELINE_PLAYLIST } from '../music.js';

let timelineEl, dotsEl, counterEl;
let rendered = false;
let lastIdx = 0;
let tlGroup = -1;

const GROUP_SIZE = 3;
const NUM_GROUPS = Math.ceil(13 / GROUP_SIZE); // 5 grupos: 0-2, 3-5, 6-8, 9-11, 12

const playGroupAt = (group) => {
  tlGroup = ((group % NUM_GROUPS) + NUM_GROUPS) % NUM_GROUPS;
  const trackIdx = tlGroup * GROUP_SIZE; // 0, 3, 6, 9, 12
  playDirect(TIMELINE_PLAYLIST[Math.min(trackIdx, TIMELINE_PLAYLIST.length - 1)], {
    loop: false,
    onEnded: () => playGroupAt(tlGroup + 1),
  });
};

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
      const hasQuote = item.quotes?.length ? 'has-quote' : '';
      const quotesHtml = item.quotes?.length ? `
        <button class="card-quote-toggle" aria-label="ver citação" aria-expanded="false">
          <span class="card-quote-arrow">▼</span>
        </button>
        <div class="card-quote-panel" hidden>
          <div class="card-quote-slide">
            <p class="card-quote-text"></p>
            <p class="card-quote-source"></p>
          </div>
          <div class="card-quote-dots">${item.quotes.map((_, i) => `<span class="cq-dot${i === 0 ? ' active' : ''}"></span>`).join('')}</div>
        </div>` : '';
      card.innerHTML = `
        <div class="card-photo${item.photo ? ' card-photo--skeleton' : ''}">${photoContent}</div>
        <div class="card-info ${hasQuote}">
          <div class="card-date">${item.date}</div>
          <div class="card-caption">${item.caption}</div>
          ${quotesHtml}
        </div>
      `;
    }
    // carrossel de citações
    if (item.quotes?.length) {
      const toggleBtn = card.querySelector('.card-quote-toggle');
      const panel     = card.querySelector('.card-quote-panel');
      const textEl    = card.querySelector('.card-quote-text');
      const sourceEl  = card.querySelector('.card-quote-source');
      const dots      = card.querySelectorAll('.cq-dot');
      let qIdx = 0;

      const showQuote = (i) => {
        qIdx = (i + item.quotes.length) % item.quotes.length;
        const q = item.quotes[qIdx];
        const slide = card.querySelector('.card-quote-slide');
        slide.classList.add('cq-fade-out');
        setTimeout(() => {
          textEl.textContent   = `"${q.text}"`;
          sourceEl.textContent = `— ${q.source}`;
          dots.forEach((d, di) => d.classList.toggle('active', di === qIdx));
          slide.classList.remove('cq-fade-out');
        }, 200);
      };

      showQuote(0);

      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = toggleBtn.getAttribute('aria-expanded') === 'true';
        toggleBtn.setAttribute('aria-expanded', String(!open));
        toggleBtn.classList.toggle('open', !open);
        if (!open) {
          panel.hidden = false;
          requestAnimationFrame(() => panel.classList.add('card-quote-panel--open'));
        } else {
          panel.classList.remove('card-quote-panel--open');
          panel.addEventListener('transitionend', () => { panel.hidden = true; }, { once: true });
        }
      });

      // tap nos dots para navegar
      dots.forEach((dot, i) => {
        dot.addEventListener('click', (e) => { e.stopPropagation(); showQuote(i); });
      });

      // auto-avança a cada 5s quando painel aberto
      let autoTimer;
      panel.addEventListener('transitionend', () => {
        if (!panel.hidden && panel.classList.contains('card-quote-panel--open')) {
          clearInterval(autoTimer);
          autoTimer = setInterval(() => showQuote(qIdx + 1), 5000);
        } else {
          clearInterval(autoTimer);
        }
      });
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
        const group = Math.floor(closest / GROUP_SIZE);
        if (group !== tlGroup) playGroupAt(group);
      }
    }, 80);
  }, { passive: true });

  requestAnimationFrame(applyBookTilt);
};

const wireLightbox = () => {
  let overlay = null;
  timelineEl.addEventListener('click', (e) => {
    if (e.target.id === 'btn-to-loves') return;
    const img = e.target.closest('.card-photo')?.querySelector('img');
    if (!img || !img.src) return;
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:zoom-out;';
    const full = document.createElement('img');
    full.src = img.src;
    full.style.cssText = 'max-width:100%;max-height:100%;object-fit:contain;border-radius:8px;';
    overlay.appendChild(full);
    overlay.addEventListener('click', () => { overlay.remove(); overlay = null; });
    document.body.appendChild(overlay);
  });
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
  wireLightbox();
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
    const group = Math.floor(lastIdx / GROUP_SIZE);
    playGroupAt(group);
  });
};
