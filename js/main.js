// Boot + orquestração. Cada tela vive em js/screens/*.js e expõe init() + reset()
// opcional. A navegação é centralizada em nav.js.

import { initSession } from './progress.js';
import { initNav, goToScreen, goBack, canGoBack } from './nav.js';
import { syncFromAPI } from './content-overrides.js';
import { initHUD } from './hud.js';
import { initMusic } from './music.js';
import { initAmbient, allKilled, triggerSkullMode, resumePets } from './ambient.js';
import { initAdmin } from './admin.js';
import { initMobileKeyboard } from './mobile-keyboard.js';
import { initLoveLetter } from './love-letter.js';
import { setupEggKonami, setupKonamiCode } from './easter-eggs.js';
import { unlock } from './achievements.js';
import { spawnConfetti } from './confetti.js';
import { wait } from './utils.js';
import { runPreloader } from './preloader.js';
import { initCardReveal, revealCard } from './card-reveal.js';
import { BONUS_CARDS } from './card-data.js';

import { initGate, resetGate } from './screens/gate.js';
import { initWelcome, resetWelcome } from './screens/welcome.js';
import { initHanami } from './screens/hanami.js';
import { initTimeline, resetTimeline } from './screens/timeline.js';
import { initSerendipity } from './screens/serendipity.js';
import { initLoves, resetLoves } from './screens/loves.js';
import { initMemoryGame } from './screens/memory-game.js';
import { initCard, resetCard } from './screens/card.js';
import { initFinal } from './screens/final.js';
import { initPuzzle } from './screens/puzzle.js';
import { initConstellationScreen } from './screens/constellation.js';
import { showLockedScreen } from './screens/locked.js';
import { initSkyButton } from './constellation/sky-button.js';

'use strict';

// ===== Service Worker (PWA offline) =====

if ('serviceWorker' in navigator) {
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return;
    reloading = true;
    location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        reg.addEventListener('updatefound', () => {
          const sw = reg.installing;
          if (!sw) return;
          sw.addEventListener('statechange', () => {
            if (sw.state === 'installed' && navigator.serviceWorker.controller) {
              sw.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });
      })
      .catch(() => {});
  });
}

// ===== boot global (não depende de sessão) =====

// puxa overrides de texto do backend (cache local é instantâneo,
// API atualiza em background pra próxima sessão)
syncFromAPI();

initAmbient();
initAdmin();
initMusic();
initMobileKeyboard();


// ===== botão de voltar global =====

const btnBack = document.createElement('button');
btnBack.id = 'btn-back-global';
btnBack.className = 'btn-back-global';
btnBack.type = 'button';
btnBack.setAttribute('aria-label', 'voltar');
btnBack.innerHTML = '<span class="back-arrow">←</span><span class="back-label">voltar</span>';
btnBack.addEventListener('click', () => {
  if (!canGoBack()) return;
  goBack();
});
document.body.appendChild(btnBack);

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

// ===== gatilhos de digitação para cartas =====

const wireTypingCards = () => {
  const TRIGGERS = {
    amor: () => BONUS_CARDS.find(c => c.id === 'wolf'),
    love: () => BONUS_CARDS.find(c => c.id === 'winter'),
  };
  let buffer = '';
  const maxLen = Math.max(...Object.keys(TRIGGERS).map(k => k.length));
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    buffer = (buffer + e.key.toLowerCase()).slice(-maxLen);
    for (const [word, getter] of Object.entries(TRIGGERS)) {
      if (buffer.endsWith(word)) { revealCard(getter()); buffer = ''; break; }
    }
  });
};

// ===== long press no avatar → Jairo =====

const wireAvatarLongPress = () => {
  let timer = null;
  let didLongPress = false;

  const trigger = () => {
    didLongPress = true;
    revealCard(BONUS_CARDS.find(c => c.id === 'jairo'));
  };

  document.addEventListener('pointerdown', (e) => {
    if (!e.target.closest('#hud-avatar')) return;
    didLongPress = false;
    timer = setTimeout(trigger, 1500);
  });

  document.addEventListener('pointerup', () => { clearTimeout(timer); timer = null; });
  document.addEventListener('pointercancel', () => { clearTimeout(timer); timer = null; });

  // bloqueia o click que vem após o long press
  document.getElementById('hud-avatar')?.addEventListener('click', (e) => {
    if (didLongPress) { didLongPress = false; e.stopImmediatePropagation(); }
  }, true);
};

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
  initPuzzle();
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
  initCardReveal();

  wireEasterEggs();
  wireTypingCards();
  wireAvatarLongPress();
  watchProfilePanel();

  goToScreen('gate');
});
