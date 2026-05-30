import { API_URL } from './config.js';

const AUDIO_BASE = 'assets/audio';

// ── Pool de músicas e shuffle por sessão ──────────────────────────────────────
const POOL = [
  'amor-e-fe-acustico','beautiful-things','bem','blinding-lights',
  'boulevard-of-broken-dreams','ceu-azul','choose-me','clocks',
  'cruel-summer','infinity','in-the-end','iris','let-me-love-you',
  'lighter','lua-pegado','memories','mystery-of-love','numb',
  'radioactive','somebody-that-i-used-to-know','too-sweet',
];

const SCREEN_KEYS = ['gate','welcome','loves','game','puzzle','card','final'];
// timeline-01 … timeline-13 são slots 7 a 19

const SESSION_KEY = 'luana_music_shuffle';

const buildMap = () => {
  const shuffled = [...POOL].sort(() => Math.random() - 0.5);
  const map = {};
  SCREEN_KEYS.forEach((k, i) => { map[k] = shuffled[i % shuffled.length]; });
  for (let t = 1; t <= 13; t++) {
    const key = `timeline-${String(t).padStart(2,'0')}`;
    map[key] = shuffled[(SCREEN_KEYS.length + t - 1) % shuffled.length];
  }
  return map;
};

const loadMap = () => {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  const map = buildMap();
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(map)); } catch {}
  return map;
};

const TRACK_MAP = loadMap();

const resolveKey = (key) => TRACK_MAP[key] || key;

let _players = [null, null];
let _current = 0;
let _currentKey = null;
let _muted = localStorage.getItem('luana_muted') === '1';

const FADE_MS = 1400;

const fadeVolume = (el, from, to, ms, onDone) => {
  const steps = 20;
  const stepMs = ms / steps;
  const delta = (to - from) / steps;
  let s = 0;
  el.volume = from;
  const id = setInterval(() => {
    s++;
    el.volume = Math.max(0, Math.min(1, from + delta * s));
    if (s >= steps) { clearInterval(id); el.volume = to; onDone?.(); }
  }, stepMs);
};

export const initMusic = () => {
  _players[0] = document.getElementById('bg-music-a');
  _players[1] = document.getElementById('bg-music-b');
};

export const playTrack = (key) => {
  if (key === _currentKey) return;
  _currentKey = key;

  const next = 1 - _current;
  const curr = _players[_current];
  const nextP = _players[next];

  nextP.src = `${AUDIO_BASE}/${resolveKey(key)}.mp3`;
  nextP.loop = true;
  nextP.volume = 0;
  nextP.play().catch(() => {});

  fadeVolume(nextP, 0, _muted ? 0 : 0.4, FADE_MS);
  fadeVolume(curr, curr.volume, 0, FADE_MS, () => {
    curr.pause();
    curr.src = '';
  });
  _current = next;
};

export const stopMusic = () => {
  _currentKey = null;
  _players.forEach((p) => fadeVolume(p, p.volume, 0, 800, () => { p.pause(); p.src = ''; }));
};

export const pauseForVideo = () => {
  _players.forEach((p) => fadeVolume(p, p.volume, 0, 600, () => p.pause()));
};

export const resumeAfterVideo = () => {
  _players.forEach((p) => {
    if (p.src) { p.play().catch(() => {}); fadeVolume(p, 0, _muted ? 0 : 0.4, 600); }
  });
};

export const toggleMute = () => {
  _muted = !_muted;
  localStorage.setItem('luana_muted', _muted ? '1' : '0');
  _players.forEach((p) => fadeVolume(p, p.volume, _muted ? 0 : 0.4, 400));
  return _muted;
};

export const isMuted = () => _muted;

const _preloadCache = new Set();

export const preloadTrack = (key) => {
  if (_preloadCache.has(key)) return;
  _preloadCache.add(key);
  const a = new Audio();
  a.preload = 'auto';
  a.src = `${AUDIO_BASE}/${resolveKey(key)}.mp3`;
};
