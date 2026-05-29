// Camadas ambientais: sakura caindo, lanternas balançando, pets animados andando.

import { unlock } from './achievements.js';
import { API_URL } from './config.js';
import { getToken, getSessionInfo } from './progress.js';

// ===== sakura caindo no fundo =====

// 4 formatos de pétala individual de cerejeira
const PETAL_SVGS = [
  // A — pétala larga com entalhes no topo (forma clássica)
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 48"><defs><radialGradient id="g" cx="50%" cy="55%" r="55%"><stop offset="0%" stop-color="#fff5f8"/><stop offset="100%" stop-color="#ffb0c8"/></radialGradient></defs><path d="M19 5C14 0 3 2 3 16C3 32 10 43 19 48C28 43 35 32 35 16C35 2 24 0 19 5Z" fill="url(#g)"/></svg>`),
  // B — oval suave (mais clara, delicada)
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 50"><defs><radialGradient id="g" cx="50%" cy="55%" r="55%"><stop offset="0%" stop-color="#fffbfc"/><stop offset="100%" stop-color="#ffd4e5"/></radialGradient></defs><path d="M16 3C8 0 1 12 2 26C3 39 9 46 16 50C23 46 29 39 30 26C31 12 24 0 16 3Z" fill="url(#g)"/></svg>`),
  // C — estreita e alongada
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 52"><defs><radialGradient id="g" cx="50%" cy="50%" r="55%"><stop offset="0%" stop-color="#fff0f5"/><stop offset="100%" stop-color="#ff9dbd"/></radialGradient></defs><path d="M13 4C8 0 2 11 2 24C2 37 7 46 13 52C19 46 24 37 24 24C24 11 18 0 13 4Z" fill="url(#g)"/></svg>`),
  // D — larga e curta, tipo leque
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 40"><defs><radialGradient id="g" cx="50%" cy="60%" r="55%"><stop offset="0%" stop-color="#fff8fb"/><stop offset="100%" stop-color="#ffc8d8"/></radialGradient></defs><path d="M22 4C15 0 3 3 3 15C3 27 10 36 22 40C34 36 41 27 41 15C41 3 29 0 22 4Z" fill="url(#g)"/></svg>`),
];
const PETAL_URLS = PETAL_SVGS.map((s) => `url("data:image/svg+xml,${s}")`);

let _sakuraLayer = null;
let _sakuraStarted = false;

const initSakura = () => {
  const layer = document.createElement('div');
  layer.className = 'sakura-layer';
  document.body.appendChild(layer);
  _sakuraLayer = layer;
};

export const startSakura = () => {
  if (_sakuraStarted || !_sakuraLayer) return;
  _sakuraStarted = true;

  const isDesktop = window.matchMedia('(min-width: 768px)').matches;
  const intervalMs = isDesktop ? 1050 : 1650;

  const makePetal = ({ startMid = false } = {}) => {
    const petal = document.createElement('div');
    petal.className = 'sakura-petal';
    petal.style.left = Math.random() * 100 + '%';
    petal.style.backgroundImage = PETAL_URLS[Math.floor(Math.random() * PETAL_URLS.length)];
    const size = 18 + Math.random() * 24;
    petal.style.width = petal.style.height = size + 'px';
    const duration = 9 + Math.random() * 9;
    petal.style.animationDuration = duration + 's';
    const opacity = (0.6 + Math.random() * 0.35).toFixed(2);
    petal.style.opacity = opacity;
    petal.style.setProperty('--op', opacity);
    const sway = (25 + Math.random() * 45) * (Math.random() > 0.5 ? 1 : -1);
    petal.style.setProperty('--sway', sway + 'px');
    if (startMid) {
      petal.style.animationDelay = `-${(2 + Math.random() * (duration - 4)).toFixed(1)}s`;
    } else {
      petal.style.animationDelay = (Math.random() * 0.8) + 's';
    }
    _sakuraLayer.appendChild(petal);
    setTimeout(() => petal.remove(), (duration + 2) * 1000);
  };

  const initialVisible = isDesktop ? 7 : 5;
  for (let i = 0; i < initialVisible; i++) makePetal({ startMid: true });
  setInterval(makePetal, intervalMs);
};

// ===== lanternas no topo =====

