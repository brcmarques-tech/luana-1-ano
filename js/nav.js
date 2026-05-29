// Navegação entre telas + transições anime + troca de track de música.
// Cada screen registra um callback onEnter(name) opcional via registerScreenEnter.

import { animeTransition } from './transitions.js';
import { playTrack, preloadTrack } from './music.js';
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
  gate: 'gate',
  welcome: 'welcome',
  hanami: 'welcome',
  loves: 'loves',
  game: 'game',
  card: 'card',
  final: 'final',
};

const NEXT_TRACK = {
  gate: 'welcome',
  welcome: 'loves',
  hanami: 'loves',
  serendipity: 'loves',
  loves: 'game',
  game: 'card',
  card: 'final',
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

export const goToScreen = async (name) => {
  document.body.classList.toggle('screen-loading', name === 'loading');

  const isFirstLoad = !document.querySelector('.screen.active');
  if (ANIME_TRANSITION_SCREENS.has(name) && !isFirstLoad) {
    await animeTransition(name);
  }

  Object.entries(screens).forEach(([key, el]) => {
    if (!el) return;
    el.classList.toggle('active', key === name);
  });

  if (currentScreen && exitHandlers.has(currentScreen)) {
    exitHandlers.get(currentScreen)(name);
  }

  // troca música default (screens com track dinâmico fazem override no enter)
  if (SCREEN_TRACK[name]) playTrack(SCREEN_TRACK[name]);
  if (NEXT_TRACK[name]) preloadTrack(NEXT_TRACK[name]);

  if (enterHandlers.has(name)) enterHandlers.get(name)();

  updateHUDForScreen(name);
  currentScreen = name;
};

export const getCurrentScreen = () => currentScreen;
