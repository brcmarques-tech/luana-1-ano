// Sistema de cartas: reveal fullscreen animado + baralho flutuante no canto.

import { CARD, BONUS_CARDS, SPECIAL_CARD } from './card-data.js';
import { imgBase } from './utils.js';
import { haptic, HAPTIC } from './haptic.js';
import { applyHoloTilt } from './card-holo.js';

const DECK_KEY = 'luana_deck';
const collected = new Set(JSON.parse(localStorage.getItem(DECK_KEY) || '[]'));
const saveCollected = () => { try { localStorage.setItem(DECK_KEY, JSON.stringify([...collected])); } catch {} };

const ALL_CARDS = [CARD, ...BONUS_CARDS, SPECIAL_CARD];

let deckBtn = null;
let deckBadge = null;

// fila de reveals — se um card já está visível, o próximo espera o X ser fechado
const revealQueue = [];
let revealActive = false;

export const isCardCollected = (id) => collected.has(id);

export const unlockAllCards = () => {
  ALL_CARDS.forEach(c => collected.add(c.id));
  saveCollected();
  updateDeckBadge();
};

// ===== render card =====

const buildCardEl = (card) => {
  const base = imgBase();
  const photoUrl = card.photoKey ? `${base}/${card.photoKey}.jpg` : null;

  const statsHtml = (card.stats || []).map(s => `
    <div class="cr-stat" style="border-top-color:${s.color}">
      <div class="cr-stat-label">${s.label}</div>
      <div class="cr-stat-value" style="color:${s.color}">${s.value}</div>
    </div>`).join('');

  const abilitiesHtml = (card.abilities || []).map(a => `
    <li class="cr-ability">
      <span class="cr-ability-icon">${a.icon}</span>
      <div><strong>${a.name}</strong> — ${a.desc}</div>
    </li>`).join('');

  const isSpecial = card.id === 'bruno';
  const el = document.createElement('div');
  el.className = 'cr-card';
  el.style.cssText = `background:${card.gradient || '#1a0a2e'};border:2px solid transparent;transform-style:preserve-3d;`;
  el.innerHTML = `
    <div class="cr-border-glow" style="background:${card.border || 'var(--pink)'}"></div>
    <div class="${isSpecial ? 'card-holo card-holo--dark' : 'card-holo'}"></div>
    <div class="cr-rarity">${card.rarity || '★★★'}</div>
    <div class="cr-portrait">
      ${photoUrl ? `<img src="${photoUrl}" alt="" class="cr-portrait-img" draggable="false" onerror="this.style.display='none'"${card.photoPosition ? ` style="object-position:${card.photoPosition}"` : ''}>` : ''}
      <div class="cr-portrait-emoji" ${photoUrl ? 'style="display:none"' : ''}>${card.emoji || '✨'}</div>
    </div>
    <div class="cr-name">${card.name}</div>
    <div class="cr-title">${card.title}</div>
    <div class="cr-type">${card.type || ''}</div>
    <div class="cr-stats">${statsHtml}</div>
    ${abilitiesHtml ? `<ul class="cr-abilities">${abilitiesHtml}</ul>` : ''}
    ${card.flavor ? `<div class="cr-flavor">${card.flavor}</div>` : ''}
  `;
  return el;
};

// ===== reveal overlay =====

const processQueue = () => {
  if (revealActive || revealQueue.length === 0) return;
  showReveal(revealQueue.shift());
};

export const revealCard = (card, onDismiss) => {
  if (!card?.id) return;
  if (isCardCollected(card.id)) {
    // carta já coletada — apenas executa o callback (ex: abrir perfil)
    if (onDismiss) setTimeout(onDismiss, 300);
    return;
  }
  collected.add(card.id);
  saveCollected();
  haptic(HAPTIC.special);
  updateDeckBadge();
  if (revealActive) { revealQueue.push(card); return; }
  showReveal(card, onDismiss);
};

const makeIframe = (card) => {
  const iframe = document.createElement('iframe');
  iframe.className = 'cr-iframe';
  iframe.src = `card-viewer.html#${card.id}`;
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('scrolling', 'no');
  return iframe;
};

const showReveal = (card, onDismiss) => {
  revealActive = true;
  document.body.style.overflow = 'hidden';

  const overlay = document.createElement('div');
  overlay.className = 'cr-overlay';

  const header = document.createElement('div');
  header.className = 'cr-header';
  header.innerHTML = `<span class="cr-label">✨ CARTA DESBLOQUEADA</span><button class="cr-close" aria-label="fechar">✕</button>`;

  const stage = document.createElement('div');
  stage.className = 'cr-stage';
  const iframe = makeIframe(card);
  stage.appendChild(iframe);

  overlay.appendChild(header);
  overlay.appendChild(stage);
  document.body.appendChild(overlay);

  requestAnimationFrame(() => requestAnimationFrame(() => {
    overlay.classList.add('cr-show');
  }));

  header.querySelector('.cr-close').addEventListener('click', () => flyToDeck(overlay, iframe, onDismiss));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) flyToDeck(overlay, iframe, onDismiss); });
};

