// TELA: constellation — céu noturno com 7 estrelas/perguntas.
// 1 pergunta liberada por dia. No 7º dia, reveal: estrelas formam pin,
// transição céu→mapa, coordenadas do primeiro encontro.

import { registerScreenEnter, goToScreen } from '../nav.js';
import { playTrack } from '../music.js';
import { startBalloons, stopBalloons } from '../constellation/balloons.js';
import { unlock } from '../achievements.js';
import { haptic, HAPTIC } from '../haptic.js';
import {
  initConstellation,
  getStatus,
  getAnswers,
  saveAnswer,
  msUntilNextDay,
  QUESTIONS,
  REVEAL,
} from '../constellation/data.js';
import { createSky } from '../constellation/sky.js';
import { PIN_STARS } from '../constellation/star-positions.js';
import { getPreviousScreen } from '../constellation/sky-button.js';

let canvas, panel, sky;
let initialized = false;
let started = false;

const fmtCountdown = (ms) => {
  if (ms <= 0) return '00:00:00';
  const h = Math.floor(ms / 3.6e6);
  const m = Math.floor((ms % 3.6e6) / 6e4);
  const s = Math.floor((ms % 6e4) / 1e3);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
};

// ===== UI rendering =====

const renderPanel = () => {
  const status = getStatus();
  const answers = getAnswers();

  // já completou tudo → não mostra mais panel de pergunta
  if (status.complete) {
    panel.innerHTML = `
      <div class="cn-complete">
        <p class="cn-complete-title">você acendeu todas as estrelas 🌟</p>
        <p class="cn-complete-sub">toque pra rever o que elas significam</p>
        <button class="btn cn-reveal-btn" id="cn-reveal-btn">ver agora →</button>
      </div>`;
    document.getElementById('cn-reveal-btn').addEventListener('click', startReveal);
    return;
  }

  // não pode responder hoje → mostra contagem
  if (!status.canAnswerToday) {
    const ms = msUntilNextDay();
    panel.innerHTML = `
      <div class="cn-wait">
        <p class="cn-wait-title">a próxima estrela aparece em</p>
        <p class="cn-countdown" id="cn-countdown">${fmtCountdown(ms)}</p>
        <p class="cn-wait-sub">${status.answered}/7 acendidas</p>
      </div>`;
    const cdEl = document.getElementById('cn-countdown');
    const id = setInterval(() => {
      const left = msUntilNextDay();
      if (left <= 0) {
        clearInterval(id);
        renderPanel();
        return;
      }
      if (cdEl?.isConnected) cdEl.textContent = fmtCountdown(left);
      else clearInterval(id);
    }, 1000);
    return;
  }

  // pergunta do dia
  const q = QUESTIONS[status.day - 1];
  if (!q) return;

  const eyebrow = `dia ${q.day} · ${q.title}`;
  const quoteHtml = q.quote
    ? `<p class="cn-quote">“${q.quote.text}” <span class="cn-quote-author">— ${q.quote.author}</span></p>`
    : '';

  if (q.freeTextOnly) {
    panel.innerHTML = `
      <div class="cn-question">
        <p class="cn-eyebrow">${eyebrow}</p>
        ${quoteHtml}
        <p class="cn-text">${q.text}</p>
        <textarea class="cn-textarea" id="cn-text-input"
          maxlength="${q.maxLength || 200}"
          placeholder="${q.placeholder || ''}" rows="3"></textarea>
        <button class="btn cn-submit" id="cn-submit" disabled>acender estrela ✦</button>
      </div>`;
    const ta = document.getElementById('cn-text-input');
    const btn = document.getElementById('cn-submit');
    ta.addEventListener('input', () => { btn.disabled = ta.value.trim().length === 0; });
    btn.addEventListener('click', () => submitAnswer(q.day, { text: ta.value.trim() }));
    return;
  }

  // múltipla escolha + opcional texto livre
  const optsHtml = q.options.map((o) => `
    <label class="cn-option">
      <input type="radio" name="cn-opt" value="${o.id}" data-free="${o.freeText ? '1' : '0'}" />
      <span class="cn-option-label">${o.label}</span>
    </label>
  `).join('');

  panel.innerHTML = `
    <div class="cn-question">
      <p class="cn-eyebrow">${eyebrow}</p>
      ${quoteHtml}
      <p class="cn-text">${q.text}</p>
      <div class="cn-options">${optsHtml}</div>
      <textarea class="cn-textarea cn-textarea--free" id="cn-text-input"
        maxlength="200" placeholder="conta…" rows="2" hidden></textarea>
      <button class="btn cn-submit" id="cn-submit" disabled>acender estrela ✦</button>
    </div>`;

  const radios = panel.querySelectorAll('input[name="cn-opt"]');
  const ta = document.getElementById('cn-text-input');
  const btn = document.getElementById('cn-submit');
  let selected = null;
  let isFree = false;

  radios.forEach((r) => {
    r.addEventListener('change', () => {
      selected = r.value;
      isFree = r.dataset.free === '1';
      ta.hidden = !isFree;
      btn.disabled = isFree ? ta.value.trim().length === 0 : false;
      if (isFree) ta.focus();
    });
  });
  ta.addEventListener('input', () => {
    if (isFree) btn.disabled = ta.value.trim().length === 0;
  });
  btn.addEventListener('click', () => {
    if (!selected) return;
    const text = isFree ? ta.value.trim() : '';
    submitAnswer(q.day, { optionId: selected, text });
  });
};

