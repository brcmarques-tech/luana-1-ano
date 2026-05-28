import { TIMELINE } from './timeline-data.js';
import { LOVES } from './loves-data.js';
import { PAIRS } from './game-data.js';
import { FINAL } from './final-data.js';
import { CARD, BONUS_CARDS, SPECIAL_CARD } from './card-data.js';
import {
  setupEggWelcomeName,
  setupEggTimelineCounter,
  setupEggFinalHeart,
  setupEggKonami,
  setupKonamiCode,
  triggerEgg4Mobile,
} from './easter-eggs.js';
import { initAmbient, startSakura } from './ambient.js';
import { initMusic, playTrack, preloadTrack, toggleMute, isMuted } from './music.js';
import { initHUD, updateHUDForScreen } from './hud.js';
import { unlock, onAllEggsUnlocked } from './achievements.js';
import { animeTransition } from './transitions.js';
import { initSession, loadAchievements } from './progress.js';
import { initAdmin, openAdminPanel } from './admin.js';
import { haptic, HAPTIC } from './haptic.js';
import { initMobileKeyboard } from './mobile-keyboard.js';
import { applyHoloTilt } from './card-holo.js';
import {
  createShaderBg,
  SHADER_GATE, SHADER_WELCOME,
  SHADER_JOURNEY, SHADER_SERENDIPITY, SHADER_LOVES,
  SHADER_GAME, SHADER_CARD, SHADER_FINAL, SHADER_LOCKED,
} from './shader-bg.js';
import { runPreloader } from './preloader.js';
import { initLoveLetter } from './love-letter.js';

'use strict';

const screens = {
  gate: document.getElementById('screen-gate'),
  loading: document.getElementById('screen-loading'),
  welcome: document.getElementById('screen-welcome'),
  hanami: document.getElementById('screen-hanami'),
  journey: document.getElementById('screen-journey'),
  serendipity: document.getElementById('screen-serendipity'),
  loves: document.getElementById('screen-loves'),
  game: document.getElementById('screen-game'),
  card: document.getElementById('screen-card'),
  final: document.getElementById('screen-final'),
};

const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');
const hint = document.getElementById('gate-hint');
const welcomeName = document.getElementById('welcome-name');
const welcomeSub = document.getElementById('welcome-sub');
const btnStart = document.getElementById('btn-start');
const confettiLayer = document.getElementById('confetti-layer');
const btnMute = document.getElementById('btn-mute');

// ===== gate: brincadeira do botão "Não" que foge =====

const hints = [
  'tem certeza? 👀',
  'olha a Luana, hein...',
  'só a Luana pode passar 💛',
  'é sério, clica no certo 😅',
  'ok, agora chega de fingir',
];
let noClickCount = 0;

const moveNoButton = () => {
  const gate = screens.gate.getBoundingClientRect();
  const btn = btnNo.getBoundingClientRect();
  const margin = 16;

  const maxX = gate.width - btn.width - margin * 2;
  const maxY = gate.height - btn.height - margin * 2;

  const x = Math.random() * maxX - maxX / 2;
  const y = Math.random() * maxY * 0.4 - maxY * 0.2;

  btnNo.style.transform = `translate(${x}px, ${y}px) scale(${0.95 - noClickCount * 0.05})`;

  const next = hints[Math.min(noClickCount, hints.length - 1)];
  hint.textContent = next;
  hint.classList.add('show');

  noClickCount++;
};

btnNo.addEventListener('mouseenter', moveNoButton);
btnNo.addEventListener('touchstart', (e) => {
  e.preventDefault();
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
  setTimeout(() => {
    goToScreen('loading');
    startPreloading();
  }, 350);
});

// ===== welcome: typing effect =====

