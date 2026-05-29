// Boot + orquestração. Cada tela vive em js/screens/*.js e expõe init() + reset()
// opcional. A navegação é centralizada em nav.js.

import { initSession } from './progress.js';
import { initNav, goToScreen } from './nav.js';
import { initHUD } from './hud.js';
import { initMusic, toggleMute, isMuted } from './music.js';
import { initAmbient, allKilled, triggerSkullMode, resumePets } from './ambient.js';
import { initAdmin } from './admin.js';
import { initMobileKeyboard } from './mobile-keyboard.js';
import { initLoveLetter } from './love-letter.js';
import { setupEggKonami, setupKonamiCode } from './easter-eggs.js';
import { unlock } from './achievements.js';
import { spawnConfetti } from './confetti.js';
import { wait } from './utils.js';
import { runPreloader } from './preloader.js';

import { initGate, resetGate } from './screens/gate.js';
import { initWelcome, resetWelcome } from './screens/welcome.js';
import { initHanami } from './screens/hanami.js';
import { initTimeline, resetTimeline } from './screens/timeline.js';
import { initSerendipity } from './screens/serendipity.js';
import { initLoves, resetLoves } from './screens/loves.js';
import { initMemoryGame } from './screens/memory-game.js';
import { initCard, resetCard } from './screens/card.js';
import { initFinal } from './screens/final.js';
import { initConstellationScreen } from './screens/constellation.js';
import { showLockedScreen } from './screens/locked.js';
import { initSkyButton } from './constellation/sky-button.js';

'use strict';

// ===== boot global (não depende de sessão) =====

initAmbient();
initAdmin();
initMusic();
initMobileKeyboard();

const btnMute = document.getElementById('btn-mute');
btnMute.textContent = isMuted() ? '🔇' : '🔊';
btnMute.addEventListener('click', () => {
  btnMute.textContent = toggleMute() ? '🔇' : '🔊';
});

// ===== preloader (tela loading) =====

const startPreloading = async () => {
  const textEl = document.getElementById('loading-label');
  const barEl  = document.getElementById('loading-bar');

  const onStep = async (label) => {
    if (textEl.textContent) {
      textEl.classList.add('fade');
      await wait(240);
    }
    textEl.textContent = label;
    textEl.classList.remove('fade');
    await wait(80);
  };
  const onProgress = (pct) => { if (barEl) barEl.style.width = pct + '%'; };

  await runPreloader(onStep, onProgress);
  onProgress(100);
  await wait(500);
  goToScreen('welcome');
};

// ===== konami code com integração ao sistema de bichinhos =====

const wireEasterEggs = () => {
  setupEggKonami(spawnConfetti, () => {
    if (allKilled()) { triggerSkullMode(); return; }
    resumePets();
    unlock('animal-forgiver');
    const t = document.createElement('div');
    t.className = 'egg-toast';
    t.textContent = '🐾 os animais perdoaram você... por enquanto';
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => t.remove(), 400);
    }, 3000);
  });
  setupKonamiCode(spawnConfetti, () => unlock('konami-master'));
};

// ===== contagem de eggs no perfil =====

const watchProfilePanel = () => {
  new MutationObserver(() => {
    const panel = document.getElementById('profile-panel');
    if (!panel || panel.querySelector('.profile-eggs-count')) return;
    const achGrid = panel.querySelector('.profile-ach-grid');
    if (!achGrid) return;
    const total = 5;
    const found = (() => {
      try { return JSON.parse(localStorage.getItem('luana_eggs_found') || '[]').length; }
      catch { return 0; }
    })();
    const title = document.createElement('p');
    title.className = 'profile-ach-title';
    title.style.marginTop = '12px';
    title.textContent = 'easter eggs';
    const count = document.createElement('p');
    count.className = 'profile-eggs-count';
    count.textContent = found === total
      ? `🥚 ${found} / ${total} — todos encontrados! 🏆`
      : `🥚 ${found} / ${total} encontrados`;
    achGrid.after(count);
    achGrid.after(title);
  }).observe(document.body, { childList: true });
};

// ===== fluxo principal: sessão válida → init de tudo + gate =====

initSession().then((access) => {
  if (!access.hasAccess) {
    showLockedScreen(access.nextUnlock);
    return;
  }

  initNav();
  initHUD();
  initLoveLetter();

  initGate({
    onConfirm: () => {
      goToScreen('loading');
      startPreloading();
    },
  });
  initWelcome();
  initHanami();
  initTimeline();
  initSerendipity();
  initLoves();
  initMemoryGame();
  initCard();
  initFinal({
    onFullRestart: () => {
      resetGate();
      resetWelcome();
      resetTimeline();
      resetLoves();
      resetCard();
    },
  });
  initConstellationScreen();
  initSkyButton();

  wireEasterEggs();
  watchProfilePanel();

  goToScreen('gate');
});
