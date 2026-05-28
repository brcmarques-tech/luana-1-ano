// HUD persistente estilo RPG no topo direito.
// Mostra avatar, nome, level e barra de XP que progride conforme navega o site.

const SCREEN_XP = {
  gate: 0,
  welcome: 10,
  hanami: 22,
  journey: 40,
  loves: 58,
  game: 78,
  card: 90,
  final: 100,
};

let hudEl = null;
let xpFillEl = null;
let xpTextEl = null;
let levelEl = null;
let currentXP = 0;
let leveledUp = false;

export const initHUD = () => {
  hudEl = document.createElement('div');
  hudEl.className = 'hud';
  hudEl.innerHTML = `
    <div class="hud-avatar">🌸</div>
    <div class="hud-info">
      <span class="hud-level" id="hud-level">Lv.1</span>
      <div class="hud-xp-track">
        <div class="hud-xp-fill" id="hud-xp-fill"></div>
      </div>
    </div>
  `;
  document.body.appendChild(hudEl);

  xpFillEl = document.getElementById('hud-xp-fill');
  xpTextEl = document.getElementById('hud-xp-text');
  levelEl = document.getElementById('hud-level');
};

export const updateHUDForScreen = (screenName) => {
  if (!hudEl) return;
  const targetXP = SCREEN_XP[screenName];
  if (typeof targetXP !== 'number') return;
  if (targetXP <= currentXP) return;

  const previousXP = currentXP;
  currentXP = targetXP;
  xpFillEl.style.width = currentXP + '%';
  animateXPText(previousXP, currentXP);

  if (currentXP >= 100 && !leveledUp) {
    leveledUp = true;
    setTimeout(triggerLevelUp, 1200);
  }
};

const animateXPText = (from, to) => {
  const duration = 800;
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const v = Math.round(from + (to - from) * t);
    xpTextEl.textContent = `${v}/100`;
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
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