const typeText = (el, text, speed = 110) => new Promise((resolve) => {
  let i = 0;
  el.textContent = '';
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

let welcomePlayed = false;
const playWelcomeSequence = async () => {
  if (welcomePlayed) return;
  welcomePlayed = true;
  await wait(400);
  await typeText(welcomeName, 'Luana', 140);
  welcomeName.classList.add('done');
  spawnConfetti(25);

  await wait(500);
  welcomeSub.textContent = 'faz exatamente 1 ano que tudo começou 💛';
  welcomeSub.classList.add('show');

  await wait(900);
  btnStart.classList.add('show');
};

btnStart.addEventListener('click', () => {
  goToScreen('hanami');
});

document.getElementById('btn-hanami-next')?.addEventListener('click', () => {
  goToScreen('journey');
});

// ===== timeline =====

const timelineEl = document.getElementById('timeline');
const dotsEl = document.getElementById('timeline-dots');
const counterEl = document.getElementById('journey-counter');
let timelineRendered = false;
let lastTimelineIdx = 0;

const renderTimeline = () => {
  if (timelineRendered) return;
  timelineRendered = true;

  timelineEl.innerHTML = '';
  dotsEl.innerHTML = '';

  TIMELINE.forEach((item, idx) => {
    const card = document.createElement('article');
    card.className = 'timeline-card' + (item.isFinal ? ' is-final' : '');
    card.dataset.index = idx;

    if (item.isFinal) {
      card.innerHTML = `
        <div class="final-emoji">💛</div>
        <div class="final-title">${item.caption}</div>
        <div class="final-text">${item.finalText || ''}</div>
        <button class="btn" id="btn-to-loves" type="button">continuar →</button>
      `;
    } else {
      const photoContent = item.photo
        ? `<img src="${item.photo}" alt="${item.caption}" loading="lazy"
               class="img-loading"
               onload="this.classList.remove('img-loading');this.closest('.card-photo').classList.remove('card-photo--skeleton')"
               onerror="this.style.display='none';this.closest('.card-photo').classList.remove('card-photo--skeleton')" />`
        : `<div>
             <div class="placeholder-icon">📷</div>
             <div class="placeholder-text">foto de ${item.date.toLowerCase()}</div>
           </div>`;
      card.innerHTML = `
        <div class="card-photo${item.photo ? ' card-photo--skeleton' : ''}">${photoContent}</div>
        <div class="card-info">
          <div class="card-date">${item.date}</div>
          <div class="card-caption">${item.caption}</div>
        </div>
      `;
    }
    timelineEl.appendChild(card);

    const dot = document.createElement('span');
    dot.className = 'dot' + (idx === 0 ? ' active' : '');
    dot.dataset.index = idx;
    dotsEl.appendChild(dot);
  });

  counterEl.textContent = `1 / ${TIMELINE.length}`;

  // dot click → scroll to card
  dotsEl.addEventListener('click', (e) => {
    const dot = e.target.closest('.dot');
    if (!dot) return;
    const card = timelineEl.children[Number(dot.dataset.index)];
    card?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  });

  // scroll listener → update dots + counter + tilt 3D livro
  let scrollTimer;
  const seenIndices = new Set([0]);
  const applyBookTilt = () => {
    const center = timelineEl.scrollLeft + timelineEl.clientWidth / 2;
    const halfW = timelineEl.clientWidth / 2;
    Array.from(timelineEl.children).forEach((card) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const offset = (cardCenter - center) / halfW;
      const clamped = Math.max(-1.2, Math.min(1.2, offset));
      const rotY = clamped * -28;
      const scale = 1 - Math.abs(clamped) * 0.08;
      const opacity = Math.max(0.4, 1 - Math.abs(clamped) * 0.45);
      card.style.transform = `rotateY(${rotY}deg) scale(${scale})`;
      card.style.opacity = opacity;
    });
  };
  let rafId;
  timelineEl.addEventListener('scroll', () => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(applyBookTilt);

    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const center = timelineEl.scrollLeft + timelineEl.clientWidth / 2;
      let closestIdx = 0;
      let closestDist = Infinity;
      Array.from(timelineEl.children).forEach((card, i) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const d = Math.abs(cardCenter - center);
        if (d < closestDist) {
          closestDist = d;
          closestIdx = i;
        }
      });
      Array.from(dotsEl.children).forEach((d, i) => {
        d.classList.toggle('active', i === closestIdx);
      });
      counterEl.textContent = `${closestIdx + 1} / ${TIMELINE.length}`;
      seenIndices.add(closestIdx);
      if (seenIndices.size === TIMELINE.length) unlock('all-cards-seen');
      if (closestIdx !== lastTimelineIdx) {
        lastTimelineIdx = closestIdx;
        playTrack(`timeline-${String(closestIdx + 1).padStart(2, '0')}`);
        const nextIdx = closestIdx + 2;
        if (nextIdx <= TIMELINE.length) {
          preloadTrack(`timeline-${String(nextIdx).padStart(2, '0')}`);
        }
      }
    }, 80);
  }, { passive: true });

  // tilt inicial
  requestAnimationFrame(applyBookTilt);

  // botão do card final → vai pra próxima tela
  timelineEl.addEventListener('click', (e) => {
    if (e.target.id === 'btn-to-loves') {
      goToScreen('serendipity');
    }
  });
};

