// Navegação entre telas + transições anime + troca de track de música.
// Cada screen registra um callback onEnter(name) opcional via registerScreenEnter.

import { animeTransition } from './transitions.js';
import { playTrack, preloadTrack, primeTrack } from './music.js';
import { updateHUDForScreen } from './hud.js';

const SCREEN_IDS = [
  'gate',
  'loading',
  'welcome',
  'hanami',
  'journey',
  'serendipity',
  'loves',
  'game',
  'puzzle',
  'card',
  'final',
  'constellation',
  'locked',
];

const ANIME_TRANSITION_SCREENS = new Set([
  'welcome', 'hanami', 'journey', 'serendipity', 'loves', 'game', 'puzzle', 'card', 'final', 'constellation',
]);

// música padrão por tela (algumas calculam dinamicamente, override no main)
const SCREEN_TRACK = {
  gate:     'gate',
  welcome:  'welcome',
  hanami:   'welcome',
  timeline:    'timeline-01',
  serendipity: 'loves',
  loves:       'loves',
  game:          'game',
  puzzle:        'game',
  constellation: 'constellation',
  final:         'final',
};

const NEXT_TRACK = {
  gate: 'welcome',
  welcome: 'loves',
  hanami: 'loves',
  serendipity: 'loves',
  loves: 'game',
  game: 'puzzle',
  puzzle: 'final',
};

const screens = {};
const enterHandlers = new Map();
const exitHandlers = new Map();

export const initNav = () => {
  for (const id of SCREEN_IDS) {
    screens[id] = document.getElementById(`screen-${id}`);
  }
};

export const getScreenEl = (name) => screens[name];

export const registerScreenEnter = (name, fn) => {
  enterHandlers.set(name, fn);
};

export const registerScreenExit = (name, fn) => {
  exitHandlers.set(name, fn);
};

let currentScreen = null;
const _history = [];

// telas que NÃO entram no histórico (ela não "volta" pra elas)
const NO_HISTORY = new Set(['loading', 'locked']);

export const goToScreen = async (name, { fromHistory = false } = {}) => {
  document.body.classList.toggle('screen-loading', name === 'loading');

  const isFirstLoad = !document.querySelector('.screen.active');
  if (SCREEN_TRACK[name]) primeTrack(SCREEN_TRACK[name]);
  if (ANIME_TRANSITION_SCREENS.has(name) && !isFirstLoad) {
    await animeTransition(name);
  }

  // empilha a tela atual antes de mudar (a menos que viemos do goBack)
  if (!fromHistory && currentScreen && currentScreen !== name && !NO_HISTORY.has(currentScreen)) {
    _history.push(currentScreen);
    // limita histórico (evita loops/memória)
    if (_history.length > 50) _history.shift();
  }

  // se voltou pra gate, zera o histórico (é "reset")
  if (name === 'gate') _history.length = 0;

  Object.entries(screens).forEach(([key, el]) => {
    if (!el) return;
    el.classList.toggle('active', key === name);
  });

  if (currentScreen && exitHandlers.has(currentScreen)) {
    exitHandlers.get(currentScreen)(name);
  }

  if (SCREEN_TRACK[name]) playTrack(SCREEN_TRACK[name]);
  if (NEXT_TRACK[name]) preloadTrack(NEXT_TRACK[name]);

  if (enterHandlers.has(name)) enterHandlers.get(name)();

  updateHUDForScreen(name);
  currentScreen = name;
  document.body.dataset.screen = name;
};

export const goBack = () => {
  const prev = _history.pop();
  if (!prev) return false;
  goToScreen(prev, { fromHistory: true });
  return true;
};

export const canGoBack = () => _history.length > 0;
export const getCurrentScreen = () => currentScreen;
