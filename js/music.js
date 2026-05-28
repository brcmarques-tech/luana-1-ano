import { API_URL } from './config.js';

const AUDIO_BASE = API_URL ? `${API_URL}/assets/audio` : 'assets/audio';

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

  nextP.src = `${AUDIO_BASE}/${key}.mp3`;
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
  a.src = `${AUDIO_BASE}/${key}.mp3`;
};