const LANTERN_SVG = encodeURIComponent(`
<svg viewBox="0 0 60 90" xmlns="http://www.w3.org/2000/svg">
  <line x1="30" y1="0" x2="30" y2="12" stroke="#3a1f1f" stroke-width="1.5"/>
  <rect x="18" y="12" width="24" height="4" fill="#2a1414" rx="1"/>
  <ellipse cx="30" cy="45" rx="22" ry="28" fill="#d62828"/>
  <ellipse cx="30" cy="45" rx="22" ry="28" fill="url(#shadow)"/>
  <defs>
    <radialGradient id="shadow" cx="0.3" cy="0.3">
      <stop offset="0%" stop-color="#ff5a5a" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#a01818" stop-opacity="0.6"/>
    </radialGradient>
  </defs>
  <rect x="8" y="42" width="44" height="6" fill="#2a1414"/>
  <rect x="14" y="20" width="32" height="3" fill="#2a1414" opacity="0.4"/>
  <rect x="14" y="68" width="32" height="3" fill="#2a1414" opacity="0.4"/>
  <rect x="18" y="73" width="24" height="4" fill="#2a1414" rx="1"/>
  <path d="M 26 77 L 26 86 M 30 77 L 30 88 M 34 77 L 34 86" stroke="#daa520" stroke-width="1" fill="none"/>
</svg>`);
const LANTERN_URL = `url("data:image/svg+xml,${LANTERN_SVG}")`;

const initLanterns = () => {
  const layer = document.createElement('div');
  layer.className = 'lantern-layer';
  ['lantern-1', 'lantern-2', 'lantern-3'].forEach((cls) => {
    const l = document.createElement('div');
    l.className = `lantern ${cls}`;
    l.style.backgroundImage = LANTERN_URL;
    layer.appendChild(l);
  });
  document.body.appendChild(layer);
};

// ===== pets animados SVG =====

const CAT_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 44" width="60" height="44">
  <style>
    .cb { animation: cb .5s ease-in-out infinite alternate; }
    .ct { animation: ct .65s ease-in-out infinite alternate; transform-origin: 40px 23px; }
    .cla { animation: cla .4s ease-in-out infinite alternate; transform-origin: 18px 34px; }
    .clb { animation: cla .4s ease-in-out infinite alternate .2s; transform-origin: 24px 34px; }
    .clc { animation: cla .4s ease-in-out infinite alternate .1s; transform-origin: 32px 34px; }
    .cld { animation: cla .4s ease-in-out infinite alternate .3s; transform-origin: 38px 34px; }
    @keyframes cb  { to { transform: translateY(-2px); } }
    @keyframes ct  { from { transform: rotate(-22deg); } to { transform: rotate(22deg); } }
    @keyframes cla { from { transform: rotate(-14deg); } to { transform: rotate(14deg); } }
  </style>
  <!-- rabo -->
  <g class="ct">
    <path d="M40 23 Q52 14 49 6" stroke="#f8bbd0" stroke-width="4" fill="none" stroke-linecap="round"/>
  </g>
  <!-- corpo que balança -->
  <g class="cb">
    <ellipse cx="28" cy="26" rx="14" ry="9" fill="#fce4ec"/>
    <circle cx="14" cy="20" r="9" fill="#fce4ec"/>
    <!-- orelhas externas -->
    <polygon points="8,12 11,3 16,12" fill="#fce4ec"/>
    <polygon points="12,12 16,3 20,12" fill="#fce4ec"/>
    <!-- orelhas internas -->
    <polygon points="9,11 11,5 15,11" fill="#f48fb1" opacity=".7"/>
    <polygon points="13,11 16,5 19,11" fill="#f48fb1" opacity=".7"/>
    <!-- olhos -->
    <ellipse cx="11" cy="19" rx="2.2" ry="2.6" fill="#2d2d2d"/>
    <ellipse cx="17" cy="19" rx="2.2" ry="2.6" fill="#2d2d2d"/>
    <circle cx="12" cy="18" r=".9" fill="white"/>
    <circle cx="18" cy="18" r=".9" fill="white"/>
    <!-- nariz -->
    <ellipse cx="14" cy="21.5" rx="1.5" ry="1" fill="#f48fb1"/>
    <!-- boca -->
    <path d="M12.5 22.5 Q14 24 15.5 22.5" stroke="#bbb" stroke-width=".8" fill="none"/>
    <!-- bigodes -->
    <line x1="3" y1="21" x2="11" y2="21.5" stroke="#e0e0e0" stroke-width=".7" opacity=".9"/>
    <line x1="3" y1="23" x2="11" y2="22.5" stroke="#e0e0e0" stroke-width=".7" opacity=".9"/>
    <line x1="17" y1="21.5" x2="25" y2="21"  stroke="#e0e0e0" stroke-width=".7" opacity=".9"/>
    <line x1="17" y1="22.5" x2="25" y2="23"  stroke="#e0e0e0" stroke-width=".7" opacity=".9"/>
    <!-- pernas -->
    <rect class="cla" x="15" y="33" width="5" height="9" rx="2.5" fill="#f8bbd0"/>
    <rect class="clb" x="22" y="33" width="5" height="9" rx="2.5" fill="#f8bbd0"/>
    <rect class="clc" x="30" y="33" width="5" height="9" rx="2.5" fill="#f8bbd0"/>
    <rect class="cld" x="37" y="33" width="5" height="9" rx="2.5" fill="#f8bbd0"/>
  </g>
