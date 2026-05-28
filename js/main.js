import { TIMELINE } from './timeline-data.js';
import { LOVES } from './loves-data.js';
import { PAIRS } from './game-data.js';
import { FINAL } from './final-data.js';
import {
  setupEggWelcomeName,
  setupEggTimelineCounter,
  setupEggFinalHeart,
  setupEggKonami,
} from './easter-eggs.js';

'use strict';

const screens = {
  gate: document.getElementById('screen-gate'),
  welcome: document.getElementById('screen-welcome'),
  journey: document.getElementById('screen-journey'),
  loves: document.getElementById('screen-loves'),
  game: document.getElementById('screen-game'),
  final: document.getElementById('screen-final'),
};

const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');
const hint = document.getElementById('gate-hint');
const welcomeName = document.getElementById('welcome-name');
const welcomeSub = document.getElementById('welcome-sub');
const btnStart = document.getElementById('btn-start');
const confettiLayer = document.getElementById('confetti-layer');
const music = document.getElementById('bg-music');
const btnMute = document.getElementById('btn-mute');

// ===== gate: brincadeira do botão "Não" que foge =====

const hints = [
  'tem certeza? 👀',
  'olha a Luana, hein...',
  'só a Luana pode passar 💛',
  'é sério, clica no certo 😅',
  'ok, agora chega de fingir',
];
let noClickCount = 0;

const moveNoButton = () => {
  const gate = screens.gate.getBoundingClientRect();
  const btn = btnNo.getBoundingClientRect();
  const margin = 16;

  const maxX = gate.width - btn.width - margin * 2;
  const maxY = gate.height - btn.height - margin * 2;

  const x = Math.random() * maxX - maxX / 2;
  const y = Math.random() * maxY * 0.4 - maxY * 0.2;

  btnNo.style.transform = `translate(${x}px, ${y}px) scale(${0.95 - noClickCount * 0.05})`;

  const next = hints[Math.min(noClickCount, hints.length - 1)];
  hint.textContent = next;
  hint.classList.add('show');

  noClickCount++;
};

btnNo.addEventListener('mouseenter', moveNoButton);
btnNo.addEventListener('touchstart', (e) => {
  e.preventDefault();
  moveNoButton();
}, { passive: false });
btnNo.addEventListener('click', (e) => {
  e.preventDefault();
  moveNoButton();
});

btnYes.addEventListener('click', () => {
  tryPlayMusic();
  spawnConfetti(40);
  setTimeout(() => goToScreen('welcome'), 350);
});

// ===== welcome: typing effect =====

const typeText = (el, text, speed = 110) => new Promise((resolve) => {
  let i = 0;
  el.textContent = '';
  const tick = () => {
    if (i < text.length) {
      el.textContent += text[i++];
      setTimeout(tick, speed);
    } else {
      resolve();
    }
  };
  tick();
});

let welcomePlayed = false;
const playWelcomeSequence = async () => {
  if (welcomePlayed) return;
  welcomePlayed = true;
  await wait(400);
  await typeText(welcomeName, 'Luana', 140);
  welcomeName.classList.add('done');
  spawnConfetti(25);

  await wait(500);
  welcomeSub.textContent = 'faz exatamente 1 ano que tudo começou 💛';
  welcomeSub.classList.add('show');

  await wait(900);
  btnStart.classList.add('show');
};

btnStart.addEventListener('click', () => {
  goToScreen('journey');
});

// ===== timeline =====

const timelineEl = document.getElementById('timeline');
const dotsEl = document.getElementById('timeline-dots');
const counterEl = document.getElementById('journey-counter');
let timelineRendered = false;

