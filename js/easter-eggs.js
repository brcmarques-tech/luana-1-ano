// 4 easter eggs espalhados pelo site.
// Edite as mensagens/frases pra customizar o que cada um revela.

import { unlock } from './achievements.js';
import { unlockAllCards } from './card-reveal.js';
import { haptic, HAPTIC } from './haptic.js';
import { API_URL } from './config.js';
import { getToken, getSessionInfo } from './progress.js';

export const EGG_HINTS = [
  '🤫 achou o primeiro segredo',
  '👀 outro escondidinho',
  '💘 modo cupido ativado',
  '✨ tá ficando boa nisso',
  '🌸 o kanji guardava um segredo',
];

export const TIMELINE_STATS = [
  '8.760 horas com você',
  '525.600 minutos juntos',
  '≈ 1.245 cafés tomados',
  '0 vezes que cansei',
  '∞ vontades de te abraçar',
];

export const KONAMI_WORD = 'amor';
export const KONAMI_MESSAGE = 'você digitou a palavra certa 💛';

const EGGS_KEY = 'luana_eggs_found';
const loadEggs = () => { try { return new Set(JSON.parse(localStorage.getItem(EGGS_KEY) || '[]')); } catch { return new Set(); } };
const saveEggs = (s) => {
  try { localStorage.setItem(EGGS_KEY, JSON.stringify([...s])); } catch {}
  const { apiOk } = getSessionInfo();
  if (apiOk && API_URL) {
    fetch(`${API_URL}/session/${getToken()}/progress`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eggsFound: [...s] }),
    }).catch(() => {});
  }
};

let eggsFound = loadEggs();
let eggCounter = null;

export const getEggsFound = () => eggsFound;

const ensureCounter = () => {
  if (eggCounter) return eggCounter;
  eggCounter = document.createElement('div');
  eggCounter.className = 'egg-counter';
  eggCounter.hidden = true;
  document.body.appendChild(eggCounter);
  return eggCounter;
};

const updateCounter = () => {
  const c = ensureCounter();
  c.textContent = `🥚 ${eggsFound.size}/5`;
  c.hidden = false;
  c.classList.add('show');
  clearTimeout(c._hideTimer);
  c._hideTimer = setTimeout(() => c.classList.remove('show'), 2200);
};

const showToast = (text) => {
  const t = document.createElement('div');
  t.className = 'egg-toast';
  t.textContent = text;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 400);
  }, 2400);
};

const markFound = (id, hintIdx) => {
  if (eggsFound.has(id)) return false;
  eggsFound.add(id);
  saveEggs(eggsFound);
  showToast(EGG_HINTS[hintIdx] || '🥚 achou um segredo');
  haptic(HAPTIC.egg);
  updateCounter();
  unlock('egg-hunter');
  if (eggsFound.size >= 5) unlock('all-eggs');
  return true;
};

// ===== EGG 1: triplo toque no nome "Luana" da tela welcome =====

export const setupEggWelcomeName = (nameEl, spawnConfetti) => {
  let clicks = 0;
  let timer;
  nameEl.style.cursor = 'pointer';
  nameEl.addEventListener('click', () => {
    clicks++;
    clearTimeout(timer);
    timer = setTimeout(() => { clicks = 0; }, 800);
    if (clicks >= 3) {
      clicks = 0;
      if (markFound('welcome-name', 0)) {
        spawnConfetti?.(30);
      }
    }
  });
};

// ===== EGG 2: toque no contador da timeline rotaciona estatísticas =====

export const setupEggTimelineCounter = (counterEl) => {
  let idx = 0;
  let original = '';
  let originalTimer;
  counterEl.style.cursor = 'pointer';
  counterEl.addEventListener('click', () => {
    if (!original) original = counterEl.textContent;
    counterEl.textContent = TIMELINE_STATS[idx % TIMELINE_STATS.length];
    counterEl.classList.add('counter-stat');
    idx++;

    clearTimeout(originalTimer);
    originalTimer = setTimeout(() => {
      counterEl.classList.remove('counter-stat');
      original = '';
    }, 2500);

    if (idx === 1) markFound('timeline-counter', 1);
  });
};

// ===== EGG 3: triplo toque no coração da tela final =====