</svg>`;

const DOG_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 46" width="62" height="46">
  <style>
    .db  { animation: db  .45s ease-in-out infinite alternate; }
    .dt  { animation: dt  .35s ease-in-out infinite alternate; transform-origin: 42px 25px; }
    .dtg { animation: dtg .9s  ease-in-out infinite alternate; transform-origin: 16px 27px; }
    .dla { animation: dla .38s ease-in-out infinite alternate; transform-origin: 18px 35px; }
    .dlb { animation: dla .38s ease-in-out infinite alternate .19s; transform-origin: 24px 35px; }
    .dlc { animation: dla .38s ease-in-out infinite alternate .09s; transform-origin: 32px 35px; }
    .dld { animation: dla .38s ease-in-out infinite alternate .28s; transform-origin: 38px 35px; }
    @keyframes db  { to { transform: translateY(-2px); } }
    @keyframes dt  { from { transform: rotate(-28deg); } to { transform: rotate(28deg); } }
    @keyframes dtg { from { transform: translateY(0);  } to { transform: translateY(2.5px); } }
    @keyframes dla { from { transform: rotate(-13deg); } to { transform: rotate(13deg); } }
  </style>
  <!-- rabo -->
  <g class="dt">
    <path d="M42 25 Q54 16 51 8" stroke="#ffcc80" stroke-width="4.5" fill="none" stroke-linecap="round"/>
  </g>
  <!-- corpo que balança -->
  <g class="db">
    <ellipse cx="29" cy="28" rx="15" ry="10" fill="#ffe0b2"/>
    <circle cx="15" cy="21" r="10" fill="#ffe0b2"/>
    <!-- orelhas caídas -->
    <ellipse cx="7"  cy="24" rx="5.5" ry="9" fill="#ffb74d" transform="rotate(-18 7 24)"/>
    <ellipse cx="23" cy="24" rx="5.5" ry="9" fill="#ffb74d" transform="rotate(18 23 24)"/>
    <!-- focinho -->
    <ellipse cx="15" cy="24" rx="5.5" ry="4" fill="#ffcc80"/>
    <!-- nariz -->
    <ellipse cx="15" cy="22" rx="3" ry="2" fill="#555"/>
    <circle cx="13.5" cy="22.3" r=".7" fill="#444"/>
    <circle cx="16.5" cy="22.3" r=".7" fill="#444"/>
    <!-- olhos -->
    <ellipse cx="10" cy="18" rx="2.3" ry="2.5" fill="#333"/>
    <ellipse cx="20" cy="18" rx="2.3" ry="2.5" fill="#333"/>
    <circle cx="11" cy="17" r=".8" fill="white"/>
    <circle cx="21" cy="17" r=".8" fill="white"/>
    <!-- língua animada -->
    <g class="dtg">
      <ellipse cx="15" cy="27" rx="2.8" ry="3.2" fill="#ef9a9a"/>
      <line x1="15" y1="25" x2="15" y2="28.5" stroke="#e57373" stroke-width=".9"/>
    </g>
    <!-- pernas -->
    <rect class="dla" x="16" y="35" width="5.5" height="9" rx="2.7" fill="#ffcc80"/>
    <rect class="dlb" x="23" y="35" width="5.5" height="9" rx="2.7" fill="#ffcc80"/>
    <rect class="dlc" x="31" y="35" width="5.5" height="9" rx="2.7" fill="#ffcc80"/>
    <rect class="dld" x="38" y="35" width="5.5" height="9" rx="2.7" fill="#ffcc80"/>
  </g>
</svg>`;

const BUNNY_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 54" width="52" height="54">
  <style>
    .bb  { animation: bb  .55s ease-in-out infinite alternate; }
    .bel { animation: bel 1.4s ease-in-out infinite alternate;    transform-origin: 16px 10px; }
    .ber { animation: bel 1.4s ease-in-out infinite alternate .4s; transform-origin: 30px 10px; }
    .bla { animation: bla .42s ease-in-out infinite alternate;    transform-origin: 15px 44px; }
    .blb { animation: bla .42s ease-in-out infinite alternate .21s; transform-origin: 22px 44px; }
    @keyframes bb  { to { transform: translateY(-3px); } }
    @keyframes bel { from { transform: rotate(-10deg); } to { transform: rotate(10deg); } }
    @keyframes bla { from { transform: rotate(-12deg); } to { transform: rotate(12deg); } }
  </style>
  <g class="bb">
    <ellipse cx="23" cy="38" rx="14" ry="12" fill="#f3e5f5"/>
    <circle cx="35" cy="40" r="4.5" fill="white"/>
    <circle cx="18" cy="25" r="10" fill="#f3e5f5"/>
    <g class="bel">
      <ellipse cx="16" cy="10" rx="4.5" ry="10" fill="#f3e5f5"/>
      <ellipse cx="16" cy="10" rx="2.2" ry="7"   fill="#ce93d8" opacity=".6"/>
    </g>
    <g class="ber">
      <ellipse cx="24" cy="10" rx="4.5" ry="10" fill="#f3e5f5"/>
      <ellipse cx="24" cy="10" rx="2.2" ry="7"   fill="#ce93d8" opacity=".6"/>
    </g>
    <circle cx="14" cy="24" r="2.5" fill="#ab47bc"/>
    <circle cx="22" cy="24" r="2.5" fill="#ab47bc"/>
    <circle cx="14.8" cy="23.2" r=".9" fill="white"/>
    <circle cx="22.8" cy="23.2" r=".9" fill="white"/>
    <ellipse cx="18" cy="27" rx="1.8" ry="1.2" fill="#ce93d8"/>
    <path d="M16 28 Q18 30 20 28" stroke="#ccc" stroke-width=".8" fill="none"/>
    <rect class="bla" x="12" y="44" width="7" height="9" rx="3.5" fill="#e1bee7"/>
    <rect class="blb" x="21" y="44" width="7" height="9" rx="3.5" fill="#e1bee7"/>
  </g>
