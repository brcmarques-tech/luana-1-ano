// TELA: gate ("Você é a Luana?") com botão "Não" que foge.

import { unlock } from '../achievements.js';
import { haptic, HAPTIC } from '../haptic.js';
import { playTrack } from '../music.js';
import { spawnConfetti } from '../confetti.js';
import { goToScreen, getScreenEl } from '../nav.js';
import { setupEggWelcomeName } from '../easter-eggs.js';

const HINTS = [
  'tem certeza? 👀',
  'olha a Luana, hein...',
  'só a Luana pode passar 💛',
  'é sério, clica no certo 😅',
  'ok, agora chega de fingir',
];

let btnNo, hint;
let noClickCount = 0;

export const resetGate = () => {
  noClickCount = 0;
  if (btnNo) btnNo.style.transform = '';
  if (hint) hint.classList.remove('show');
};

const moveNoButton = () => {
  const gate = getScreenEl('gate').getBoundingClientRect();
  const rect = btnNo.getBoundingClientRect();
  const margin = 16;
  const maxX = gate.width - rect.width - margin * 2;
  const maxY = gate.height - rect.height - margin * 2;

  const x = Math.random() * maxX - maxX / 2;
  const y = Math.random() * maxY * 0.4 - maxY * 0.2;

  btnNo.style.transform = `translate(${x}px, ${y}px) scale(${0.95 - noClickCount * 0.05})`;

  hint.textContent = HINTS[Math.min(noClickCount, HINTS.length - 1)];
  hint.classList.add('show');

  noClickCount++;
  if (noClickCount === 20) unlock('stubborn');
};

export const initGate = ({ onConfirm }) => {
  const btnYes = document.getElementById('btn-yes');
  btnNo = document.getElementById('btn-no');
  hint = document.getElementById('gate-hint');

  btnNo.addEventListener('mouseenter', moveNoButton);
  btnNo.addEventListener('touchstart', (e) => {
    if (e.cancelable) e.preventDefault();
    moveNoButton();
  }, { passive: false });
  btnNo.addEventListener('click', (e) => {
    e.preventDefault();
    moveNoButton();
  });

  btnYes.addEventListener('click', () => {
    haptic(HAPTIC.tap);
    playTrack('gate');
    spawnConfetti(40);
    unlock('first-step');
    setTimeout(onConfirm, 350);
  });

  // easter egg do welcome name é wired aqui (depende do DOM já existir)
  const welcomeName = document.getElementById('welcome-name');
  if (welcomeName) setupEggWelcomeName(welcomeName, spawnConfetti);
};
