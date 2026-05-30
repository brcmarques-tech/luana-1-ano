// TELA: sliding puzzle — peças deslizam pra slot vazio (clássico 15-puzzle).
// Foto dividida em SxS peças. Toque numa peça adjacente à vazia pra mover.

import { PUZZLE } from '../puzzle-data.js';
import { PAIRS } from '../game-data.js';
import { goToScreen, registerScreenEnter } from '../nav.js';
import { unlock } from '../achievements.js';
import { haptic, HAPTIC } from '../haptic.js';
import { spawnConfetti } from '../confetti.js';
import { imgBase } from '../utils.js';

const PUZZLE_DONE_KEY = 'luana_puzzle_done';
const PUZZLE_500_KEY  = 'luana_puzzle_500';

let boardEl, movesEl, completeOverlay;
let state = null;
let rendered = false;
let puzzlePhotoUrl = null;
let totalMoves = 0;

const MILESTONE_MSGS = [
  { moves: 100, text: '100 jogadas... aquecimento feito. agora começa de verdade. 😌' },
  { moves: 110, text: '110. você tá bem? precisa de água? 💧' },
  { moves: 120, text: '120 jogadas. a foto tá quase lá. (spoiler: não tá.) 😅' },
  { moves: 130, text: '130... olha, pelo menos você tá se divertindo, né? né? 😬' },
  { moves: 140, text: '140 jogadas. já tentou desligar e ligar de novo? 🤔' },
  { moves: 150, text: '150! você é oficialmente teimosa. isso é um elogio. 💪' },
  { moves: 160, text: '160 jogadas. o puzzle tá sentindo sua determinação. quer dizer, não sente, é um puzzle.' },
  { moves: 170, text: '170... vai lá, você consegue. (eu acho.) 🫤' },
  { moves: 180, text: '180 jogadas. o Bruno tá orgulhoso. eu também. o puzzle não.' },
  { moves: 190, text: '190... honestamente? respeito. muito respeito. 🫡' },
  { moves: 200, text: '200 JOGADAS. isso merecia um troféu. infelizmente só tenho esse emoji: 🏅' },
  { moves: 210, text: '210. a peça do canto tá te olhando com medo agora. 👀' },
  { moves: 220, text: '220 jogadas. lembro quando eram só 10. cresceram tão rápido... 🥲' },
  { moves: 230, text: '230... você sabia que a Grande Muralha da China foi construída tijolo por tijolo? igual você tá fazendo. lentamente. 🧱' },
  { moves: 240, text: '240 jogadas. se isso fosse xadrez você teria virado grão-mestre. pena que não é.' },
  { moves: 250, text: '250! metade do caminho para a lenda. ou você já é a lenda. difícil dizer. 🌟' },
  { moves: 260, text: '260 jogadas. o puzzle jurou que tá quase resolvido. ele mente muito.' },
  { moves: 270, text: '270... já considerou que talvez a foto não queira ser montada? 🤷' },
  { moves: 280, text: '280 jogadas. Darwin dizia que sobrevive quem se adapta. você claramente sobreviveu.' },
  { moves: 290, text: '290... tô começando a achar que você gosta disso. 🧐' },
  { moves: 300, text: '300 JOGADAS. ISSO É ESPARTANO. "ESTA É ESPARTA!" — você, provavelmente. ⚔️' },
  { moves: 310, text: '310. as peças perceberam que você não vai desistir. elas tão com medo.' },
  { moves: 320, text: '320 jogadas. em algum universo paralelo você já terminou há muito tempo. mas não nesse.' },
  { moves: 330, text: '330... você sabia que o Rock Lee fez 1000 flexões por dia? você tá indo bem. 🥋' },
  { moves: 340, text: '340 jogadas. honestamente o Guy-sensei estaria em lágrimas de orgulho agora.' },
  { moves: 350, text: '350! você cruzou o equador. é só mais 150 até a lenda. simples assim. 🌍' },
  { moves: 360, text: '360 jogadas. uma volta completa ao redor do puzzle. filosofia.' },
  { moves: 370, text: '370... você sabe que pode parar a qualquer momento, né? (não para.) 🔥' },
  { moves: 380, text: '380 jogadas. nesse ritmo você resolve a paz mundial antes do puzzle. 🕊️' },
  { moves: 390, text: '390... tô sem palavras. tenho apenas respeito. respeito absurdo.' },
  { moves: 400, text: '400 JOGADAS. isso virou um estilo de vida. você é o puzzle agora. 🧩' },
  { moves: 410, text: '410. o Guy-sensei estaria correndo 800 voltas em seu nome nesse momento.' },
  { moves: 420, text: '420 jogadas. você não é mais uma jogadora. você é uma força da natureza. 🌪️' },
  { moves: 430, text: '430... dizem que 10.000 horas fazem um especialista. você tá no caminho.' },
  { moves: 440, text: '440 jogadas. em algum momento isso virou arte. tô impressionado.' },
  { moves: 450, text: '450! faltam 50 para a história mudar. prepare-se. 👁️' },
  { moves: 460, text: '460 jogadas. o puzzle já te respeita mais do que qualquer coisa no universo.' },
  { moves: 470, text: '470... a lenda está sendo escrita. cada jogada é um capítulo.' },
  { moves: 480, text: '480 jogadas. 20 para a imortalidade. ou pelo menos para poder pular. 😅' },
  { moves: 490, text: '490... essa é a jogada 490. estou tremendo de emoção. 🫨' },
];