</svg>`;

const SEAL_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 66 46" width="66" height="46">
  <style>
    .skb { animation: skb .55s ease-in-out infinite alternate; }
    .skt { animation: skt .38s ease-in-out infinite alternate; transform-origin: 56px 26px; }
    .skfa { animation: skf .42s ease-in-out infinite alternate; transform-origin: 20px 36px; }
    .skfb { animation: skf .42s ease-in-out infinite alternate .21s; transform-origin: 30px 37px; }
    @keyframes skb  { to { transform: translateY(-2px); } }
    @keyframes skt  { from { transform: rotate(-22deg); } to { transform: rotate(22deg); } }
    @keyframes skf  { from { transform: rotate(-20deg); } to { transform: rotate(20deg); } }
  </style>
  <!-- cauda bifurcada -->
  <g class="skt">
    <ellipse cx="54" cy="22" rx="9" ry="3.5" fill="#90a4ae" transform="rotate(-18 54 22)"/>
    <ellipse cx="56" cy="32" rx="9" ry="3.5" fill="#90a4ae" transform="rotate(18 56 32)"/>
  </g>
  <g class="skb">
    <!-- corpo torpedo -->
    <ellipse cx="33" cy="29" rx="21" ry="12" fill="#b0bec5"/>
    <!-- barriga clara -->
    <ellipse cx="30" cy="31" rx="13" ry="8" fill="#eceff1"/>
    <!-- cabeça -->
    <circle cx="14" cy="21" r="11" fill="#b0bec5"/>
    <!-- olhos grandes -->
    <ellipse cx="10" cy="19" rx="2.8" ry="3.2" fill="#1a2533"/>
    <ellipse cx="19" cy="19" rx="2.8" ry="3.2" fill="#1a2533"/>
    <circle cx="11" cy="18" r="1.1" fill="white"/>
    <circle cx="20" cy="18" r="1.1" fill="white"/>
    <!-- nariz -->
    <ellipse cx="14" cy="23.5" rx="3.5" ry="2.5" fill="#78909c"/>
    <ellipse cx="12.5" cy="23.5" rx="1.2" ry=".9" fill="#546e7a"/>
    <ellipse cx="15.5" cy="23.5" rx="1.2" ry=".9" fill="#546e7a"/>
    <!-- boca -->
    <path d="M11.5 25.5 Q14 27.5 16.5 25.5" stroke="#9e9e9e" stroke-width=".8" fill="none"/>
    <!-- bigodes -->
    <line x1="2" y1="23" x2="10" y2="23.5" stroke="#cfd8dc" stroke-width=".8" opacity=".9"/>
    <line x1="2" y1="25" x2="10" y2="24.5" stroke="#cfd8dc" stroke-width=".8" opacity=".9"/>
    <line x1="18" y1="23.5" x2="26" y2="23" stroke="#cfd8dc" stroke-width=".8" opacity=".9"/>
    <line x1="18" y1="24.5" x2="26" y2="25" stroke="#cfd8dc" stroke-width=".8" opacity=".9"/>
    <!-- nadadeiras (agem como pernas) -->
    <ellipse class="skfa" cx="20" cy="37" rx="9" ry="3.5" fill="#90a4ae" transform="rotate(-20 20 37)"/>
    <ellipse class="skfb" cx="30" cy="38" rx="9" ry="3.5" fill="#90a4ae" transform="rotate(8 30 38)"/>
  </g>
</svg>`;