const submitAnswer = async (day, payload) => {
  haptic(HAPTIC.tap);
  await saveAnswer(day, payload);
  sky.setLitCount(day);
  sky.playLitAnimation(day - 1);
  // pulse celebrating animation
  const star = PIN_STARS[day - 1];
  panel.innerHTML = `
    <div class="cn-flash">
      <p class="cn-flash-title">estrela acesa ✦</p>
      <p class="cn-flash-sub">${day}/7</p>
    </div>`;
  setTimeout(renderPanel, 2200);

  const status = getStatus();
  if (status.complete) {
    setTimeout(() => unlock('beginning'), 600);
  }
};

// ===== reveal: linhas conectam estrelas, depois aparecem só as coordenadas =====

const enterFullscreen = async () => {
  const el = document.getElementById('screen-constellation');
  if (!el) return;
  try {
    if (el.requestFullscreen) await el.requestFullscreen();
    else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
  } catch { /* alguns iOS não permitem */ }
};

const exitFullscreen = async () => {
  try {
    if (document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen();
    else if (document.webkitFullscreenElement && document.webkitExitFullscreen) await document.webkitExitFullscreen();
  } catch {}
};

const startReveal = () => {
  panel.classList.add('cn-panel--hidden');
  playTrack('constellation');
  enterFullscreen();
  sky.startReveal(() => {
    setTimeout(showRevealText, 600);
  });
};

const typeInto = (el, text, speed = 60) => new Promise((resolve) => {
  el.textContent = '';
  let i = 0;
  const tick = () => {
    if (i < text.length) {
      el.textContent += text[i++];
      setTimeout(tick, speed);
    } else {
      resolve();
    }
  };
  tick();
});

const showRevealText = async () => {
  if (document.getElementById('cn-reveal-overlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'cn-reveal-overlay';
  overlay.className = 'cn-reveal-overlay';
  overlay.innerHTML = `
    <div class="cn-reveal-content">
      <div class="cn-reveal-coords">
        <span class="cn-coord-line cn-typed" data-target="${REVEAL.dms}"></span>
        <span class="cn-coord-line cn-coord-dec cn-typed" data-target="${REVEAL.lat}°, ${REVEAL.lon}°"></span>
      </div>
      <button class="btn cn-reveal-close" id="cn-reveal-close" hidden>voltar →</button>
    </div>`;
  document.getElementById('screen-constellation').appendChild(overlay);

  // overlay fade-in
  requestAnimationFrame(() => overlay.classList.add('show'));

  // pausa de respiro antes do typewriter
  await new Promise((r) => setTimeout(r, 700));

  // type primeira linha (DMS)
  const lines = overlay.querySelectorAll('.cn-typed');
  await typeInto(lines[0], REVEAL.dms, 70);

  await new Promise((r) => setTimeout(r, 400));
  // type segunda linha (decimal)
  await typeInto(lines[1], `${REVEAL.lat}°, ${REVEAL.lon}°`, 50);

  await new Promise((r) => setTimeout(r, 600));

  // lança os balões após as coordenadas aparecerem
  const cnScreen = document.getElementById('screen-constellation');
  if (cnScreen) startBalloons(cnScreen);

  const btn = document.getElementById('cn-reveal-close');
  requestAnimationFrame(() => btn.classList.add('cn-reveal-close--show'));
  btn.addEventListener('click', dismissReveal);
};

const dismissReveal = () => {
  stopBalloons();
  const overlay = document.getElementById('cn-reveal-overlay');
  overlay?.classList.remove('show');
  exitFullscreen();
  setTimeout(() => {
    overlay?.remove();
    panel.classList.remove('cn-panel--hidden');
    renderPanel();
  }, 600);
};

// ===== entry point =====

const onEnter = async () => {
  if (!initialized) {
    initialized = true;
    await initConstellation();
  }

  if (!started) {
    started = true;
    sky.start();
  } else {
    sky.resize();
  }

  // já lit count
  const status = getStatus();
  sky.setLitCount(status.answered);

  renderPanel();
};

export const initConstellationScreen = () => {
  const screen = document.getElementById('screen-constellation');
  if (!screen) return;
  canvas = document.getElementById('cn-canvas');
  panel = document.getElementById('cn-panel');

  sky = createSky(canvas);

  document.getElementById('btn-cn-back')?.addEventListener('click', () => {
    exitFullscreen();
    goToScreen(getPreviousScreen());
  });

  registerScreenEnter('constellation', onEnter);
};
