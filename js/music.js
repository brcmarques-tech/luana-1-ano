import { applyOverride } from './content-overrides.js';
import { MUSIC_DEFAULTS } from './music-config.js';

const AUDIO_BASE = 'assets/audio';

// atribuições fixas — lidas do content-override (admin) ou fallback em MUSIC_DEFAULTS
const TRACK_MAP = applyOverride('music', MUSIC_DEFAULTS);

const resolveKey = (key) => TRACK_MAP[key] ?? key;

export const resolvedTrack = resolveKey;


let _players = [null, null];
let _current = 0;
let _currentKey = null;
const _positions = new Map();

const FADE_MS = 1400;

const _fadeTimers = new Map();

const fadeVolume = (el, from, to, ms, onDone) => {
  const existing = _fadeTimers.get(el);
  if (existing !== undefined) clearInterval(existing);

  const steps = 20;
  const stepMs = ms / steps;
  const delta = (to - from) / steps;
  let s = 0;
  el.volume = from;
  const id = setInterval(() => {
    s++;
    el.volume = Math.max(0, Math.min(1, from + delta * s));
    if (s >= steps) {
      clearInterval(id);
      _fadeTimers.delete(el);
      el.volume = to;
      onDone?.();
    }
  }, stepMs);
  _fadeTimers.set(el, id);
};

export const initMusic = () => {
  _players[0] = document.getElementById('bg-music-a');
  _players[1] = document.getElementById('bg-music-b');
};


export const playTrack = (key, { loop = true, onEnded } = {}) => {
  if (key === _currentKey && loop) return;

  const curr = _players[_current];
  if (_currentKey && curr?.src) _positions.set(_currentKey, curr.currentTime);

  _currentKey = key;

  const next = 1 - _current;
  const nextP = _players[next];

  const filename = resolveKey(key);
  if (!nextP.src.endsWith(`/${filename}.mp3`)) nextP.src = `${AUDIO_BASE}/${filename}.mp3`;
  nextP.loop = loop;
  nextP.volume = 0;
  if (onEnded) nextP.addEventListener('ended', onEnded, { once: true });

  const savedPos = _positions.get(key) || 0;
  if (savedPos > 0) {
    nextP.addEventListener('loadedmetadata', () => { nextP.currentTime = savedPos; }, { once: true });
  }

  nextP.play().catch(() => {});

  fadeVolume(nextP, 0, 0.4, FADE_MS);
  fadeVolume(curr, curr.volume, 0, FADE_MS, () => { curr.pause(); curr.src = ''; });
  _current = next;
};

export const stopMusic = () => {
  _currentKey = null;
  _players.forEach((p) => fadeVolume(p, p.volume, 0, 800, () => { p.pause(); p.src = ''; }));
};

let _wasPlayingBeforeVideo = false;

export const pauseForVideo = () => {
  _wasPlayingBeforeVideo = !!_currentKey && _players.some(p => p.src && !p.paused);
  if (_wasPlayingBeforeVideo) {
    _players.forEach((p) => fadeVolume(p, p.volume, 0, 600, () => p.pause()));
  }
};

export const resumeAfterVideo = () => {
  if (!_wasPlayingBeforeVideo) return;
  _players.forEach((p) => {
    if (p.src) { p.play().catch(() => {}); fadeVolume(p, 0, 0.4, 600); }
  });
  _wasPlayingBeforeVideo = false;
};

export const isPlaying = () => !!_currentKey;

export const primeTrack = (key) => {
  if (!key) return;
  const filename = resolveKey(key);
  const idleP = _players[1 - _current];
  if (!idleP || idleP.src.endsWith(`/${filename}.mp3`)) return;
  idleP.src = `${AUDIO_BASE}/${filename}.mp3`;
  idleP.volume = 0;
  idleP.load();
};

const _preloadCache = new Set();

export const preloadTrack = (key) => {
  if (_preloadCache.has(key)) return;
  _preloadCache.add(key);
  const a = new Audio();
  a.preload = 'auto';
  a.src = `${AUDIO_BASE}/${resolveKey(key)}.mp3`;
};
