// TELA: sliding puzzle — peças deslizam pra slot vazio (clássico 15-puzzle).
// Foto dividida em SxS peças. Toque numa peça adjacente à vazia pra mover.

import { PUZZLE } from '../puzzle-data.js';
import { goToScreen, registerScreenEnter } from '../nav.js';
import { unlock } from '../achievements.js';
import { haptic, HAPTIC } from '../haptic.js';
import { spawnConfetti } from '../confetti.js';
import { imgBase } from '../utils.js';

let boardEl, movesEl, completeOverlay;
let state = null;
let rendered = false;

// ===== utilitários =====

const indexOf = (tiles, val) => tiles.indexOf(val);

const isAdjacent = (idx1, idx2, size) => {
  const r1 = Math.floor(idx1 / size), c1 = idx1 % size;
  const r2 = Math.floor(idx2 / size), c2 = idx2 % size;
  return (r1 === r2 && Math.abs(c1 - c2) === 1) || (c1 === c2 && Math.abs(r1 - r2) === 1);
};

// gera embaralhamento solvable (faz N movimentos aleatórios desde a posição resolvida)
const generateSolvable = (size) => {
  const total = size * size;
  const tiles = Array.from({ length: total }, (_, i) => i);
  let empty = total - 1;
  const moves = size * size * 12;
  for (let k = 0; k < moves; k++) {
    const r = Math.floor(empty / size), c = empty % size;
    const neighbors = [];
    if (r > 0)         neighbors.push(empty - size);
    if (r < size - 1)  neighbors.push(empty + size);
    if (c > 0)         neighbors.push(empty - 1);
    if (c < size - 1)  neighbors.push(empty + 1);
    const next = neighbors[Math.floor(Math.random() * neighbors.length)];
    [tiles[empty], tiles[next]] = [tiles[next], tiles[empty]];
    empty = next;
  }
  return { tiles, empty };
};

const isSolved = (tiles) => tiles.every((v, i) => v === i);

// ===== render =====

const render = () => {
  if (!rendered) {
    rendered = true;
    setupBoard();
  }
  newGame();
};

const setupBoard = () => {
  const stage = document.getElementById('puzzle-stage');
  if (!stage) return;

  stage.innerHTML = `
    <header class="puzzle-header">
      <h2 class="puzzle-title">${PUZZLE.title}</h2>
      <p class="puzzle-sub">${PUZZLE.sub}</p>
      <div class="puzzle-stats">
        <span class="puzzle-stat">jogadas: <strong id="puzzle-moves">0</strong></span>
        <button class="puzzle-restart" id="puzzle-restart" type="button">↻</button>
      </div>
    </header>
    <div class="puzzle-board" id="puzzle-board"></div>
    <div class="puzzle-win" id="puzzle-win" hidden>
      <div class="puzzle-win-content">
        <div class="puzzle-win-emoji">💛</div>
        <p class="puzzle-win-caption" id="puzzle-win-caption">${PUZZLE.caption}</p>
        <button class="btn puzzle-win-btn" id="puzzle-win-btn">continuar →</button>
      </div>
    </div>`;

  boardEl = document.getElementById('puzzle-board');
  movesEl = document.getElementById('puzzle-moves');
  completeOverlay = document.getElementById('puzzle-win');

  document.getElementById('puzzle-restart').addEventListener('click', newGame);
  document.getElementById('puzzle-win-btn').addEventListener('click', () => goToScreen('card'));
};

const newGame = () => {
  const size = PUZZLE.size;
  const { tiles, empty } = generateSolvable(size);

  state = { size, tiles, empty, moves: 0 };
  movesEl.textContent = '0';
  completeOverlay.hidden = true;

  const photoUrl = `${imgBase()}/${PUZZLE.photoKey}.jpg`;

  boardEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  boardEl.style.gridTemplateRows    = `repeat(${size}, 1fr)`;
  boardEl.innerHTML = '';

  // teste se a foto carrega - se não, usar gradient fallback
  const probe = new Image();
  probe.onload  = () => { state.imgOk = true; rerenderTiles(photoUrl); };
  probe.onerror = () => { state.imgOk = false; rerenderTiles(null); };
  probe.src = photoUrl;
  rerenderTiles(photoUrl); // renderiza preliminar (vai trocar se imagem falhar)
};

const rerenderTiles = (photoUrl) => {
  const size = state.size;
  boardEl.innerHTML = '';
  state.tiles.forEach((val, pos) => {
    const tile = document.createElement('div');
    tile.className = 'puzzle-tile';
    if (val === size * size - 1) {
      tile.classList.add('puzzle-tile--empty');
    } else {
      // posição original da peça
      const origRow = Math.floor(val / size);
      const origCol = val % size;
      if (photoUrl && state.imgOk !== false) {
        tile.style.backgroundImage = `url('${photoUrl}')`;
        tile.style.backgroundSize = `${size * 100}% ${size * 100}%`;
        tile.style.backgroundPosition = `${(origCol / (size - 1)) * 100}% ${(origRow / (size - 1)) * 100}%`;
      } else {
        // fallback: gradient + número
        tile.style.background = PUZZLE.fallbackGradient;
        tile.style.display = 'flex';
        tile.style.alignItems = 'center';
        tile.style.justifyContent = 'center';
        tile.textContent = String(val + 1);
      }
    }
    tile.dataset.pos = pos;
    tile.addEventListener('click', () => onTileClick(pos));
    boardEl.appendChild(tile);
  });
};

const onTileClick = (pos) => {
  if (!state) return;
  if (pos === state.empty) return;
  if (!isAdjacent(pos, state.empty, state.size)) return;

  haptic(HAPTIC.tap);

  // swap
  [state.tiles[pos], state.tiles[state.empty]] = [state.tiles[state.empty], state.tiles[pos]];
  state.empty = pos;
  state.moves++;
  movesEl.textContent = String(state.moves);

  rerenderTiles(state.imgOk !== false ? `${imgBase()}/${PUZZLE.photoKey}.jpg` : null);

  if (isSolved(state.tiles)) {
    setTimeout(showWin, 350);
  }
};

const showWin = () => {
  completeOverlay.hidden = false;
  spawnConfetti(50);
  unlock('puzzle-master');
};

// ===== boot =====

export const initPuzzle = () => {
  registerScreenEnter('puzzle', render);
};
