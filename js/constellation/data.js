// Estado da Constelação: 7 perguntas, persistência API + localStorage fallback.
// Cada resposta acende uma estrela. Após 7/7, libera o reveal final.

import { API_URL } from '../config.js';
import { getToken } from '../progress.js';
import { applyOverride } from '../content-overrides.js';

const LS_KEY = 'luana_constellation';
const DAY_MS = 24 * 60 * 60 * 1000;

// ===== as 7 perguntas =====

const _QUESTIONS_DEFAULT = [
  {
    day: 1,
    title: 'lembrança',
    quote: { text: 'amar se aprende amando', author: 'Drummond' },
    text: 'qual foi a primeira coisa em mim que te conquistou?',
    options: [
      { id: 'a', label: 'o jeito que ele me olha' },
      { id: 'b', label: 'algo que ele me falou' },
      { id: 'c', label: 'um silêncio que disse muita coisa' },
      { id: 'd', label: 'outra coisa…', freeText: true },
    ],
  },
  {
    day: 2,
    title: 'cotidiano',
    quote: { text: 'amar é deslocar a alma de casa em casa', author: 'Mario Quintana' },
    text: 'qual meu hábito que você mais ama hoje?',
    options: [
      { id: 'a', label: 'como ele acorda' },
      { id: 'b', label: 'como ele me abraça' },
      { id: 'c', label: 'as coisas que ele lembra sem eu pedir' },
      { id: 'd', label: 'outra…', freeText: true },
    ],
  },
  {
    day: 3,
    title: 'humor',
    quote: { text: 'ser feliz é viver morto de paixão', author: 'Vinicius de Moraes' },
    text: 'o que mais te faz rir nele?',
    options: [
      { id: 'a', label: 'os comentários aleatórios' },
      { id: 'b', label: 'as imitações ruins' },
      { id: 'c', label: 'quando ele se enrola tentando falar sério' },
      { id: 'd', label: 'outra…', freeText: true },
    ],
  },
  {
    day: 4,
    title: 'segurança',
    quote: { text: 'o mundo que é nosso é sempre tão pequeno e infinito que só cabe no olhar de uma criança', author: 'Mia Couto' },
    text: 'quando você se sentiu mais segura com ele?',
    options: [
      { id: 'a', label: 'num dia ruim que ele me carregou' },
      { id: 'b', label: 'numa briga que terminamos bem' },
      { id: 'c', label: 'num silêncio compartilhado' },
      { id: 'd', label: 'outra…', freeText: true },
    ],
  },
  {
    day: 5,
    title: 'futuro',
    quote: { text: 'de longe te hei de amar — da tranquila distância em que o amor é saudade e o desejo, constância', author: 'Cecília Meireles' },
    text: 'o que você quer fazer com ele esse próximo ano?',
    options: [
      { id: 'a', label: 'viajar pra um lugar que a gente nunca foi' },
      { id: 'b', label: 'construir uma casa nossa' },
      { id: 'c', label: 'continuar exatamente como tá' },
      { id: 'd', label: 'outra…', freeText: true },
    ],
  },
  {
    day: 6,
    title: 'ele em uma palavra',
    quote: { text: 'amar é poder deixar que o amado exista enquanto tal, como ele mesmo', author: 'Adélia Prado' },
    text: 'se tivesse que escolher uma palavra pra descrever ele, qual seria?',
    freeTextOnly: true,
    placeholder: 'uma palavra (ou duas, se precisar)',
    maxLength: 40,
  },
  {
    day: 7,
    title: 'o momento',
    quote: { text: 'a vida é muito bela, basta um beijo e o delicado mecanismo se move', author: 'Adélia Prado' },
    text: 'se você pudesse reviver um único momento desse ano, qual seria?',
    freeTextOnly: true,
    placeholder: 'conta esse momento…',
    maxLength: 280,
  },
];

export const QUESTIONS = applyOverride('questions', _QUESTIONS_DEFAULT);

// ===== coordenadas do reveal final =====

const _REVEAL_DEFAULT = {
  lat: -32.23775,
  lon: -53.08528,
  dms: `32°14'15.9"S 53°05'07.0"W`,
  date: '17/06/2025',
};

export const REVEAL = applyOverride('reveal', _REVEAL_DEFAULT);