const GOAT_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 50" width="62" height="50">
  <style>
    .gkb  { animation: gkb  .5s  ease-in-out infinite alternate; }
    .gkt  { animation: gkt  .35s ease-in-out infinite alternate; transform-origin: 47px 24px; }
    .gkel { animation: gkel 1.3s ease-in-out infinite alternate; transform-origin: 5px 19px; }
    .gker { animation: gkel 1.3s ease-in-out infinite alternate .4s; transform-origin: 24px 19px; }
    .gkla { animation: gkl  .42s ease-in-out infinite alternate;      transform-origin: 21px 36px; }
    .gklb { animation: gkl  .42s ease-in-out infinite alternate .21s; transform-origin: 27px 36px; }
    .gklc { animation: gkl  .42s ease-in-out infinite alternate .11s; transform-origin: 35px 36px; }
    .gkld { animation: gkl  .42s ease-in-out infinite alternate .32s; transform-origin: 41px 36px; }
    @keyframes gkb  { to { transform: translateY(-2px); } }
    @keyframes gkt  { from { transform: rotate(-25deg); } to { transform: rotate(25deg); } }
    @keyframes gkel { from { transform: rotate(-10deg); } to { transform: rotate(10deg); } }
    @keyframes gkl  { from { transform: rotate(-14deg); } to { transform: rotate(14deg); } }
  </style>
  <!-- rabinho fofo -->
  <g class="gkt">
    <circle cx="47" cy="22" r="5" fill="white"/>
    <circle cx="47" cy="22" r="3.2" fill="#f0e8d8"/>
  </g>
  <g class="gkb">
    <!-- corpo -->
    <ellipse cx="33" cy="29" rx="14" ry="9" fill="#f5f0e8"/>
    <!-- cabeça redonda (filhote = cabeça grande) -->
    <circle cx="14" cy="20" r="11" fill="#f5f0e8"/>
    <!-- corninos pequeninos -->
    <path d="M10 10 Q8 4 11 7" stroke="#c8a464" stroke-width="2.8" fill="none" stroke-linecap="round"/>
    <path d="M18 10 Q20 4 17 7" stroke="#c8a464" stroke-width="2.8" fill="none" stroke-linecap="round"/>
    <!-- orelhas caídas -->
    <ellipse class="gkel" cx="5"  cy="19" rx="4.5" ry="8" fill="#f5f0e8" transform="rotate(-22 5 19)"/>
    <ellipse            cx="5.5" cy="19" rx="2.2" ry="5.5" fill="#f4c4cc" opacity=".6" transform="rotate(-22 5 19)"/>
    <ellipse class="gker" cx="24" cy="19" rx="4.5" ry="8" fill="#f5f0e8" transform="rotate(22 24 19)"/>
    <ellipse            cx="23.5" cy="19" rx="2.2" ry="5.5" fill="#f4c4cc" opacity=".6" transform="rotate(22 24 19)"/>
    <!-- olhos -->
    <ellipse cx="10" cy="19" rx="2.5" ry="2.8" fill="#2d2d2d"/>
    <ellipse cx="18" cy="19" rx="2.5" ry="2.8" fill="#2d2d2d"/>
    <circle cx="10.9" cy="18" r="1" fill="white"/>
    <circle cx="18.9" cy="18" r="1" fill="white"/>
    <!-- nariz rosinha -->
    <ellipse cx="14" cy="23" rx="2.8" ry="2" fill="#f4a0b0"/>
    <circle cx="12.8" cy="23" r=".8" fill="#e07090"/>
    <circle cx="15.2" cy="23" r=".8" fill="#e07090"/>
    <!-- boca -->
    <path d="M12 24.5 Q14 26.5 16 24.5" stroke="#d0a0b0" stroke-width=".8" fill="none"/>
    <!-- barbinha de cabrito -->
    <path d="M13 27 Q14 31 15 27" stroke="#e0d0b8" stroke-width="2" fill="none" stroke-linecap="round"/>
    <!-- pernas com casquinhos -->
    <rect class="gkla" x="19" y="36" width="5" height="10" rx="2.5" fill="#e8d8c0"/>
    <rect class="gklb" x="25" y="36" width="5" height="10" rx="2.5" fill="#e8d8c0"/>
    <rect class="gklc" x="33" y="36" width="5" height="10" rx="2.5" fill="#e8d8c0"/>
    <rect class="gkld" x="39" y="36" width="5" height="10" rx="2.5" fill="#e8d8c0"/>
    <!-- casquinhos escuros -->
    <rect x="19" y="43" width="5" height="4" rx="2" fill="#8d6e4a"/>
    <rect x="25" y="43" width="5" height="4" rx="2" fill="#8d6e4a"/>
    <rect x="33" y="43" width="5" height="4" rx="2" fill="#8d6e4a"/>
    <rect x="39" y="43" width="5" height="4" rx="2" fill="#8d6e4a"/>
  </g>
