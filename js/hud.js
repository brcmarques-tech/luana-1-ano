import { saveXP, loadXP, saveLevel, getSessionInfo } from './progress.js';
import { CARD } from './card-data.js';
import { isCardCollected } from './card-reveal.js';
import { applyHoloTilt } from './card-holo.js';
import { imgBase } from './utils.js';
import { openAchievementsDrawer } from './achievements-drawer.js';

const SCREEN_XP = {
  gate: 0,
  welcome: 10,
  hanami: 22,
  journey: 40,
  serendipity: 50,
  loves: 58,
  game: 78,
  card: 90,
  final: 100,
};

let hudEl      = null;
let xpFillEl   = null;
let levelEl    = null;
let currentXP  = 0;
let leveledUp  = false;

export const initHUD = () => {
  hudEl = document.createElement('div');
  hudEl.className = 'hud';
  hudEl.innerHTML = `
    <div class="hud-avatar" id="hud-avatar" title="ver perfil">🐑</div>
    <div class="hud-info">
      <span class="hud-level" id="hud-level">Lv.1</span>
      <div class="hud-xp-track">
        <div class="hud-xp-fill" id="hud-xp-fill"></div>
      </div>
    </div>
  `;
  document.body.appendChild(hudEl);

  xpFillEl = document.getElementById('hud-xp-fill');
  levelEl  = document.getElementById('hud-level');

  // restaura XP salvo
  const saved = loadXP();
  if (saved > 0) {
    currentXP = saved;
    xpFillEl.style.width = currentXP + '%';
    if (currentXP >= 100) {
      leveledUp = true;
      levelEl.textContent = 'Lv.2';
    }
  }

  document.getElementById('hud-avatar').addEventListener('click', openProfilePanel);
};

export const updateHUDForScreen = (screenName) => {
  if (!hudEl) return;
  const targetXP = SCREEN_XP[screenName];
  if (typeof targetXP !== 'number') return;
  if (targetXP <= currentXP) return;

  currentXP = targetXP;
  xpFillEl.style.width = currentXP + '%';
  saveXP(currentXP);

  if (currentXP >= 100 && !leveledUp) {
    leveledUp = true;
    saveXP(currentXP);
    saveLevel(2);
    setTimeout(triggerLevelUp, 1200);
  }
};

const triggerLevelUp = () => {
  levelEl.textContent = 'Lv.2';
  hudEl.classList.add('level-up');

  const banner = document.createElement('div');
  banner.className = 'hud-levelup-banner';
  banner.innerHTML = `
    <div class="banner-shine"></div>
    <div class="banner-text">
      <span class="banner-label">LEVEL UP!</span>
      <span class="banner-sub">Luana atingiu o Lv.2 — 2 anos? 🤔</span>
    </div>
  `;
  document.body.appendChild(banner);
  requestAnimationFrame(() => banner.classList.add('show'));
  setTimeout(() => {
    banner.classList.remove('show');
    setTimeout(() => banner.remove(), 600);
  }, 3500);
};

// ===== painel de perfil =====

const cardSeenKey = 'luana_card_seen';

