// TELA: card TCG — deck de cartas (cada uma desbloqueada por achievement),
// reveal da carta principal da Luana com "voo" pro avatar do HUD,
// reveal especial da carta do Bruno (all-eggs).

import { CARD, BONUS_CARDS, SPECIAL_CARD } from '../card-data.js';
import { goToScreen, registerScreenEnter } from '../nav.js';
import { loadAchievements, getToken, getSessionInfo } from '../progress.js';
import { API_URL } from '../config.js';
import { onAllEggsUnlocked } from '../achievements.js';
import { haptic, HAPTIC } from '../haptic.js';
import { applyHoloTilt } from '../card-holo.js';
import { imgBase } from '../utils.js';

let rendered = false;

const renderFullCard = (card, holo = 'full') => {
  const photoUrl = card.photoKey ? `${imgBase()}/${card.photoKey}.jpg` : null;
  const imgTag = photoUrl
    ? `<img src="${photoUrl}" alt="" class="card-portrait-img" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />`
    : '';
  const emojiStyle = photoUrl ? 'style="display:none"' : '';

  const statsHtml = card.stats.map((s) => `
    <div class="card-stat" style="border-top-color:${s.color}">
      <div class="stat-label">${s.label}</div>
      <div class="stat-value" style="color:${s.color}">${s.value}</div>
    </div>`).join('');

  const abilHtml = card.abilities.map((a) => `
    <li class="card-ability">
      <span class="ability-icon">${a.icon}</span>
      <div class="ability-text">
        <span class="ability-name">${a.name}</span>
        <span class="ability-desc">${a.desc}</span>
      </div>
    </li>`).join('');

  const cols = card.stats.length;
  return `
    <article class="tcg-card" style="background:${card.gradient};--card-border:${card.border}">
      <div class="${holo === 'subtle' ? 'card-holo--subtle' : holo === 'dark' ? 'card-holo--dark' : 'card-holo'}"></div>
      <header class="card-header">
        <span class="card-name">${card.name}</span>
        <span class="card-rarity">${card.rarity}</span>
      </header>
      <div class="card-portrait">
        <div class="card-portrait-bg"></div>
        ${imgTag}
        <div class="card-portrait-emoji" ${emojiStyle}>${card.emoji}</div>
      </div>
      <div class="card-type">${card.type}</div>
      <div class="card-stats" style="grid-template-columns:repeat(${cols},1fr)">${statsHtml}</div>
      <ul class="card-abilities">${abilHtml}</ul>
      <div class="card-flavor">${card.flavor}</div>
    </article>`;
};

const renderDeck = () => {
  const stage = document.getElementById('card-stage');
  const unlocked = loadAchievements();

  const deckCardsHtml = BONUS_CARDS.map((card, i) => {
    const isUnlocked = unlocked.has(card.achievementKey);
    return `
      <div class="deck-card ${isUnlocked ? 'deck-card--unlocked' : 'deck-card--locked'}" data-idx="${i}">
        <div class="deck-card-inner">
          <div class="deck-card-back">
            <div class="deck-back-pattern"></div>
            <div class="deck-back-emblem">✦</div>
          </div>
          <div class="deck-card-front">
            ${renderFullCard(card, 'subtle')}
          </div>
        </div>
      </div>`;
  }).join('');

  const dotsHtml = BONUS_CARDS.map((_, i) => `<span class="deck-dot${i === 0 ? ' active' : ''}"></span>`).join('');

  stage.className = 'card-stage card-stage--deck';
  stage.innerHTML = `
    <div class="deck-intro">
      <p class="deck-title">suas cartas</p>
      <p class="deck-sub">escolha uma para revelar</p>
    </div>
    <div class="card-deck" id="card-deck-scroll">${deckCardsHtml}</div>
    <div class="deck-dots">${dotsHtml}</div>
    <div class="deck-hint" id="deck-hint"><span>← deslize →</span></div>
    <button class="btn btn-card-next deck-hidden" id="btn-deck-next">ver sua carta principal →</button>`;

  const nextBtn = stage.querySelector('#btn-deck-next');
  let flippedAny = false;

  stage.querySelectorAll('.deck-card--unlocked').forEach((el) => {
    el.addEventListener('click', () => {
      haptic(HAPTIC.tap);
      if (el.classList.contains('flipped')) return;
      el.classList.add('flipped');
      setTimeout(() => applyHoloTilt(el.querySelector('.tcg-card')), 650);
      if (!flippedAny) {
        flippedAny = true;
        nextBtn.classList.remove('deck-hidden');
        nextBtn.classList.add('deck-show');
      }
    });
  });

  nextBtn.addEventListener('click', showMainCard);

  // atualiza dots conforme scroll + esconde hint após primeiro swipe
  const scrollEl = document.getElementById('card-deck-scroll');
  const dotsEls  = stage.querySelectorAll('.deck-dot');
  const hintEl   = document.getElementById('deck-hint');
  let hintHidden = false;
  scrollEl?.addEventListener('scroll', () => {
    const idx = Math.round(scrollEl.scrollLeft / scrollEl.clientWidth);
    dotsEls.forEach((d, i) => d.classList.toggle('active', i === idx));
    if (!hintHidden && idx > 0) {
      hintHidden = true;
      hintEl?.classList.add('deck-hint--hidden');
    }
  }, { passive: true });
};

