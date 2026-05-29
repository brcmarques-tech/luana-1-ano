// TELA: memory game — 6 pares (3x4), flip 3D, lock anti-cheat.

import { PAIRS } from '../game-data.js';
import { goToScreen, registerScreenEnter } from '../nav.js';
import { unlock } from '../achievements.js';
import { haptic, HAPTIC } from '../haptic.js';
import { spawnConfetti } from '../confetti.js';

let boardEl, pairsEl, movesEl, winOverlay;
let state = null;

const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const renderFront = (pair) => {
  if (pair.photo) return `<img src="${pair.photo}" alt="${pair.label}" loading="lazy" />`;
  return `<span class="face-emoji">${pair.emoji}</span><span class="face-label">${pair.label}</span>`;
};

const showWin = () => {
  winOverlay.hidden = false;
  spawnConfetti(60);
  unlock('memory-master');
};

const checkMatch = () => {
  const [a, b] = state.flipped;
  if (a.id === b.id) {
    haptic(HAPTIC.match);
    a.card.classList.add('matched');
    b.card.classList.add('matched');
    state.matched.add(a.id);
    state.flipped = [];
    pairsEl.textContent = `${state.matched.size}/${PAIRS.length}`;
    spawnConfetti(15);
    if (state.matched.size === PAIRS.length) setTimeout(showWin, 700);
  } else {
    state.locked = true;
    setTimeout(() => {
      a.card.classList.remove('flipped');
      b.card.classList.remove('flipped');
      state.flipped = [];
      state.locked = false;
    }, 850);
  }
};

const onCardClick = (card) => {
  if (!state || state.locked) return;
  if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
  card.classList.add('flipped');
  state.flipped.push({ card, id: card.dataset.id });
  if (state.flipped.length === 2) {
    state.moves++;
    movesEl.textContent = String(state.moves);
    checkMatch();
  }
};

const render = () => {
  state = {
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

  state.cards.forEach((pair) => {
    const card = document.createElement('button');
    card.className = 'memory-card';
    card.type = 'button';
    card.dataset.id = pair.id;
    card.innerHTML = `
      <div class="card-face card-face-back"></div>
      <div class="card-face card-face-front">${renderFront(pair)}</div>
    `;
    card.addEventListener('click', () => onCardClick(card));
    boardEl.appendChild(card);
  });
};

export const initMemoryGame = () => {
  boardEl    = document.getElementById('game-board');
  pairsEl    = document.getElementById('game-pairs');
  movesEl    = document.getElementById('game-moves');
  winOverlay = document.getElementById('game-win');

  document.getElementById('btn-game-restart')?.addEventListener('click', render);
  document.getElementById('btn-to-final')?.addEventListener('click', () => goToScreen('card'));

  registerScreenEnter('game', render);
};