const showMilestoneToast = (text) => {
  const t = document.createElement('div');
  t.className = 'puzzle-milestone-toast';
  t.textContent = text;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 400);
  }, 3500);
};

const show500Message = () => {
  if (localStorage.getItem(PUZZLE_500_KEY)) return;
  localStorage.setItem(PUZZLE_500_KEY, '1');
  document.getElementById('puzzle-skip')?.removeAttribute('hidden');

  const el = document.createElement('div');
  el.className = 'puzzle-500-msg';
  el.innerHTML = `
    <p class="p500-quote">"ela só tem persistência..."</p>
    <p class="p500-quote">"sem talento, nunca vai conseguir."</p>
    <p class="p500-reveal">500 jogadas depois — olha ela.</p>
    <p class="p500-praise">você já provou seu valor, Luana.</p>
    <p class="p500-sub">pode avançar quando quiser. 🔥</p>
    <button class="p500-close">entendi 💪</button>
  `;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  el.querySelector('.p500-close').addEventListener('click', () => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 400);
  });
};

const pickPuzzlePhoto = () => {
  const usedInMemory = new Set(PAIRS.map(p => p.photo));
  const pool = Array.from({ length: 30 }, (_, i) =>
    `assets/img/game-${String(i + 1).padStart(2, '0')}.jpg`
  ).filter(p => !usedInMemory.has(p));
  const pick = pool[Math.floor(Math.random() * pool.length)];
  puzzlePhotoUrl = `${imgBase()}/${pick.replace('assets/img/', '')}`;
};

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

const VERSES = [
  { text: 'Quem pode achar uma mulher virtuosa? O seu valor muito excede o de rubis.', ref: 'Provérbios 31:10' },
  { text: 'O coração do seu marido confia nela; assim ele não precisará de ganhos desonestos.', ref: 'Provérbios 31:11' },
  { text: 'Ela lhe faz bem e não mal, todos os dias da sua vida.', ref: 'Provérbios 31:12' },
  { text: 'A força e a honra são as suas vestes, e ela se rirá do dia futuro.', ref: 'Provérbios 31:25' },
  { text: 'Ela abre a boca com sabedoria, e a lei da benignidade está na sua língua.', ref: 'Provérbios 31:26' },
  { text: 'Levantam-se seus filhos e a consideram feliz; também o seu marido a louva.', ref: 'Provérbios 31:28' },
  { text: 'Muitas filhas têm procedido virtuosamente, mas tu a todas sobrepujas.', ref: 'Provérbios 31:29' },
  { text: 'Enganosa é a graça e vã a formosura, mas a mulher que teme ao Senhor será louvada.', ref: 'Provérbios 31:30' },
  { text: 'A mulher virtuosa é a coroa do seu marido.', ref: 'Provérbios 12:4' },
  { text: 'Quem acha uma esposa acha uma coisa boa e alcança o favor do Senhor.', ref: 'Provérbios 18:22' },
  { text: 'A casa e os bens são herança dos pais, mas a mulher prudente vem do Senhor.', ref: 'Provérbios 19:14' },
  { text: 'Goza a vida com a mulher que amas, todos os dias da tua vida de vaidade.', ref: 'Eclesiastes 9:9' },
  { text: 'Toda formosa és tu, minha amada, e em ti não há defeito algum.', ref: 'Cânticos 4:7' },
  { text: 'O meu amado é meu e eu sou dele.', ref: 'Cânticos 2:16' },
  { text: 'Coloca-me como selo sobre o teu coração. Porque o amor é forte como a morte.', ref: 'Cânticos 8:6' },
  { text: 'Toda a cidade do meu povo sabe que és mulher virtuosa.', ref: 'Rute 3:11' },
  { text: 'O amor é paciente, o amor é bondoso. Não tem inveja, não se vangloria, não se orgulha.', ref: '1 Coríntios 13:4' },
  { text: 'O amor tudo sofre, tudo crê, tudo espera, tudo suporta. O amor jamais acaba.', ref: '1 Coríntios 13:7-8' },
  { text: 'Acima de tudo, porém, revesti-vos do amor, que é o vínculo da perfeição.', ref: 'Colossenses 3:14' },
  { text: 'Por isso o homem deixará seu pai e sua mãe e se unirá à sua mulher, tornando-se os dois uma só carne.', ref: 'Gênesis 2:24' },
  { text: 'Não havia entre eles alguém necessitado, porque os que possuíam... dividiam com todos.', ref: 'Atos 4:34' },
  { text: 'Sede bondosos e compassivos uns para com os outros, perdoando-vos mutuamente.', ref: 'Efésios 4:32' },
  { text: 'Ninguém tem amor maior do que este: dar a própria vida pelos seus amigos.', ref: 'João 15:13' },
  { text: 'Três coisas permanecem: a fé, a esperança e o amor. A maior delas é o amor.', ref: '1 Coríntios 13:13' },
  { text: 'A mulher sábia edifica a sua casa, mas a tola a derruba com as próprias mãos.', ref: 'Provérbios 14:1' },
  { text: 'Como é agradável e boa a convivência entre irmãos!', ref: 'Salmos 133:1' },
  { text: 'O teu amor é melhor do que o vinho.', ref: 'Cânticos 1:2' },
  { text: 'Formosa és, minha amada, agradável como Jerusalém.', ref: 'Cânticos 6:4' },
  { text: 'A mulher que teme o Senhor será louvada. Dai-lhe o fruto das suas mãos.', ref: 'Provérbios 31:30-31' },
  { text: 'Alegra-te com a mulher da tua mocidade.', ref: 'Provérbios 5:18' },
];