// ===== serendipidade =====

const renderSerendipity = () => {
  const btn = document.getElementById('btn-serendipity-next');
  if (!btn || btn.dataset.wired) return;
  btn.dataset.wired = '1';
  btn.addEventListener('click', () => goToScreen('loves'));

  // mobile egg #4: triplo toque rápido no kanji 偶然の美
  const kanji = document.querySelector('.serendipity-kanji');
  if (kanji && !kanji.dataset.eggWired) {
    kanji.dataset.eggWired = '1';
    let taps = 0, tapTimer;
    kanji.addEventListener('click', () => {
      taps++;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(() => { taps = 0; }, 700);
      if (taps >= 3) {
        taps = 0;
        triggerEgg4Mobile(spawnConfetti);
      }
    });
  }
};

// ===== loves =====

const lovesListEl = document.getElementById('loves-list');
const btnToGame = document.getElementById('btn-to-game');
let lovesRendered = false;
let lovesObserver = null;

const renderLoves = () => {
  if (lovesRendered) return;
  lovesRendered = true;

  lovesListEl.innerHTML = '';
  LOVES.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'love-item';
    li.innerHTML = `
      <span class="love-emoji">${item.emoji}</span>
      <div class="love-text">
        <strong>${item.text}</strong>
        ${item.sub ? `<small>${item.sub}</small>` : ''}
      </div>
    `;
    lovesListEl.appendChild(li);
  });

  if (lovesObserver) lovesObserver.disconnect();
  const scrollRoot = document.querySelector('.loves-scroll');
  let revealedCount = 0;
  lovesObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        lovesObserver.unobserve(e.target);
        revealedCount++;
        if (revealedCount === LOVES.length) unlock('loves-read');
      }
    });
  }, { root: scrollRoot, threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

  Array.from(lovesListEl.children).forEach((li) => lovesObserver.observe(li));
};

btnToGame?.addEventListener('click', () => {
  goToScreen('game');
});

// ===== memory game =====

const boardEl = document.getElementById('game-board');
const pairsEl = document.getElementById('game-pairs');
const movesEl = document.getElementById('game-moves');
const btnRestart = document.getElementById('btn-game-restart');
const winOverlay = document.getElementById('game-win');
const btnToFinal = document.getElementById('btn-to-final');

let gameState = null;

const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const renderCardFront = (pair) => {
  if (pair.photo) {
    return `<img src="${pair.photo}" alt="${pair.label}" loading="lazy" />`;
  }
  return `
    <span class="face-emoji">${pair.emoji}</span>
    <span class="face-label">${pair.label}</span>
  `;
};

const renderGame = () => {
  gameState = {
    cards: shuffle(PAIRS.concat(PAIRS)),
    flipped: [],
    matched: new Set(),
    moves: 0,
    locked: false,
  };

  boardEl.innerHTML = '';
  pairsEl.textContent = `0/${PAIRS.length}`;
  movesEl.textContent = '0';
  winOverlay.hidden = true;

  gameState.cards.forEach((pair, idx) => {
    const card = document.createElement('button');
    card.className = 'memory-card';
    card.type = 'button';
    card.dataset.id = pair.id;
    card.dataset.index = idx;
    card.innerHTML = `
      <div class="card-face card-face-back"></div>
      <div class="card-face card-face-front">${renderCardFront(pair)}</div>
    `;
    card.addEventListener('click', () => onCardClick(card, idx));
    boardEl.appendChild(card);
  });
};