export const setupEggFinalHeart = (heartEl, spawnConfetti, finalHeartsLayerEl) => {
  let clicks = 0;
  let timer;
  heartEl.style.cursor = 'pointer';
  heartEl.addEventListener('click', () => {
    clicks++;
    clearTimeout(timer);
    timer = setTimeout(() => { clicks = 0; }, 800);
    if (clicks >= 3) {
      clicks = 0;
      if (markFound('final-heart', 2)) {
        // chuva mega de corações
        for (let i = 0; i < 30; i++) {
          setTimeout(() => spawnHeart(finalHeartsLayerEl, true), i * 80);
        }
        spawnConfetti?.(80);
      }
    }
  });
};

const spawnHeart = (layer, mega = false) => {
  if (!layer) return;
  const heart = document.createElement('div');
  heart.className = 'final-bg-heart';
  heart.textContent = ['💛', '💗', '💖', '💕'][Math.floor(Math.random() * 4)];
  heart.style.left = (5 + Math.random() * 90) + '%';
  heart.style.bottom = '-20px';
  heart.style.fontSize = (mega ? 1.5 + Math.random() * 2 : 0.9 + Math.random() * 1.2) + 'rem';
  heart.style.animationDuration = (4 + Math.random() * 4) + 's';
  heart.style.zIndex = '5';
  layer.appendChild(heart);
  setTimeout(() => heart.remove(), 10000);
};

// ===== EGG 4: digitar "luana" em qualquer tela (konami-like) =====

// egg 4: digitar "amor" no teclado
// egg 5: triplo toque no kanji 偶然の美
export const triggerEgg4Mobile = (spawnConfetti) => {
  if (markFound('kanji', 4)) {
    showBigMessage('🌸 偶然の美 — até os segredos chegam por acidente');
    spawnConfetti?.(40);
  }
};

export const setupEggKonami = (spawnConfetti, onDesculpa) => {
  let buffer = '';
  let timer;

  const handleChar = (char) => {
    if (!char || char.length !== 1) return;
    buffer += char.toLowerCase();
    clearTimeout(timer);
    timer = setTimeout(() => { buffer = ''; }, 2500);

    if (buffer.endsWith('liberarcards')) {
      buffer = '';
      unlockAllCards();
      showBigMessage('🃏 todas as cartas desbloqueadas!');
    }

    if (buffer.endsWith('hardreset')) {
      buffer = '';
      localStorage.clear();
      location.reload();
    }

    if (buffer.endsWith('desculpa')) {
      buffer = '';
      const killed = JSON.parse(localStorage.getItem('luana_killed_pets') || '[]');
      if (killed.length > 0) onDesculpa?.();
    }

    if (buffer.endsWith('luana')) {
      buffer = '';
      showBigMessage('esse é o nome da melhor esposa do mundo 💛');
    }

    if (buffer.endsWith('bruno')) {
      buffer = '';
      showBigMessage('obrigado por pensar em mim, mas isso não tem a ver comigo — é para ti, aproveite 🌸');
    }
  };

  // teclado físico
  document.addEventListener('keydown', (e) => {
    if (e.key && e.key.length === 1) handleChar(e.key);
  });
};

// ===== EGG 5 (BONUS): konami code real (↑↑↓↓←→←→BA) =====

const KONAMI_SEQ = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

export const setupKonamiCode = (spawnConfetti, onUnlock) => {
  let pos = 0;
  let timer;

  document.addEventListener('keydown', (e) => {
    const expected = KONAMI_SEQ[pos];
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === expected) {
      pos++;
      clearTimeout(timer);
      timer = setTimeout(() => { pos = 0; }, 3000);
      if (pos >= KONAMI_SEQ.length) {
        pos = 0;
        triggerKonamiUnlock(spawnConfetti, onUnlock);
      }
    } else {
      pos = 0;
    }
  });
};

const triggerKonamiUnlock = (spawnConfetti, onUnlock) => {
  showBigMessage('🎮 KONAMI CODE 🎮');
  spawnConfetti?.(100);
  onUnlock?.();

  // efeito visual: tela treme + invert
  document.body.classList.add('konami-flash');
  setTimeout(() => document.body.classList.remove('konami-flash'), 1200);
};

const showBigMessage = (text) => {
  const m = document.createElement('div');
  m.className = 'egg-big-message';
  m.textContent = text;
  document.body.appendChild(m);
  requestAnimationFrame(() => m.classList.add('show'));
  setTimeout(() => {
    m.classList.remove('show');
    setTimeout(() => m.remove(), 600);
  }, 3000);
};