const renderTimeline = () => {
  if (timelineRendered) return;
  timelineRendered = true;

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
        ? `<img src="${item.photo}" alt="${item.caption}" loading="lazy" />`
        : `<div>
             <div class="placeholder-icon">📷</div>
             <div class="placeholder-text">foto de ${item.date.toLowerCase()}</div>
           </div>`;
      card.innerHTML = `
        <div class="card-photo">${photoContent}</div>
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

  // dot click → scroll to card
  dotsEl.addEventListener('click', (e) => {
    const dot = e.target.closest('.dot');
    if (!dot) return;
    const card = timelineEl.children[Number(dot.dataset.index)];
    card?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  });

  // scroll listener → update dots + counter
  let scrollTimer;
  timelineEl.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const center = timelineEl.scrollLeft + timelineEl.clientWidth / 2;
      let closestIdx = 0;
      let closestDist = Infinity;
      Array.from(timelineEl.children).forEach((card, i) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const d = Math.abs(cardCenter - center);
        if (d < closestDist) {
          closestDist = d;
          closestIdx = i;
        }
      });
      Array.from(dotsEl.children).forEach((d, i) => {
        d.classList.toggle('active', i === closestIdx);
      });
      counterEl.textContent = `${closestIdx + 1} / ${TIMELINE.length}`;
    }, 80);
  }, { passive: true });

  // botão do card final → vai pra próxima tela
  timelineEl.addEventListener('click', (e) => {
    if (e.target.id === 'btn-to-loves') {
      goToScreen('loves');
    }
  });
};

// ===== loves =====

const lovesListEl = document.getElementById('loves-list');
const btnToGame = document.getElementById('btn-to-game');
let lovesRendered = false;
let lovesObserver = null;

const renderLoves = () => {
  if (lovesRendered) return;
  lovesRendered = true;

  lovesListEl.innerHTML = '';
  LOVES.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'love-item';
    li.innerHTML = `
      <span class="love-emoji">${item.emoji}</span>
      <div class="love-text">
        <strong>${item.text}</strong>
        ${item.sub ? `<small>${item.sub}</small>` : ''}
      </div>
    `;
    lovesListEl.appendChild(li);
  });

  if (lovesObserver) lovesObserver.disconnect();
  const scrollRoot = document.querySelector('.loves-scroll');
  lovesObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        lovesObserver.unobserve(e.target);
      }
    });
  }, { root: scrollRoot, threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

  Array.from(lovesListEl.children).forEach((li) => lovesObserver.observe(li));
};

btnToGame?.addEventListener('click', () => {
  goToScreen('game');
});

// ===== memory game =====

const boardEl = document.getElementById('game-board');
const pairsEl = document.getElementById('game-pairs');
const movesEl = document.getElementById('game-moves');
const btnRestart = document.getElementById('btn-game-restart');
const winOverlay = document.getElementById('game-win');
const btnToFinal = document.getElementById('btn-to-final');

let gameState = null;

const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const renderCardFront = (pair) => {
  if (pair.photo) {
    return `<img src="${pair.photo}" alt="${pair.label}" loading="lazy" />`;
  }
  return `
    <span class="face-emoji">${pair.emoji}</span>
    <span class="face-label">${pair.label}</span>
  `;
};

const renderGame = () => {
  gameState = {
    cards: shuffle(PAIRS.concat(PAIRS)),
    flipped: [],
    matched: new Set(),
    moves: 0,
    locked: false,
  };

  boardEl.innerHTML = '';
  pairsEl.textContent = `0/${PAIRS.length}`;
  movesEl.textContent = '0';
  winOverlay.hidden = true;

  gameState.cards.forEach((pair, idx) => {
    const card = document.createElement('button');
    card.className = 'memory-card';
    card.type = 'button';
    card.dataset.id = pair.id;
    card.dataset.index = idx;
    card.innerHTML = `
      <div class="card-face card-face-back"></div>
      <div class="card-face card-face-front">${renderCardFront(pair)}</div>
    `;
    card.addEventListener('click', () => onCardClick(card, idx));
    boardEl.appendChild(card);
  });
};

const onCardClick = (card, idx) => {
  if (!gameState || gameState.locked) return;
  if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

  card.classList.add('flipped');
  gameState.flipped.push({ card, idx, id: card.dataset.id });

  if (gameState.flipped.length === 2) {
    gameState.moves++;
    movesEl.textContent = String(gameState.moves);
    checkMatch();
  }
};

const checkMatch = () => {
  const [a, b] = gameState.flipped;
  if (a.id === b.id) {
    a.card.classList.add('matched');
    b.card.classList.add('matched');
    gameState.matched.add(a.id);
    gameState.flipped = [];
    pairsEl.textContent = `${gameState.matched.size}/${PAIRS.length}`;
    spawnConfetti(15);

    if (gameState.matched.size === PAIRS.length) {
      setTimeout(showWin, 700);
    }
  } else {
    gameState.locked = true;
    setTimeout(() => {
      a.card.classList.remove('flipped');
      b.card.classList.remove('flipped');
      gameState.flipped = [];
      gameState.locked = false;
    }, 850);
  }
};

const showWin = () => {
  winOverlay.hidden = false;
  spawnConfetti(60);
};

btnRestart?.addEventListener('click', renderGame);

btnToFinal?.addEventListener('click', () => {
  goToScreen('final');
});

// ===== tela final =====

const finalDateEl = document.getElementById('final-date');
const finalBadgeEl = document.getElementById('final-badge');
const finalBodyEl = document.getElementById('final-body');
const finalSigEl = document.getElementById('final-signature');
const finalRestartBtn = document.getElementById('btn-final-restart');
const finalHeartsEl = document.getElementById('final-bg-hearts');

let finalRendered = false;
let finalHeartsInterval = null;

const renderFinal = () => {
  if (!finalRendered) {
    finalRendered = true;

    finalDateEl.textContent = FINAL.date;
    finalBadgeEl.textContent = FINAL.badge;
    finalSigEl.textContent = FINAL.signature;
    finalRestartBtn.textContent = FINAL.restartLabel;

    finalBodyEl.innerHTML = '';
    FINAL.paragraphs.forEach((text) => {
      const p = document.createElement('p');
      p.className = 'final-paragraph';
      p.textContent = text;
      finalBodyEl.appendChild(p);
    });

    finalRestartBtn.addEventListener('click', () => {
      stopFinalHearts();
      welcomePlayed = false;
      timelineRendered = false;
      lovesRendered = false;
      finalRendered = false;
      noClickCount = 0;
      btnNo.style.transform = '';
      hint.classList.remove('show');
      goToScreen('gate');
    });
  }

  // revela parágrafos em cascata
  const paras = finalBodyEl.querySelectorAll('.final-paragraph');
  paras.forEach((p, i) => {
    setTimeout(() => p.classList.add('revealed'), 1600 + i * 1100);
  });

  const lastDelay = 1600 + paras.length * 1100;
  setTimeout(() => finalSigEl.classList.add('revealed'), lastDelay);
  setTimeout(() => finalRestartBtn.classList.add('revealed'), lastDelay + 800);

  startFinalHearts();
};

const startFinalHearts = () => {
  stopFinalHearts();
  const drop = () => {
    const heart = document.createElement('div');
    heart.className = 'final-bg-heart';
    heart.textContent = ['💛', '💗', '💛', '🤍'][Math.floor(Math.random() * 4)];
    heart.style.left = (5 + Math.random() * 90) + '%';
    heart.style.bottom = '-20px';
    heart.style.fontSize = (0.9 + Math.random() * 1.2) + 'rem';
    heart.style.animationDuration = (6 + Math.random() * 6) + 's';
    finalHeartsEl.appendChild(heart);
    setTimeout(() => heart.remove(), 12000);
  };
  for (let i = 0; i < 4; i++) setTimeout(drop, i * 600);
  finalHeartsInterval = setInterval(drop, 900);
};

const stopFinalHearts = () => {
  if (finalHeartsInterval) {
    clearInterval(finalHeartsInterval);
    finalHeartsInterval = null;
  }
};

// ===== navegação entre telas =====

const goToScreen = (name) => {
  Object.entries(screens).forEach(([key, el]) => {
    if (!el) return;
    el.classList.toggle('active', key === name);
  });
  if (name === 'welcome') playWelcomeSequence();
  if (name === 'journey') renderTimeline();
  if (name === 'loves') renderLoves();
  if (name === 'game') renderGame();
  if (name === 'final') renderFinal();
  if (name !== 'final') stopFinalHearts();
};

// ===== confetes =====

const colors = ['#ff5e8a', '#ffd93d', '#6bcb77', '#ffffff', '#e0436e'];

const spawnConfetti = (count = 30) => {
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = (2 + Math.random() * 2.5) + 's';
    piece.style.animationDelay = (Math.random() * 0.4) + 's';
    piece.style.width = piece.style.height = (6 + Math.random() * 8) + 'px';
    (confettiLayer || document.body).appendChild(piece);
    setTimeout(() => piece.remove(), 5000);
  }
};

// ===== áudio =====

let musicEnabled = false;

const tryPlayMusic = async () => {
  if (!music || musicEnabled) return;
  try {
    music.volume = 0.4;
    await music.play();
    musicEnabled = true;
    btnMute.hidden = false;
    btnMute.textContent = '🔊';
  } catch (err) {
    // navegador bloqueou autoplay — sem música, sem drama
  }
};

btnMute.addEventListener('click', () => {
  if (music.paused) {
    music.play();
    btnMute.textContent = '🔊';
  } else {
    music.pause();
    btnMute.textContent = '🔇';
  }
});

// ===== util =====

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ===== easter eggs (plugados após DOM pronto) =====

setupEggWelcomeName(welcomeName, spawnConfetti);
setupEggTimelineCounter(counterEl);
setupEggKonami(spawnConfetti);

const wireUpFinalEgg = () => {
  const finalHeart = document.querySelector('#screen-final .final-heart');
  if (finalHeart) setupEggFinalHeart(finalHeart, spawnConfetti, finalHeartsEl);
};

// boot
goToScreen('gate');
wireUpFinalEgg();
