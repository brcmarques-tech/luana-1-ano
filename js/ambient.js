// Camadas ambientais: sakura caindo, lanternas balançando, pets animados andando.

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
    <!-- corpo -->
    <ellipse cx="23" cy="38" rx="14" ry="12" fill="#f3e5f5"/>
    <!-- rabinho -->
    <circle cx="35" cy="40" r="4.5" fill="white"/>
    <!-- cabeça -->
    <circle cx="18" cy="25" r="10" fill="#f3e5f5"/>
    <!-- orelha esquerda -->
    <g class="bel">
      <ellipse cx="16" cy="10" rx="4.5" ry="10" fill="#f3e5f5"/>
      <ellipse cx="16" cy="10" rx="2.2" ry="7"   fill="#ce93d8" opacity=".6"/>
    </g>
    <!-- orelha direita -->
    <g class="ber">
      <ellipse cx="24" cy="10" rx="4.5" ry="10" fill="#f3e5f5"/>
      <ellipse cx="24" cy="10" rx="2.2" ry="7"   fill="#ce93d8" opacity=".6"/>
    </g>
    <!-- olhos -->
    <circle cx="14" cy="24" r="2.5" fill="#ab47bc"/>
    <circle cx="22" cy="24" r="2.5" fill="#ab47bc"/>
    <circle cx="14.8" cy="23.2" r=".9" fill="white"/>
    <circle cx="22.8" cy="23.2" r=".9" fill="white"/>
    <!-- nariz -->
    <ellipse cx="18" cy="27" rx="1.8" ry="1.2" fill="#ce93d8"/>
    <!-- boca -->
    <path d="M16 28 Q18 30 20 28" stroke="#ccc" stroke-width=".8" fill="none"/>
    <!-- pernas -->
    <rect class="bla" x="12" y="44" width="7" height="9" rx="3.5" fill="#e1bee7"/>
    <rect class="blb" x="21" y="44" width="7" height="9" rx="3.5" fill="#e1bee7"/>
  </g>
</svg>`;

const PET_SVGS = [CAT_SVG, CAT_SVG, DOG_SVG, DOG_SVG, BUNNY_SVG];

const initPets = () => {
  const layer = document.createElement('div');
  layer.className = 'pet-layer';
  document.body.appendChild(layer);

  const sendPet = () => {
    const pet = document.createElement('div');
    pet.className = 'pet';
    pet.innerHTML = PET_SVGS[Math.floor(Math.random() * PET_SVGS.length)];

    const fromLeft = Math.random() > 0.5;
    pet.style.bottom = (2 + Math.random() * 8) + 'px';
    pet.style.animationDuration = (16 + Math.random() * 10) + 's';

    if (fromLeft) {
      pet.style.left = '-70px';
      pet.style.animationName = 'pet-walk-right';
    } else {
      pet.style.right = '-70px';
      pet.style.animationName = 'pet-walk-left';
      pet.style.transform = 'scaleX(-1)';
    }

    layer.appendChild(pet);
    setTimeout(() => pet.remove(), 28000);
  };

  setTimeout(sendPet, 4000);
  setInterval(sendPet, 12000 + Math.random() * 8000);
};

// ===== patinhas ao clicar (mobile + desktop) =====

const PAW_EMOJI = '🐾';

const initClickPaws = () => {
  const trailLayer = document.createElement('div');
  trailLayer.className = 'paw-trail-layer';
  document.body.appendChild(trailLayer);

  const burstAt = (cx, cy) => {
    const count = 7 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const paw = document.createElement('div');
      paw.className = 'paw-burst';
      paw.textContent = PAW_EMOJI;
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

// ===== boot =====

export const initAmbient = () => {
  initSakura();
  initLanterns();
  initPets();
  initClickPaws();
};
