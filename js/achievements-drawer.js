// Drawer de conquistas - showcase visual completo.
// Acessível via botão no perfil. Mostra grid de troféus + easter eggs.

import { ACHIEVEMENTS, isUnlocked, unlockedCount } from './achievements.js';

const EGG_TOTAL = 5;

const getEggsFound = () => {
  try { return JSON.parse(localStorage.getItem('luana_eggs_found') || '[]').length; }
  catch { return 0; }
};

export const openAchievementsDrawer = () => {
  if (document.getElementById('ach-drawer')) return;

  const total = Object.keys(ACHIEVEMENTS).length;
  const found = unlockedCount();
  const eggs = getEggsFound();

  const trophiesHtml = Object.entries(ACHIEVEMENTS).map(([id, ach]) => {
    const done = isUnlocked(id);
    return `
      <div class="ach-trophy ${done ? 'ach-trophy--on' : 'ach-trophy--off'}">
        <div class="ach-trophy-icon">${done ? ach.icon : '🔒'}</div>
        <div class="ach-trophy-name">${done ? ach.name : '???'}</div>
        <div class="ach-trophy-desc">${done ? ach.desc : 'continue explorando'}</div>
      </div>`;
  }).join('');

  const drawer = document.createElement('div');
  drawer.id = 'ach-drawer';
  drawer.className = 'ach-drawer';
  drawer.innerHTML = `
    <div class="ach-overlay" id="ach-overlay"></div>
    <div class="ach-sheet">
      <button class="ach-close" id="ach-close" aria-label="fechar">✕</button>

      <header class="ach-header">
        <p class="ach-eyebrow">sala de troféus</p>
        <h2 class="ach-title">conquistas</h2>
      </header>

      <div class="ach-summary">
        <div class="ach-summary-item">
          <span class="ach-summary-num">${found}<small>/${total}</small></span>
          <span class="ach-summary-label">conquistas</span>
        </div>
        <div class="ach-summary-sep"></div>
        <div class="ach-summary-item">
          <span class="ach-summary-num ach-summary-num--egg">${eggs}<small>/${EGG_TOTAL}</small></span>
          <span class="ach-summary-label">easter eggs</span>
        </div>
      </div>

      <div class="ach-grid">${trophiesHtml}</div>
    </div>
  `;
  document.body.appendChild(drawer);
  requestAnimationFrame(() => drawer.classList.add('open'));

  const close = () => {
    drawer.classList.remove('open');
    setTimeout(() => drawer.remove(), 320);
  };

  document.getElementById('ach-close').addEventListener('click', close);
  document.getElementById('ach-overlay').addEventListener('click', close);
};