export const openProfilePanel = () => {
  if (document.getElementById('profile-panel')) return;

  const session  = getSessionInfo();
  const level    = currentXP >= 100 ? 2 : 1;
  const cardSeen = isCardCollected(CARD.id) || localStorage.getItem(cardSeenKey) === '1';

  const statsHTML = CARD.stats.map(
    (s) => `<div class="pcard-stat"><span class="pcard-stat-label">${s.label}</span><span class="pcard-stat-val" style="color:${s.color}">${s.value}</span></div>`
  ).join('');

  const daysHTML = session.daysRemaining !== null
    ? `<span class="profile-days">${session.daysRemaining} dia${session.daysRemaining !== 1 ? 's' : ''} restante${session.daysRemaining !== 1 ? 's' : ''}</span>`
    : '';

  const cardSection = cardSeen
    ? `<div class="pcard" id="pcard-preview" title="clique para ver sua carta" style="cursor:pointer">
        <div class="pcard-rarity">${CARD.rarity}</div>
        <div class="pcard-name">${CARD.name}</div>
        <div class="pcard-title">${CARD.title}</div>
        <div class="pcard-type">${CARD.type}</div>
        <div class="pcard-stats">${statsHTML}</div>
        <p class="pcard-flavor">${CARD.flavor}</p>
        <p class="pcard-tap-hint">toque para ver a carta completa</p>
      </div>`
    : `<div class="pcard-locked">
        <div class="pcard-locked-icon">🎴</div>
        <p class="pcard-locked-text">sua carta ainda não foi revelada<br>descubra-a na tela de cartas</p>
      </div>`;

  const panel = document.createElement('div');
  panel.id = 'profile-panel';
  panel.innerHTML = `
    <div class="profile-overlay" id="profile-overlay"></div>
    <div class="profile-sheet">
      <button class="profile-close" id="profile-close">✕</button>

      ${cardSection}

      <div class="profile-xp-row">
        <span class="profile-xp-lv">Lv.${level}</span>
        <div class="profile-xp-track"><div class="profile-xp-fill" style="width:${currentXP}%"></div></div>
        <span class="profile-xp-val">${currentXP} XP</span>
      </div>
      ${daysHTML}

      <button class="profile-trophy-btn" id="profile-trophy-btn">🏆 ver sala de troféus</button>
    </div>
  `;

  document.body.appendChild(panel);
  requestAnimationFrame(() => panel.classList.add('open'));

  document.getElementById('profile-close').addEventListener('click', closeProfilePanel);
  document.getElementById('profile-overlay').addEventListener('click', closeProfilePanel);
  document.getElementById('profile-trophy-btn').addEventListener('click', () => {
    closeProfilePanel();
    setTimeout(openAchievementsDrawer, 350);
  });

  if (cardSeen) {
    document.getElementById('pcard-preview').addEventListener('click', openCardModal);
  }
};

const openCardModal = () => {
  if (document.getElementById('card-modal')) return;

  const photoUrl = CARD.photoKey ? `${imgBase()}/${CARD.photoKey}.jpg` : null;
  const imgTag = photoUrl
    ? `<img src="${photoUrl}" alt="" class="card-portrait-img"${CARD.photoPosition ? ` style="object-position:${CARD.photoPosition}"` : ''} onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />`
    : '';
  const emojiStyle = photoUrl ? 'style="display:none"' : '';

  const statsHTML = CARD.stats.map((s) => `
    <div class="card-stat" style="border-top-color:${s.color}">
      <div class="stat-label">${s.label}</div>
      <div class="stat-value" style="color:${s.color}">${s.value}</div>
    </div>`).join('');

  const abilHTML = CARD.abilities.map((a) => `
    <li class="card-ability">
      <span class="ability-icon">${a.icon}</span>
      <div class="ability-text">
        <span class="ability-name">${a.name}</span>
        <span class="ability-desc">${a.desc}</span>
      </div>
    </li>`).join('');

  const modal = document.createElement('div');
  modal.id = 'card-modal';
  modal.innerHTML = `
    <div class="card-modal-overlay" id="card-modal-overlay"></div>
    <div class="card-modal-inner">
      <article class="luana-card" id="modal-luana-card">
        <div class="card-holo"></div>
        <header class="card-header">
          <span class="card-name">${CARD.name}</span>
          <span class="card-rarity">${CARD.rarity}</span>
        </header>
        <div class="card-portrait">
          <div class="card-portrait-bg"></div>
          ${imgTag}
          <div class="card-portrait-emoji" ${emojiStyle}>${CARD.emoji}</div>
          <span class="card-level">${CARD.level || ''}</span>
        </div>
        <div class="card-type">${CARD.type}</div>
        <div class="card-stats">${statsHTML}</div>
        <ul class="card-abilities">${abilHTML}</ul>
        <div class="card-flavor">${CARD.flavor}</div>
      </article>
      <button class="btn card-modal-close" id="card-modal-close">fechar ✕</button>
    </div>`;

  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('open'));

  const close = () => {
    modal.classList.remove('open');
    setTimeout(() => modal.remove(), 320);
  };
  document.getElementById('card-modal-close').addEventListener('click', close);
  document.getElementById('card-modal-overlay').addEventListener('click', close);

  applyHoloTilt(document.getElementById('modal-luana-card'), true);
};

const closeProfilePanel = () => {
  const panel = document.getElementById('profile-panel');
  if (!panel) return;
  panel.classList.remove('open');
  setTimeout(() => panel.remove(), 320);
};