const onCardClick = (card, idx) => {
  if (!gameState || gameState.locked) return;
  if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

  card.classList.add('flipped');
  gameState.flipped.push({ card, idx, id: card.dataset.id });

  if (gameState.flipped.length === 2) {
    gameState.moves++;
    movesEl.textContent = String(gameState.moves);
    checkMatch();
  }
};

const checkMatch = () => {
  const [a, b] = gameState.flipped;
  if (a.id === b.id) {
    haptic(HAPTIC.match);
    a.card.classList.add('matched');
    b.card.classList.add('matched');
    gameState.matched.add(a.id);
    gameState.flipped = [];
    pairsEl.textContent = `${gameState.matched.size}/${PAIRS.length}`;
    spawnConfetti(15);

    if (gameState.matched.size === PAIRS.length) {
      setTimeout(showWin, 700);
    }
  } else {
    gameState.locked = true;
    setTimeout(() => {
      a.card.classList.remove('flipped');
      b.card.classList.remove('flipped');
      gameState.flipped = [];
      gameState.locked = false;
    }, 850);
  }
};

const showWin = () => {
  winOverlay.hidden = false;
  spawnConfetti(60);
  unlock('memory-master');
};

btnRestart?.addEventListener('click', renderGame);

btnToFinal?.addEventListener('click', () => {
  goToScreen('card');
});

// ===== carta TCG da Luana + baralho de pets =====

let cardRendered = false;

const imgBase = () => {
  const u = localStorage.getItem('luana_api_url');
  return u ? `${u}/assets/img` : 'assets/img';
};

const renderFullCard = (card) => {
  const photoUrl = card.photoKey ? `${imgBase()}/${card.photoKey}.jpg` : null;
  const imgTag = photoUrl
    ? `<img src="${photoUrl}" alt="" class="card-portrait-img" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />`
    : '';
  const emojiStyle = photoUrl ? 'style="display:none"' : '';

  const statsHtml = card.stats.map((s) => `
    <div class="card-stat" style="border-top-color:${s.color}">
      <div class="stat-label">${s.label}</div>
      <div class="stat-value" style="color:${s.color}">${s.value}</div>
    </div>`).join('');

  const abilHtml = card.abilities.map((a) => `
    <li class="card-ability">
      <span class="ability-icon">${a.icon}</span>
      <div class="ability-text">
        <span class="ability-name">${a.name}</span>
        <span class="ability-desc">${a.desc}</span>
      </div>
    </li>`).join('');

  const cols = card.stats.length;
  return `
    <article class="tcg-card" style="background:${card.gradient};--card-border:${card.border}">
      <div class="card-holo"></div>
      <header class="card-header">
        <span class="card-name">${card.name}</span>
        <span class="card-rarity">${card.rarity}</span>
      </header>
      <div class="card-portrait">
        <div class="card-portrait-bg"></div>
        ${imgTag}
        <div class="card-portrait-emoji" ${emojiStyle}>${card.emoji}</div>
      </div>
      <div class="card-type">${card.type}</div>
      <div class="card-stats" style="grid-template-columns:repeat(${cols},1fr)">${statsHtml}</div>
      <ul class="card-abilities">${abilHtml}</ul>
      <div class="card-flavor">${card.flavor}</div>
    </article>`;
};