let verseInterval = null;

const startVersesTicker = () => {
  const ticker = document.getElementById('puzzle-verses');
  if (!ticker) return;
  let idx = Math.floor(Math.random() * VERSES.length);

  const showNext = () => {
    const v = VERSES[idx % VERSES.length];
    idx++;
    ticker.innerHTML = `<span class="verse-text">${v.text}</span><span class="verse-ref"> — ${v.ref}</span>`;
    ticker.classList.remove('verse-in');
    void ticker.offsetWidth;
    ticker.classList.add('verse-in');
  };

  showNext();
  verseInterval = setInterval(showNext, 6000);
};

const stopVersesTicker = () => {
  clearInterval(verseInterval);
  verseInterval = null;
};

// ===== render =====

const render = () => {
  if (!rendered) {
    rendered = true;
    pickPuzzlePhoto();
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
      ${localStorage.getItem(PUZZLE_DONE_KEY) ? '<button id="puzzle-skip" class="btn-skip" type="button">pular jogo →</button>' : '<button id="puzzle-skip" class="btn-skip" type="button" hidden>pular jogo →</button>'}
    </header>
    <div class="puzzle-board" id="puzzle-board"></div>
    <div class="puzzle-verses" id="puzzle-verses"></div>
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
  document.getElementById('puzzle-win-btn').addEventListener('click', () => goToScreen('final'));
  document.getElementById('puzzle-skip')?.addEventListener('click', () => goToScreen('final'));
  startVersesTicker();
};

const newGame = () => {
  const size = PUZZLE.size;
  const { tiles, empty } = generateSolvable(size);

  state = { size, tiles, empty, moves: 0 };
  movesEl.textContent = '0';
  completeOverlay.hidden = true;

  const photoUrl = puzzlePhotoUrl || `${imgBase()}/${PUZZLE.photoKey}.jpg`;

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
  totalMoves++;
  movesEl.textContent = String(state.moves);

  rerenderTiles(state.imgOk !== false ? (puzzlePhotoUrl || `${imgBase()}/${PUZZLE.photoKey}.jpg`) : null);

  const milestone = MILESTONE_MSGS.find(m => m.moves === totalMoves);
  if (milestone) showMilestoneToast(milestone.text);
  if (totalMoves === 500 && !localStorage.getItem(PUZZLE_500_KEY)) show500Message();

  if (isSolved(state.tiles)) {
    setTimeout(showWin, 350);
  }
};

const showWin = () => {
  completeOverlay.hidden = false;
  spawnConfetti(50);
  unlock('puzzle-master');
  localStorage.setItem(PUZZLE_DONE_KEY, '1');
  document.getElementById('puzzle-skip')?.removeAttribute('hidden');
};

// ===== boot =====

export const initPuzzle = () => {
  registerScreenEnter('puzzle', render);
};