// ===== estado local + sincronização =====

let _state = {
  answers: {},        // { 1: { optionId, text, ts }, 2: {...}, ... }
  firstAccess: null,  // timestamp do primeiro acesso à constelação
  synced: false,
};

const lsLoad = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
};

const lsSave = (s) => {
  try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch {}
};

// ===== API helpers =====

const apiOk = () => Boolean(API_URL) && Boolean(getToken());

const apiGet = async () => {
  const res = await fetch(`${API_URL}/constellation/${getToken()}`);
  if (!res.ok) throw new Error('api fail');
  return res.json();
};

const apiPost = async (day, payload) => {
  const res = await fetch(`${API_URL}/constellation/${getToken()}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ day, ...payload }),
  });
  if (!res.ok) throw new Error('api fail');
  return res.json();
};

// ===== API pública =====

export const initConstellation = async () => {
  // atalho de debug: ?cn=complete força as 7 respostas
  if (new URLSearchParams(location.search).get('cn') === 'complete') {
    _state = {
      firstAccess: Date.now() - 7 * DAY_MS,
      answers: {
        1: { optionId: 'a', text: '', ts: Date.now() },
        2: { optionId: 'a', text: '', ts: Date.now() },
        3: { optionId: 'a', text: '', ts: Date.now() },
        4: { optionId: 'a', text: '', ts: Date.now() },
        5: { optionId: 'a', text: '', ts: Date.now() },
        6: { optionId: null, text: 'meu', ts: Date.now() },
        7: { optionId: null, text: 'aquela tarde', ts: Date.now() },
      },
      synced: false,
    };
    lsSave(_state);
    return getStatus();
  }

  const local = lsLoad();
  if (local) _state = { ..._state, ...local };
  if (!_state.firstAccess) {
    _state.firstAccess = Date.now();
    lsSave(_state);
  }

  if (apiOk()) {
    try {
      const remote = await apiGet();
      _state.answers = { ..._state.answers, ...(remote.answers ?? {}) };
      if (remote.firstAccess) _state.firstAccess = remote.firstAccess;
      _state.synced = true;
      lsSave(_state);
    } catch { /* offline mode */ }
  }
  return getStatus();
};

export const getStatus = () => {
  const day = currentDay();
  const answered = Object.keys(_state.answers).length;
  const todayAnswered = day >= 1 && day <= 7 && Boolean(_state.answers[day]);
  const canAnswerToday = day >= 1 && day <= 7 && !todayAnswered;
  const complete = answered >= 7;
  return { day, answered, canAnswerToday, todayAnswered, complete };
};

export const currentDay = () => {
  if (!_state.firstAccess) return 1;
  const diff = Date.now() - _state.firstAccess;
  return Math.min(7, Math.max(1, Math.floor(diff / DAY_MS) + 1));
};

export const msUntilNextDay = () => {
  if (!_state.firstAccess) return 0;
  const day = currentDay();
  return _state.firstAccess + day * DAY_MS - Date.now();
};

export const getAnswers = () => ({ ..._state.answers });

export const saveAnswer = async (day, { optionId = null, text = '' }) => {
  _state.answers[day] = { optionId, text, ts: Date.now() };
  lsSave(_state);
  if (apiOk()) {
    apiPost(day, { optionId, text }).catch(() => {});
  }
  return getStatus();
};

// força respostas pros 7 dias (atalho de debug — digitar "constelation" no teclado)
export const forceComplete = async () => {
  _state = {
    firstAccess: Date.now() - 7 * DAY_MS,
    answers: {
      1: { optionId: 'a', text: '', ts: Date.now() },
      2: { optionId: 'a', text: '', ts: Date.now() },
      3: { optionId: 'a', text: '', ts: Date.now() },
      4: { optionId: 'a', text: '', ts: Date.now() },
      5: { optionId: 'a', text: '', ts: Date.now() },
      6: { optionId: null, text: 'meu',          ts: Date.now() },
      7: { optionId: null, text: 'aquela tarde', ts: Date.now() },
    },
    synced: false,
  };
  lsSave(_state);
  if (apiOk()) {
    for (const [day, ans] of Object.entries(_state.answers)) {
      apiPost(Number(day), { optionId: ans.optionId, text: ans.text }).catch(() => {});
    }
  }
  return getStatus();
};
