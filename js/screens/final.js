// TELA: final — mensagem em cascata + chuva de corações.
// O botão de restart reseta todos os screens via callback.

import { FINAL } from '../final-data.js';
import { goToScreen, registerScreenEnter, registerScreenExit } from '../nav.js';
import { unlock } from '../achievements.js';
import { setupEggFinalHeart } from '../easter-eggs.js';
import { spawnConfetti } from '../confetti.js';
import { revealCard } from '../card-reveal.js';
import { openProfilePanel } from '../hud.js';
import { CARD } from '../card-data.js';
import { pauseForVideo, resumeAfterVideo } from '../music.js';

const FINAL_VIDEO_SRC = 'assets/video/mensagem-final.mp4';

// força o browser a baixar o vídeo em background — chamado a partir da tela de game
// pra que a Luana não espere quando clicar em "minha mensagem pra você".
let _preloadEl = null;
export const preloadFinalVideo = () => {
  if (_preloadEl) return;
  _preloadEl = document.createElement('video');
  _preloadEl.src = FINAL_VIDEO_SRC;
  _preloadEl.preload = 'auto';
  _preloadEl.muted = true;
  _preloadEl.playsInline = true;
  _preloadEl.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;left:-9999px';
  document.body.appendChild(_preloadEl);
};

const openFinalVideo = () => {
  if (document.getElementById('final-video-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'final-video-overlay';
  overlay.className = 'final-video-overlay';
  overlay.innerHTML = `
    <video class="final-video-player" src="${FINAL_VIDEO_SRC}" controls playsinline></video>
    <button class="final-video-close" id="final-video-close" aria-label="fechar">✕</button>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('show'));

  const video = overlay.querySelector('video');
  pauseForVideo();
  video.play().catch(() => {});

  const close = () => {
    video.pause();
    overlay.classList.remove('show');
    resumeAfterVideo();
    setTimeout(() => overlay.remove(), 400);
  };

  document.getElementById('final-video-close').addEventListener('click', close);
  video.addEventListener('ended', close);
};

let dateEl, badgeEl, bodyEl, sigEl, restartBtn, videoBtnEl, heartsEl;
let rendered = false;
let heartsInterval = null;
let onRestart = null;

const startHearts = () => {
  stopHearts();
  const drop = () => {
    const heart = document.createElement('div');
    heart.className = 'final-bg-heart';
    heart.textContent = ['💛', '💗', '💛', '🤍'][Math.floor(Math.random() * 4)];
    heart.style.left = (5 + Math.random() * 90) + '%';
    heart.style.bottom = '-20px';
    heart.style.fontSize = (0.9 + Math.random() * 1.2) + 'rem';
    heart.style.animationDuration = (6 + Math.random() * 6) + 's';
    heartsEl.appendChild(heart);
    setTimeout(() => heart.remove(), 12000);
  };
  for (let i = 0; i < 4; i++) setTimeout(drop, i * 600);
  heartsInterval = setInterval(drop, 900);
};

const stopHearts = () => {
  if (heartsInterval) {
    clearInterval(heartsInterval);
    heartsInterval = null;
  }
};

const render = () => {
  if (!rendered) {
    rendered = true;
    unlock('happy-ending');
    setTimeout(() => revealCard(CARD, () => openProfilePanel()), 2000);

    dateEl.textContent  = FINAL.date;
    badgeEl.textContent = FINAL.badge;
    sigEl.textContent   = FINAL.signature;
    restartBtn.textContent = FINAL.restartLabel;

    bodyEl.innerHTML = '';

    // epígrafe literária (se houver)
    if (FINAL.epigraph) {
      const epi = document.createElement('blockquote');
      epi.className = 'final-epigraph final-paragraph';
      epi.innerHTML = `“${FINAL.epigraph.text}”<cite>— ${FINAL.epigraph.author}</cite>`;
      bodyEl.appendChild(epi);
    }

    FINAL.paragraphs.forEach((text) => {
      const p = document.createElement('p');
      p.className = 'final-paragraph';
      p.textContent = text;
      bodyEl.appendChild(p);
    });

    restartBtn.addEventListener('click', () => {
      stopHearts();
      onRestart?.();
      goToScreen('gate');
    });

    videoBtnEl = document.createElement('button');
    videoBtnEl.className = 'btn-final-video';
    videoBtnEl.innerHTML = '▶ minha mensagem pra você';
    videoBtnEl.addEventListener('click', openFinalVideo);
    restartBtn.insertAdjacentElement('beforebegin', videoBtnEl);
  }

  const paras = bodyEl.querySelectorAll('.final-paragraph');
  paras.forEach((p, i) => setTimeout(() => p.classList.add('revealed'), 1600 + i * 1100));

  const lastDelay = 1600 + paras.length * 1100;
  setTimeout(() => sigEl.classList.add('revealed'), lastDelay);
  setTimeout(() => videoBtnEl.classList.add('revealed'), lastDelay + 800);
  setTimeout(() => restartBtn.classList.add('revealed'), lastDelay + 1600);

  startHearts();
};

export const initFinal = ({ onFullRestart }) => {
  dateEl     = document.getElementById('final-date');
  badgeEl    = document.getElementById('final-badge');
  bodyEl     = document.getElementById('final-body');
  sigEl      = document.getElementById('final-signature');
  restartBtn = document.getElementById('btn-final-restart');
  heartsEl   = document.getElementById('final-bg-hearts');
  videoBtnEl = null;
  onRestart  = onFullRestart;

  const heart = document.querySelector('#screen-final .final-heart');
  if (heart) setupEggFinalHeart(heart, spawnConfetti, heartsEl);

  registerScreenEnter('final', render);
  registerScreenExit('final', (next) => {
    if (next !== 'final') stopHearts();
  });
};