const renderCard = () => {
  if (cardRendered) return;
  cardRendered = true;

  const stage = document.getElementById('card-stage');
  const unlocked = loadAchievements();

  // Bruno nunca entra no baralho — só aparece via reveal especial
  const deckCardsHtml = BONUS_CARDS.map((card, i) => {
    const isUnlocked = unlocked.has(card.achievementKey);
    return `
      <div class="deck-card ${isUnlocked ? 'deck-card--unlocked' : 'deck-card--locked'}" data-idx="${i}">
        <div class="deck-card-inner">
          <div class="deck-card-back">
            <div class="deck-back-pattern"></div>
            <div class="deck-back-emblem">✦</div>
          </div>
          <div class="deck-card-front">
            ${renderFullCard(card)}
          </div>
        </div>
      </div>`;
  }).join('');

  stage.className = 'card-stage card-stage--deck';
  stage.innerHTML = `
    <div class="deck-intro">
      <p class="deck-title">suas cartas</p>
      <p class="deck-sub">escolha uma para revelar</p>
    </div>
    <div class="card-deck">${deckCardsHtml}</div>
    <button class="btn btn-card-next deck-hidden" id="btn-deck-next">ver sua carta principal →</button>`;

  const nextBtn = stage.querySelector('#btn-deck-next');
  let flippedAny = false;

  stage.querySelectorAll('.deck-card--unlocked').forEach((el) => {
    el.addEventListener('click', () => {
      haptic(HAPTIC.tap);
      if (el.classList.contains('flipped')) return;
      el.classList.add('flipped');
      setTimeout(() => applyHoloTilt(el.querySelector('.tcg-card')), 650);
      if (!flippedAny) {
        flippedAny = true;
        nextBtn.classList.remove('deck-hidden');
        nextBtn.classList.add('deck-show');
      }
    });
  });

  nextBtn.addEventListener('click', showMainCard);
};

const showMainCard = () => {
  const stage = document.getElementById('card-stage');

  const photoUrl = CARD.photoKey ? `${imgBase()}/${CARD.photoKey}.jpg` : null;
  const imgTag = photoUrl
    ? `<img src="${photoUrl}" alt="" class="card-portrait-img" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />`
    : '';
  const emojiStyle = photoUrl ? 'style="display:none"' : '';

  const statsHtml = CARD.stats.map((s) => `
    <div class="card-stat" style="border-top-color:${s.color}">
      <div class="stat-label">${s.label}</div>
      <div class="stat-value" style="color:${s.color}">${s.value}</div>
    </div>`).join('');

  const abilHtml = CARD.abilities.map((a) => `
    <li class="card-ability">
      <span class="ability-icon">${a.icon}</span>
      <div class="ability-text">
        <span class="ability-name">${a.name}</span>
        <span class="ability-desc">${a.desc}</span>
      </div>
    </li>`).join('');

  stage.className = 'card-stage';
  stage.innerHTML = `
    <article class="luana-card" id="luana-card">
      <div class="card-holo"></div>
      <header class="card-header">
        <span class="card-name">${CARD.name}</span>
        <span class="card-rarity">${CARD.rarity}</span>
      </header>
      <div class="card-portrait">
        <div class="card-portrait-bg"></div>
        ${imgTag}
        <div class="card-portrait-emoji" ${emojiStyle}>${CARD.emoji}</div>
        <span class="card-level">${CARD.level}</span>
      </div>
      <div class="card-type">${CARD.type}</div>
      <div class="card-stats">${statsHtml}</div>
      <ul class="card-abilities">${abilHtml}</ul>
      <div class="card-flavor">${CARD.flavor}</div>
    </article>
    <p class="card-hint">deslize/incline pra brilhar ✨</p>
    <button id="btn-card-next" class="btn btn-card-next" type="button">continuar →</button>`;

  setupCardTilt();

  // Marca que ela viu a carta e anima voando para o perfil
  const wasAlreadySeen = localStorage.getItem('luana_card_seen') === '1';
  localStorage.setItem('luana_card_seen', '1');

  if (!wasAlreadySeen) {
    // pequeno delay para a carta aparecer antes de voar
    setTimeout(flyCardToProfile, 1800);
  }

  document.getElementById('btn-card-next').addEventListener('click', () => goToScreen('final'));
};

