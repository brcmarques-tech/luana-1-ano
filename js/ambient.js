// Camadas ambientais: sakura caindo, lanternas balançando, pixel pets andando.
// Inicializadas no boot do site. Respeitam prefers-reduced-motion.

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===== sakura caindo no fundo =====

const SAKURA_SVG = encodeURIComponent(`
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <g>
    <ellipse cx="50" cy="22" rx="14" ry="20" fill="#ffc2d1" transform="rotate(0 50 50)"/>
    <ellipse cx="78" cy="42" rx="14" ry="20" fill="#ffb6c8" transform="rotate(72 78 42)"/>
    <ellipse cx="67" cy="76" rx="14" ry="20" fill="#ffc2d1" transform="rotate(144 67 76)"/>
    <ellipse cx="33" cy="76" rx="14" ry="20" fill="#ffb6c8" transform="rotate(216 33 76)"/>
    <ellipse cx="22" cy="42" rx="14" ry="20" fill="#ffc2d1" transform="rotate(288 22 42)"/>
    <circle cx="50" cy="50" r="6" fill="#ffd6df"/>
  </g>
</svg>`);
const SAKURA_URL = `url("data:image/svg+xml,${SAKURA_SVG}")`;

const initSakura = () => {
  if (REDUCED_MOTION) return;
  const layer = document.createElement('div');
  layer.className = 'sakura-layer';
  document.body.appendChild(layer);

  const isDesktop = window.matchMedia('(min-width: 768px)').matches;
  const intervalMs = isDesktop ? 350 : 550;

  const makePetal = ({ startMid = false } = {}) => {
    const petal = document.createElement('div');
    petal.className = 'sakura-petal';
    petal.style.left = Math.random() * 100 + '%';
    petal.style.backgroundImage = SAKURA_URL;
    const size = 18 + Math.random() * 24;
    petal.style.width = petal.style.height = size + 'px';
    const duration = 8 + Math.random() * 8;
    petal.style.animationDuration = duration + 's';
    petal.style.opacity = (0.7 + Math.random() * 0.3).toFixed(2);
    if (startMid) {
      petal.style.animationDelay = `-${(2 + Math.random() * (duration - 4)).toFixed(1)}s`;
    } else {
      petal.style.animationDelay = (Math.random() * 0.8) + 's';
    }
    layer.appendChild(petal);
    setTimeout(() => petal.remove(), (duration + 2) * 1000);
  };

  // já popula com pétalas em posições visíveis (mid-animation)
  const initialVisible = isDesktop ? 22 : 14;
  for (let i = 0; i < initialVisible; i++) makePetal({ startMid: true });

  // continua dropando do topo
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

// ===== pixel pets andando nas bordas =====

const PETS = ['🐱', '🐶', '🐈', '🐕', '🐾'];

const initPets = () => {
  if (REDUCED_MOTION) return;
  const layer = document.createElement('div');
  layer.className = 'pet-layer';
  document.body.appendChild(layer);

  const sendPet = () => {
    const pet = document.createElement('div');
    pet.className = 'pet';
    pet.textContent = PETS[Math.floor(Math.random() * PETS.length)];
    const fromLeft = Math.random() > 0.5;
    pet.style.bottom = (4 + Math.random() * 10) + 'px';
    pet.style.animationDuration = (16 + Math.random() * 10) + 's';

    if (fromLeft) {
      pet.style.left = '-40px';
      pet.style.animationName = 'pet-walk-right';
    } else {
      pet.style.right = '-40px';
      pet.style.animationName = 'pet-walk-left';
      pet.style.transform = 'scaleX(-1)';
    }

    layer.appendChild(pet);
    setTimeout(() => pet.remove(), 28000);
  };

  // primeiro pet aparece após 4s
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
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;
      const rot = (Math.random() * 60 - 30) + (angle * 180 / Math.PI);
      const size = 1.5 + Math.random() * 0.6;

      paw.style.left = cx + 'px';
      paw.style.top = cy + 'px';
      paw.style.setProperty('--dx', dx + 'px');
      paw.style.setProperty('--dy', dy + 'px');
      paw.style.setProperty('--rot', rot + 'deg');
      paw.style.fontSize = size + 'rem';

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