const flyToDeck = (overlay, iframe, onDismiss) => {
  document.body.style.overflow = '';
  const deckRect = deckBtn.getBoundingClientRect();
  const iframeRect = iframe.getBoundingClientRect();
  const dx = deckRect.left + deckRect.width / 2 - (iframeRect.left + iframeRect.width / 2);
  const dy = deckRect.top  + deckRect.height / 2 - (iframeRect.top  + iframeRect.height / 2);

  iframe.style.transition = 'transform 0.55s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease';
  iframe.style.transform  = `translate(${dx}px,${dy}px) scale(0.08)`;
  iframe.style.opacity    = '0';
  overlay.style.transition = 'opacity 0.3s ease 0.2s';
  overlay.style.opacity   = '0';

  setTimeout(() => {
    overlay.remove();
    deckBtn.classList.add('btn-deck--pulse');
    setTimeout(() => deckBtn.classList.remove('btn-deck--pulse'), 700);
    revealActive = false;
    if (onDismiss) setTimeout(onDismiss, 300);
    setTimeout(processQueue, 400);
  }, 550);
};

// ===== deck button + drawer =====

const updateDeckBadge = () => {
  if (!deckBadge) return;
  deckBadge.textContent = collected.size;
  deckBadge.hidden = collected.size === 0;
};

const buildMiniCard = (card) => {
  const has = collected.has(card.id);
  const base = imgBase();
  const photoUrl = has && card.photoKey ? `${base}/${card.photoKey}.jpg` : null;
  const isSpecial = card.id === 'bruno';

  const el = document.createElement('div');
  el.className = `deck-mini ${has ? 'deck-mini--unlocked' : 'deck-mini--locked'}`;
  if (has) el.style.background = card.gradient || '#1a0a2e';

  if (has) {
    el.innerHTML = `
      <div class="${isSpecial ? 'card-holo card-holo--dark' : 'card-holo'}"></div>
      <div class="deck-mini-rarity">${card.rarity || '★★★'}</div>
      <div class="deck-mini-portrait">
        ${photoUrl ? `<img src="${photoUrl}" class="deck-mini-img" draggable="false" onerror="this.style.display='none'"${card.photoPosition ? ` style="object-position:${card.photoPosition}"` : ''}>` : `<div class="deck-mini-emoji">${card.emoji}</div>`}
      </div>
      <div class="deck-mini-info">
        <div class="deck-mini-name">${card.name}</div>
        <div class="deck-mini-title">${card.title}</div>
      </div>`;
    el.addEventListener('click', () => viewCard(card));
    applyHoloTilt(el);
  } else {
    el.innerHTML = `
      <div class="deck-mini-lock">🔒</div>
      <div class="deck-mini-name">???</div>`;
  }

  return el;
};

const viewCard = (card) => {
  if (document.querySelector('.cr-overlay')) return;
  document.body.style.overflow = 'hidden';
  const overlay = document.createElement('div');
  overlay.className = 'cr-overlay';

  const header = document.createElement('div');
  header.className = 'cr-header';
  header.innerHTML = `<span class="cr-label">🃏 ${card.name}</span><button class="cr-close" aria-label="fechar">✕</button>`;

  const stage = document.createElement('div');
  stage.className = 'cr-stage';
  stage.appendChild(makeIframe(card));

  overlay.appendChild(header);
  overlay.appendChild(stage);
  document.body.appendChild(overlay);

  requestAnimationFrame(() => overlay.classList.add('cr-show'));

  const close = () => { overlay.classList.remove('cr-show'); document.body.style.overflow = ''; setTimeout(() => overlay.remove(), 400); };
  header.querySelector('.cr-close').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
};

const openDeck = () => {
  if (document.getElementById('deck-drawer')) return;
  const drawer = document.createElement('div');
  drawer.id = 'deck-drawer';
  drawer.className = 'deck-drawer';

  const header = document.createElement('div');
  header.className = 'deck-drawer-header';
  header.innerHTML = `<span>baralho ${collected.size}/${ALL_CARDS.length}</span><button class="deck-drawer-close">✕</button>`;

  const grid = document.createElement('div');
  grid.className = 'deck-drawer-grid';
  ALL_CARDS.forEach(card => grid.appendChild(buildMiniCard(card)));

  drawer.appendChild(header);
  drawer.appendChild(grid);
  document.body.appendChild(drawer);
  requestAnimationFrame(() => drawer.classList.add('deck-drawer--show'));

  header.querySelector('.deck-drawer-close').addEventListener('click', () => {
    drawer.classList.remove('deck-drawer--show');
    setTimeout(() => drawer.remove(), 300);
  });
};

export const initCardReveal = () => {
  deckBtn = document.createElement('button');
  deckBtn.id = 'btn-deck';
  deckBtn.className = 'btn-deck';
  deckBtn.type = 'button';
  deckBtn.setAttribute('aria-label', 'baralho de cartas');
  deckBtn.innerHTML = '🃏<span class="deck-badge" id="deck-badge" hidden>0</span>';
  document.body.appendChild(deckBtn);
  deckBadge = document.getElementById('deck-badge');
  updateDeckBadge();
  deckBtn.addEventListener('click', openDeck);
};