</svg>`;

const PET_POOL = [
  { id: 'cat',   svg: CAT_SVG,   name: 'o gatinho'    },
  { id: 'dog',   svg: DOG_SVG,   name: 'o cachorro'   },
  { id: 'bunny', svg: BUNNY_SVG, name: 'o coelhinho'  },
  { id: 'seal',  svg: SEAL_SVG,  name: 'a foquinha'   },
  { id: 'goat',  svg: GOAT_SVG,  name: 'o cabritinho' },
];

const KILLED_KEY  = 'luana_killed_pets';
const PETS_STOPPED_KEY = 'luana_pets_stopped';

const killedIds = () => new Set(JSON.parse(localStorage.getItem(KILLED_KEY) || '[]'));
const killId = (id) => {
  const s = killedIds(); s.add(id);
  localStorage.setItem(KILLED_KEY, JSON.stringify([...s]));
  const { apiOk } = getSessionInfo();
  if (apiOk && API_URL) {
    fetch(`${API_URL}/session/${getToken()}/progress`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ petsKilled: [...s] }),
    }).catch(() => {});
  }
};

let _petsActive = !localStorage.getItem(PETS_STOPPED_KEY);
let _petTimers = null;
let _sendPet = null;

export const resumePets = () => {
  _petsActive = true;
  localStorage.removeItem(PETS_STOPPED_KEY);
  // KILLED_KEY não é limpo — animais mortos não voltam, só com hardreset
  if (!_petTimers && _sendPet) {
    const t0 = setTimeout(_sendPet, 2000);
    const iv = setInterval(_sendPet, 12000 + Math.random() * 8000);
    _petTimers = { t0, iv };
  }
};

const restoreDeadPet = () => {
  const saved = localStorage.getItem('luana_dead_pet');
  if (!saved) return;
  try {
    const { html, bottom, left, right } = JSON.parse(saved);
    const pet = document.createElement('div');
    pet.className = 'pet pet--dead';
    pet.style.position = 'fixed';
    pet.style.bottom = bottom;
    if (left)  pet.style.left  = left;
    if (right) pet.style.right = right;
    pet.style.transform = 'rotate(90deg) translateY(10px)';
    pet.style.filter = 'drop-shadow(0 3px 6px rgba(0,0,0,0.35))';
    pet.innerHTML = html;
    const xEyes = document.createElement('div');
    xEyes.style.cssText = 'position:absolute;left:18%;top:22%;transform:translate(-50%,-50%);font-size:1rem;pointer-events:none;z-index:2;line-height:1;';
    xEyes.textContent = '😵';
    document.body.appendChild(pet);
    pet.appendChild(xEyes);
  } catch {}
};

// para permanentemente (kill mechanic)
export const stopPets = () => {
  _petsActive = false;
  localStorage.setItem(PETS_STOPPED_KEY, '1');
  if (_petTimers) { clearTimeout(_petTimers.t0); clearInterval(_petTimers.iv); _petTimers = null; }
  document.querySelectorAll('.pet:not(.pet--dead)').forEach((p) => {
    p.style.transition = 'opacity 0.6s';
    p.style.opacity = '0';
    setTimeout(() => p.remove(), 600);
  });
};

// remove os pets visíveis sem cancelar o interval (para transição de tela)
export const hidePets = () => {
  document.querySelectorAll('.pet:not(.pet--dead)').forEach((p) => {
    p.style.transition = 'opacity 0.4s';
    p.style.opacity = '0';
    setTimeout(() => p.remove(), 400);
  });
};

const initPets = () => {
  const layer = document.createElement('div');
  layer.className = 'pet-layer';
  document.body.appendChild(layer);

  _sendPet = () => {
    if (!_petsActive) return;
    const activeId = document.querySelector('.screen.active')?.id;
    if (!['screen-gate', 'screen-loading', 'screen-welcome'].includes(activeId)) return;
    const alive = PET_POOL.filter(p => !killedIds().has(p.id));
    if (!alive.length) return;
    const chosen = alive[Math.floor(Math.random() * alive.length)];
    const pet = document.createElement('div');
    pet.className = 'pet';
    pet.innerHTML = chosen.svg;

    const fromLeft = Math.random() > 0.5;
    pet.style.bottom = (2 + Math.random() * 8) + 'px';
    pet.style.animationDuration = (16 + Math.random() * 10) + 's';

    if (fromLeft) {
      pet.style.left = '-70px';
      pet.style.animationName = 'pet-walk-right';
      pet.style.setProperty('--flip', '1');
    } else {
      pet.style.right = '-70px';
      pet.style.animationName = 'pet-walk-left';
      pet.style.transform = 'scaleX(-1)';
      pet.style.setProperty('--flip', '-1');
    }

    let pokeCount = 0;
    let dead = false;

    const killPet = () => {
      killId(chosen.id);
      dead = true;
      clearTimeout(pet._autoRemove);

      // tira do pet-layer (overflow:hidden) e vai pro body com posição fixada
      const pr = pet.getBoundingClientRect();
      pet.classList.add('pet--dead'); // CSS: animation:none !important em .pet--dead *
      pet.style.position = 'fixed';
      pet.style.left   = pr.left + 'px';
      pet.style.bottom = (window.innerHeight - pr.bottom) + 'px';
      pet.style.top    = 'auto';
      pet.style.right  = 'auto';
      document.body.appendChild(pet);
      stopPets();

      pet.style.transition = 'transform 0.5s cubic-bezier(0.36,0.07,0.19,0.97)';
      requestAnimationFrame(() => {
        pet.style.transform = `${fromLeft ? 'scaleX(1)' : 'scaleX(-1)'} rotate(90deg) translateY(10px)`;
      });

      const xEyes = document.createElement('div');
      xEyes.style.cssText = 'position:absolute;left:18%;top:22%;transform:translate(-50%,-50%);font-size:1rem;pointer-events:none;z-index:2;line-height:1;';
      xEyes.textContent = '😵';
      pet.appendChild(xEyes);

      if (navigator.vibrate) navigator.vibrate([80, 40, 80, 40, 200]);
      unlock('animal-killer');

      localStorage.setItem('luana_dead_pet', JSON.stringify({
        html: pet.querySelector('svg')?.outerHTML || '',
        bottom: pet.style.bottom,
        left: pet.style.left || null,
        right: null,
      }));

      const showToastSequence = (msg, delay, duration, next) => {
        setTimeout(() => {
          const t = document.createElement('div');
          t.className = 'egg-toast';
          t.textContent = msg;
          document.body.appendChild(t);
          requestAnimationFrame(() => t.classList.add('show'));
          setTimeout(() => {
            t.classList.remove('show');
            setTimeout(() => { t.remove(); next?.(); }, 500);
          }, duration);
        }, delay);
      };

      const remaining = PET_POOL.filter(p => !killedIds().has(p.id)).length;
      if (remaining === 0) unlock('genocide');
      const fearMsg = remaining > 0
        ? '🐾 os outros animais estão com medo de você...'
        : '🐾 você matou todos os animais. parabéns. 💀';

      showToastSequence('parabéns você matou 😡', 400, 3000, () => {
        showToastSequence(fearMsg, 600, 3500, null);
      });
    };

    const CORPSE_MSGS = [
      'ele tá morto... 💀',
      'para de mexer no corpinho 😤',
      'deixa ele descansar em paz',
      'isso é perturbação de cadáver 👮',
      'ele não vai acordar',
      'tá morto memo',
      'respeita o finado 🕯️',
      'ele morreu inocente',
      'você fez isso. você.',
      'o trauma é seu 🫵',
    ];
    let corpsePokeCount = 0;

    pet.addEventListener('pointerdown', (e) => {
      if (dead) {
        e.stopPropagation();
        const msg = CORPSE_MSGS[corpsePokeCount % CORPSE_MSGS.length];
        corpsePokeCount++;
        const popup = document.createElement('div');
        popup.className = 'pet-heart-pop';
        popup.textContent = msg;
        popup.style.fontSize = '0.8rem';
        popup.style.fontFamily = 'var(--font-body, sans-serif)';
        const r = pet.getBoundingClientRect();
        popup.style.left = (r.left + r.width / 2) + 'px';
        popup.style.top  = (r.top  + r.height / 2) + 'px';
        document.body.appendChild(popup);
        setTimeout(() => popup.remove(), 1200);
        if (navigator.vibrate) navigator.vibrate(30);
        return;
      }
      e.stopPropagation();
      pokeCount++;

      if (pokeCount >= 10) { killPet(); return; }

      const base = fromLeft ? 'scaleX(1)' : 'scaleX(-1)';
      pet.style.animationPlayState = 'paused';
      pet.style.transition = 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)';
      pet.style.transform = `${base} translateY(-8px)`;
      setTimeout(() => {
        pet.style.transform = `${base} translateY(0)`;
        setTimeout(() => { pet.style.transition = ''; }, 250);
      }, 200);
      setTimeout(() => { pet.style.animationPlayState = 'running'; }, 1000);

      const PAIN_MSGS = ['ai 🥺', 'aaai...', 'para por favor!!', 'PARA!! 😭', '😰'];
      const popup = document.createElement('div');
      popup.className = 'pet-heart-pop';
      const r = pet.getBoundingClientRect();
      popup.style.left = (r.left + r.width / 2) + 'px';
      popup.style.top  = (r.top  + r.height / 2) + 'px';

      if (pokeCount <= 4) {
        popup.textContent = ['💛', '🌸', '💕', '✨'][Math.floor(Math.random() * 4)];
      } else {
        popup.textContent = PAIN_MSGS[Math.min(pokeCount - 5, PAIN_MSGS.length - 1)];
        popup.style.fontSize = '0.85rem';
        popup.style.fontFamily = 'var(--font-body, sans-serif)';
      }
      document.body.appendChild(popup);
      setTimeout(() => popup.remove(), 900);

      if (navigator.vibrate) navigator.vibrate([30, 20, 30]);
    }, { passive: true });

    layer.appendChild(pet);
    const autoRemove = setTimeout(() => pet.remove(), 28000);
    pet._autoRemove = autoRemove;
  };

  const t0 = setTimeout(_sendPet, 4000);
  const iv = setInterval(_sendPet, 12000 + Math.random() * 8000);
  _petTimers = { t0, iv };
};

// ===== patinhas ao clicar (mobile + desktop) =====

const PAW_EMOJI = '🐾';
const SKULL_EMOJIS = ['💀', '☠️', '👻', '🦴', '💀'];

const initClickPaws = () => {
  const trailLayer = document.createElement('div');
  trailLayer.className = 'paw-trail-layer';
  document.body.appendChild(trailLayer);

  const PETAL_EMOJIS   = ['🌸', '🌸', '🌺', '🌼', '🌸'];
  const SPARKLE_EMOJIS = ['✨', '⭐', '🌟', '💫', '✨', '✨'];

  const burstAt = (cx, cy) => {
    const skullMode     = document.body.classList.contains('skull-mode');
    const isHanami      = document.getElementById('screen-hanami')?.classList.contains('active');
    const isSerendipity = document.getElementById('screen-serendipity')?.classList.contains('active');
    const isGate        = document.getElementById('screen-gate')?.classList.contains('active');
    const isWelcome     = document.getElementById('screen-welcome')?.classList.contains('active');

    const emoji = skullMode     ? SKULL_EMOJIS[Math.floor(Math.random() * SKULL_EMOJIS.length)]
                : isHanami      ? PETAL_EMOJIS[Math.floor(Math.random() * PETAL_EMOJIS.length)]
                : isSerendipity ? SPARKLE_EMOJIS[Math.floor(Math.random() * SPARKLE_EMOJIS.length)]
                : (isGate || isWelcome) ? PAW_EMOJI
                : null;

    if (!emoji) return;

    const count = 7 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const paw = document.createElement('div');
      paw.className = 'paw-burst';
      paw.textContent = emoji;
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const distance = 50 + Math.random() * 40;
      paw.style.left = cx + 'px';
      paw.style.top = cy + 'px';
      paw.style.setProperty('--dx', Math.cos(angle) * distance + 'px');
      paw.style.setProperty('--dy', Math.sin(angle) * distance + 'px');
      paw.style.setProperty('--rot', ((Math.random() * 60 - 30) + (angle * 180 / Math.PI)) + 'deg');
      paw.style.fontSize = (1.5 + Math.random() * 0.6) + 'rem';
      trailLayer.appendChild(paw);
      setTimeout(() => paw.remove(), 1300);
    }
  };

  document.addEventListener('pointerdown', (e) => {
    burstAt(e.clientX, e.clientY);
  }, { passive: true });
};

// ===== skull mode =====

export const allKilled = () => PET_POOL.every(p => killedIds().has(p.id));

export const clearSkullMode = () => {
  document.body.classList.remove('skull-mode');
  document.querySelectorAll('.skull-fog, .skull-particle, .skull-message').forEach(el => el.remove());
};

export const triggerSkullMode = () => {
  document.body.classList.add('skull-mode');

  // fundo escuro com névoa
  const fog = document.createElement('div');
  fog.className = 'skull-fog';
  document.body.appendChild(fog);

  // chuva de caveiras flutuando
  const SKULLS = ['💀', '☠️', '🕯️', '👻', '🦴'];
  let count = 0;
  const rain = setInterval(() => {
    if (count++ > 40) { clearInterval(rain); return; }
    const s = document.createElement('div');
    s.className = 'skull-particle';
    s.textContent = SKULLS[Math.floor(Math.random() * SKULLS.length)];
    s.style.left = (Math.random() * 100) + '%';
    s.style.fontSize = (1 + Math.random() * 1.5) + 'rem';
    s.style.animationDuration = (4 + Math.random() * 5) + 's';
    s.style.animationDelay = (Math.random() * 2) + 's';
    s.style.opacity = (0.4 + Math.random() * 0.5).toString();
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 10000);
  }, 150);

  // mensagem central
  setTimeout(() => {
    const msg = document.createElement('div');
    msg.className = 'skull-message';
    msg.innerHTML = '💀<br>você pediu desculpa<br>mas já era tarde demais';
    document.body.appendChild(msg);
    requestAnimationFrame(() => msg.classList.add('show'));
    setTimeout(() => {
      msg.classList.remove('show');
      setTimeout(() => msg.remove(), 600);
    }, 4000);
  }, 800);

  if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
};

// ===== boot =====

export const initAmbient = () => {
  initSakura();
  initLanterns();
  initPets();
  initClickPaws();
  restoreDeadPet();
};