const flyCardToProfile = () => {
  const cardEl = document.getElementById('luana-card');
  const avatarEl = document.getElementById('hud-avatar');
  if (!cardEl || !avatarEl) return;

  const cardRect = cardEl.getBoundingClientRect();
  const avatarRect = avatarEl.getBoundingClientRect();

  // destino: centro do avatar
  const destX = avatarRect.left + avatarRect.width / 2 - (cardRect.left + cardRect.width / 2);
  const destY = avatarRect.top + avatarRect.height / 2 - (cardRect.top + cardRect.height / 2);

  const clone = cardEl.cloneNode(true);
  clone.className = 'luana-card card-fly';
  clone.style.cssText = `
    left:${cardRect.left}px;
    top:${cardRect.top}px;
    width:${cardRect.width}px;
    height:${cardRect.height}px;
    --fly-x:${destX}px;
    --fly-y:${destY}px;
    animation: cardFlyToProfile 0.9s cubic-bezier(0.4,0,0.2,1) forwards;
  `;
  document.body.appendChild(clone);

  // pulsa o avatar quando a carta chega
  setTimeout(() => {
    avatarEl.classList.add('hud-avatar--pulse');
    setTimeout(() => { avatarEl.classList.remove('hud-avatar--pulse'); clone.remove(); }, 600);
  }, 900);
};

const setupCardTilt = () => applyHoloTilt(document.getElementById('luana-card'), true);

// ===== reveal especial — carta do Bruno =====

const showSpecialCardReveal = () => {
  if (document.getElementById('special-reveal')) return;

  const overlay = document.createElement('div');
  overlay.id = 'special-reveal';
  overlay.className = 'special-reveal-overlay';
  overlay.innerHTML = `
    <div class="special-reveal-sparkles" id="special-sparkles"></div>
    <p class="special-reveal-title">✨ CARTA ESPECIAL DESBLOQUEADA! ✨</p>
    <div class="special-reveal-card">${renderFullCard(SPECIAL_CARD)}</div>
    <p class="special-reveal-sub">você encontrou todos os segredos escondidos 🏆</p>
    <button class="btn special-reveal-close">fechar ✕</button>`;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('show'));

  const sparklesEl = document.getElementById('special-sparkles');
  const sparkColors = ['#ffd700', '#ffec6e', '#ff5e8a', '#ffffff'];
  for (let i = 0; i < 35; i++) {
    const spark = document.createElement('div');
    spark.className = 'special-spark';
    spark.style.left = Math.random() * 100 + '%';
    spark.style.top = Math.random() * 100 + '%';
    spark.style.background = sparkColors[Math.floor(Math.random() * sparkColors.length)];
    spark.style.setProperty('--dx', (Math.random() * 260 - 130) + 'px');
    spark.style.setProperty('--dy', (Math.random() * 260 - 130) + 'px');
    spark.style.animationDelay = (Math.random() * 0.6) + 's';
    sparklesEl.appendChild(spark);
  }

  const dismiss = () => {
    overlay.classList.remove('show');
    setTimeout(() => overlay.remove(), 400);
  };

  overlay.querySelector('.special-reveal-close').addEventListener('click', dismiss);
  setTimeout(() => { if (overlay.isConnected) dismiss(); }, 8000);
};

onAllEggsUnlocked(showSpecialCardReveal);

// ===== tela final =====

const finalDateEl = document.getElementById('final-date');
const finalBadgeEl = document.getElementById('final-badge');
const finalBodyEl = document.getElementById('final-body');
const finalSigEl = document.getElementById('final-signature');
const finalRestartBtn = document.getElementById('btn-final-restart');
const finalHeartsEl = document.getElementById('final-bg-hearts');

let finalRendered = false;
let finalHeartsInterval = null;

const renderFinal = () => {
  if (!finalRendered) {
    finalRendered = true;
    unlock('happy-ending');

    finalDateEl.textContent = FINAL.date;
    finalBadgeEl.textContent = FINAL.badge;
    finalSigEl.textContent = FINAL.signature;
    finalRestartBtn.textContent = FINAL.restartLabel;

    finalBodyEl.innerHTML = '';
    FINAL.paragraphs.forEach((text) => {
      const p = document.createElement('p');
      p.className = 'final-paragraph';
      p.textContent = text;
      finalBodyEl.appendChild(p);
    });

    finalRestartBtn.addEventListener('click', () => {
      stopFinalHearts();
      welcomePlayed = false;
      timelineRendered = false;
      lovesRendered = false;
      finalRendered = false;
      noClickCount = 0;
      btnNo.style.transform = '';
      hint.classList.remove('show');
      goToScreen('gate');
    });
  }

  // revela parágrafos em cascata
  const paras = finalBodyEl.querySelectorAll('.final-paragraph');
  paras.forEach((p, i) => {
    setTimeout(() => p.classList.add('revealed'), 1600 + i * 1100);
  });

  const lastDelay = 1600 + paras.length * 1100;
  setTimeout(() => finalSigEl.classList.add('revealed'), lastDelay);
  setTimeout(() => finalRestartBtn.classList.add('revealed'), lastDelay + 800);

  startFinalHearts();
};