const flyCardToProfile = () => {
  const cardEl = document.getElementById('luana-card');
  const avatarEl = document.getElementById('hud-avatar');
  if (!cardEl || !avatarEl) return;

  const cardRect = cardEl.getBoundingClientRect();
  const avatarRect = avatarEl.getBoundingClientRect();

  const destX = avatarRect.left + avatarRect.width / 2 - (cardRect.left + cardRect.width / 2);
  const destY = avatarRect.top + avatarRect.height / 2 - (cardRect.top + cardRect.height / 2);

  const clone = cardEl.cloneNode(true);
  clone.className = 'luana-card card-fly';
  clone.style.cssText = `
    left:${cardRect.left}px;
    top:${cardRect.top}px;
    width:${cardRect.width}px;
    height:${cardRect.height}px;
    --fly-x:${destX}px;
    --fly-y:${destY}px;
    animation: cardFlyToProfile 0.9s cubic-bezier(0.4,0,0.2,1) forwards;
  `;
  document.body.appendChild(clone);

  setTimeout(() => {
    avatarEl.classList.add('hud-avatar--pulse');
    setTimeout(() => {
      avatarEl.classList.remove('hud-avatar--pulse');
      clone.remove();
    }, 600);
  }, 900);
};

const showMainCard = () => {
  const stage = document.getElementById('card-stage');

  const photoUrl = CARD.photoKey ? `${imgBase()}/${CARD.photoKey}.jpg` : null;
  const imgTag = photoUrl
    ? `<img src="${photoUrl}" alt="" class="card-portrait-img" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />`
    : '';
  const emojiStyle = photoUrl ? 'style="display:none"' : '';

  const statsHtml = CARD.stats.map((s) => `
    <div class="card-stat" style="border-top-color:${s.color}">
      <div class="stat-label">${s.label}</div>
      <div class="stat-value" style="color:${s.color}">${s.value}</div>
    </div>`).join('');

  const abilHtml = CARD.abilities.map((a) => `
    <li class="card-ability">
      <span class="ability-icon">${a.icon}</span>
      <div class="ability-text">
        <span class="ability-name">${a.name}</span>
        <span class="ability-desc">${a.desc}</span>
      </div>
    </li>`).join('');

  stage.className = 'card-stage';
  stage.innerHTML = `
    <article class="luana-card" id="luana-card">
      <div class="card-holo"></div>
      <header class="card-header">
        <span class="card-name">${CARD.name}</span>
        <span class="card-rarity">${CARD.rarity}</span>
      </header>
      <div class="card-portrait">
        <div class="card-portrait-bg"></div>
        ${imgTag}
        <div class="card-portrait-emoji" ${emojiStyle}>${CARD.emoji}</div>
        <span class="card-level">${CARD.level}</span>
      </div>
      <div class="card-type">${CARD.type}</div>
      <div class="card-stats">${statsHtml}</div>
      <ul class="card-abilities">${abilHtml}</ul>
      <div class="card-flavor">${CARD.flavor}</div>
    </article>
    <p class="card-hint">deslize/incline pra brilhar ✨</p>
    <button id="btn-card-next" class="btn btn-card-next" type="button">continuar →</button>`;

  applyHoloTilt(document.getElementById('luana-card'), true);

  const wasAlreadySeen = localStorage.getItem('luana_card_seen') === '1';
  localStorage.setItem('luana_card_seen', '1');
  if (!wasAlreadySeen) {
    setTimeout(flyCardToProfile, 1800);
    const { apiOk } = getSessionInfo();
    if (apiOk && API_URL) {
      fetch(`${API_URL}/session/${getToken()}/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardSeen: true }),
      }).catch(() => {});
    }
  }

  document.getElementById('btn-card-next').addEventListener('click', () => goToScreen('final'));
};

const showSpecialCardReveal = () => {
  if (document.getElementById('special-reveal')) return;

  const overlay = document.createElement('div');
  overlay.id = 'special-reveal';
  overlay.className = 'special-reveal-overlay';
  overlay.innerHTML = `
    <div class="special-reveal-sparkles" id="special-sparkles"></div>
    <p class="special-reveal-title">✨ CARTA ESPECIAL DESBLOQUEADA! ✨</p>
    <div class="special-reveal-card">${renderFullCard(SPECIAL_CARD, 'dark')}</div>
    <p class="special-reveal-sub">você encontrou todos os segredos escondidos 🏆</p>
    <button class="btn special-reveal-close">fechar ✕</button>`;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('show'));

  setTimeout(() => applyHoloTilt(overlay.querySelector('.tcg-card'), true), 400);

  const sparklesEl = document.getElementById('special-sparkles');
  const colors = ['#ffd700', '#ffec6e', '#ff5e8a', '#ffffff'];
  for (let i = 0; i < 35; i++) {
    const spark = document.createElement('div');
    spark.className = 'special-spark';
    spark.style.left = Math.random() * 100 + '%';
    spark.style.top = Math.random() * 100 + '%';
    spark.style.background = colors[Math.floor(Math.random() * colors.length)];
    spark.style.setProperty('--dx', (Math.random() * 260 - 130) + 'px');
    spark.style.setProperty('--dy', (Math.random() * 260 - 130) + 'px');
    spark.style.animationDelay = (Math.random() * 0.6) + 's';
    sparklesEl.appendChild(spark);
  }

  const dismiss = () => {
    overlay.classList.remove('show');
    setTimeout(() => overlay.remove(), 400);
  };
  overlay.querySelector('.special-reveal-close').addEventListener('click', dismiss);
  setTimeout(() => { if (overlay.isConnected) dismiss(); }, 8000);
};

export const initCard = () => {
  registerScreenEnter('card', () => {
    if (rendered) return;
    rendered = true;
    renderDeck();
  });

  onAllEggsUnlocked(showSpecialCardReveal);
};

export const resetCard = () => { rendered = false; };