const startFinalHearts = () => {
  stopFinalHearts();
  const drop = () => {
    const heart = document.createElement('div');
    heart.className = 'final-bg-heart';
    heart.textContent = ['💛', '💗', '💛', '🤍'][Math.floor(Math.random() * 4)];
    heart.style.left = (5 + Math.random() * 90) + '%';
    heart.style.bottom = '-20px';
    heart.style.fontSize = (0.9 + Math.random() * 1.2) + 'rem';
    heart.style.animationDuration = (6 + Math.random() * 6) + 's';
    finalHeartsEl.appendChild(heart);
    setTimeout(() => heart.remove(), 12000);
  };
  for (let i = 0; i < 4; i++) setTimeout(drop, i * 600);
  finalHeartsInterval = setInterval(drop, 900);
};

const stopFinalHearts = () => {
  if (finalHeartsInterval) {
    clearInterval(finalHeartsInterval);
    finalHeartsInterval = null;
  }
};

// ===== navegação entre telas =====

const ANIME_TRANSITION_SCREENS = new Set(['welcome', 'hanami', 'journey', 'serendipity', 'loves', 'game', 'card', 'final']);

const SCREEN_TRACK = {
  gate: 'gate',
  welcome: 'welcome',
  hanami: 'welcome',
  loves: 'loves',
  game: 'game',
  card: 'card',
  final: 'final',
  // journey: inicia pelo primeiro card visível
  // serendipity: continua a trilha do timeline
};

// ===== preloader =====

const startPreloading = () => {
  const textEl = document.getElementById('loading-label');
  const barEl  = document.getElementById('loading-bar');

  const onStep = async (label) => {
    if (textEl.textContent) {
      textEl.classList.add('fade');
      await wait(240);
    }
    textEl.textContent = label;
    textEl.classList.remove('fade');
    await wait(80);
  };

  const onProgress = (pct) => {
    if (barEl) barEl.style.width = pct + '%';
  };

  runPreloader(onStep, onProgress).then(async () => {
    onProgress(100);
    await wait(500);
    goToScreen('welcome');
  });
};

const goToScreen = async (name) => {
  document.body.classList.toggle('screen-loading', name === 'loading');
  const isFirstLoad = !document.querySelector('.screen.active');
  if (ANIME_TRANSITION_SCREENS.has(name) && !isFirstLoad) {
    await animeTransition(name);
  }
  Object.entries(screens).forEach(([key, el]) => {
    if (!el) return;
    el.classList.toggle('active', key === name);
  });
  switchShader(name);
  if (SCREEN_TRACK[name]) playTrack(SCREEN_TRACK[name]);
  if (name === 'journey') playTrack(`timeline-${String(lastTimelineIdx + 1).padStart(2, '0')}`);
  const NEXT_TRACK = { gate:'welcome', welcome:'loves', hanami:'loves', serendipity:'loves', loves:'game', game:'card', card:'final' };
  if (NEXT_TRACK[name]) preloadTrack(NEXT_TRACK[name]);
  if (name === 'hanami') startSakura();
  if (name === 'welcome') playWelcomeSequence();
  if (name === 'journey') renderTimeline();
  if (name === 'serendipity') renderSerendipity();
  if (name === 'loves') renderLoves();
  if (name === 'game') renderGame();
  if (name === 'card') renderCard();
  if (name === 'final') renderFinal();
  if (name !== 'final') stopFinalHearts();
  updateHUDForScreen(name);
};

// ===== confetes =====

const colors = ['#ff5e8a', '#ffd93d', '#6bcb77', '#ffffff', '#e0436e'];

const spawnConfetti = (count = 30) => {
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = (2 + Math.random() * 2.5) + 's';
    piece.style.animationDelay = (Math.random() * 0.4) + 's';
    piece.style.width = piece.style.height = (6 + Math.random() * 8) + 'px';
    (confettiLayer || document.body).appendChild(piece);
    setTimeout(() => piece.remove(), 5000);
  }
};

// ===== áudio =====

btnMute.addEventListener('click', () => {
  const muted = toggleMute();
  btnMute.textContent = muted ? '🔇' : '🔊';
});

// ===== util =====

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ===== easter eggs (plugados após DOM pronto) =====

setupEggWelcomeName(welcomeName, spawnConfetti);
setupEggTimelineCounter(counterEl);
setupEggKonami(spawnConfetti);
setupKonamiCode(spawnConfetti, () => unlock('konami-master'));

const wireUpFinalEgg = () => {
  const finalHeart = document.querySelector('#screen-final .final-heart');
  if (finalHeart) setupEggFinalHeart(finalHeart, spawnConfetti, finalHeartsEl);
};

// ===== tela bloqueada =====

const showLockedScreen = (nextUnlock) => {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  const screen = document.getElementById('screen-locked');
  if (!screen) return;
  screen.classList.add('active');

  const daysEl  = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl  = document.getElementById('cd-mins');
  const secsEl  = document.getElementById('cd-secs');

  const pad = (n, len = 2) => String(n).padStart(len, '0');

  const tick = () => {
    const diff = nextUnlock - Date.now();
    if (diff <= 0) { location.reload(); return; }
    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000)  / 60000);
    const secs  = Math.floor((diff % 60000)    / 1000);
    daysEl.textContent  = pad(days, 3);
    hoursEl.textContent = pad(hours);
    minsEl.textContent  = pad(mins);
    secsEl.textContent  = pad(secs);
  };

  tick();
  setInterval(tick, 1000);
};

// ===== shader backgrounds =====

const mkCanvas = (screenEl) => {
  const c = document.createElement('canvas');
  c.className = 'shader-canvas';
  screenEl.prepend(c);
  return c;
};

const shaderGate         = createShaderBg(mkCanvas(screens.gate),         SHADER_GATE);
const shaderLoading      = createShaderBg(mkCanvas(screens.loading),      SHADER_GATE);
const shaderWelcome      = createShaderBg(mkCanvas(screens.welcome),      SHADER_WELCOME);
const shaderHanami       = createShaderBg(mkCanvas(screens.hanami),       SHADER_WELCOME);
const shaderJourney      = createShaderBg(mkCanvas(screens.journey),      SHADER_JOURNEY);
const shaderSerendipity  = createShaderBg(mkCanvas(screens.serendipity),  SHADER_SERENDIPITY);
const shaderLoves        = createShaderBg(mkCanvas(screens.loves),        SHADER_LOVES);
const shaderGame         = createShaderBg(mkCanvas(screens.game),         SHADER_GAME);
const shaderCard         = createShaderBg(mkCanvas(screens.card),         SHADER_CARD);
const shaderFinal        = createShaderBg(mkCanvas(screens.final),        SHADER_FINAL);
const shaderLocked       = createShaderBg(mkCanvas(screens.locked),       SHADER_LOCKED);

const SCREEN_SHADERS = {
  gate:        shaderGate,
  loading:     shaderLoading,
  welcome:     shaderWelcome,
  hanami:      shaderHanami,
  journey:     shaderJourney,
  serendipity: shaderSerendipity,
  loves:       shaderLoves,
  game:        shaderGame,
  card:        shaderCard,
  final:       shaderFinal,
  locked:      shaderLocked,
};
let _activeShader = null;

const switchShader = (name) => {
  if (_activeShader) { _activeShader.stop(); _activeShader = null; }
  const s = SCREEN_SHADERS[name];
  if (s) { s.start(); _activeShader = s; }
};

// boot
initAmbient();
initAdmin();
initMusic();
initMobileKeyboard();
btnMute.textContent = isMuted() ? '🔇' : '🔊';

initSession().then((access) => {
  if (!access.hasAccess) {
    showLockedScreen(access.nextUnlock);
  } else {
    initHUD();
    initLoveLetter();
    goToScreen('gate');
    wireUpFinalEgg();
  }
});
