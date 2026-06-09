// Fotos em forma de balão subindo após o reveal da constelação.
// Clique no balão: para, incha e explode.
// Adicione fotos em assets/photos/balloons/ e liste aqui.

export const BALLOON_PHOTOS = [
  'assets/img/timeline-01.jpg',
  'assets/img/timeline-02.jpg',
  'assets/img/timeline-03.jpg',
  'assets/img/timeline-04.jpg',
  'assets/img/timeline-05.jpg',
  'assets/img/timeline-06.jpg',
  'assets/img/timeline-07.jpg',
  'assets/img/timeline-08.jpg',
  'assets/img/timeline-09.jpg',
  'assets/img/timeline-10.jpg',
  'assets/img/timeline-11.jpg',
  'assets/img/timeline-12.jpg',
  'assets/img/game-01.jpg',
  'assets/img/game-02.jpg',
  'assets/img/game-03.jpg',
  'assets/img/game-04.jpg',
  'assets/img/game-05.jpg',
  'assets/img/game-06.jpg',
  'assets/img/game-07.jpg',
  'assets/img/game-08.jpg',
  'assets/img/game-09.jpg',
  'assets/img/game-10.jpg',
  'assets/img/game-11.jpg',
  'assets/img/game-12.jpg',
  'assets/img/game-13.jpg',
  'assets/img/game-14.jpg',
  'assets/img/game-15.jpg',
  'assets/img/começo-3.jpg',
];

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// partículas coloridas voando ao explodir
const spawnParticles = (wrap) => {
  const rect = wrap.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height * 0.35;
  const colors = ['#FFD93D', '#FF6B6B', '#4ECDC4', '#A8E6CF', '#F7AEF8', '#FFB347'];
  const count = 12;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'cn-particle';
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
    const dist  = 55 + Math.random() * 85;
    const size  = 5 + Math.random() * 9;
    p.style.cssText = [
      `position:fixed`,
      `left:${cx}px`,
      `top:${cy}px`,
      `width:${size}px`,
      `height:${size}px`,
      `background:${colors[i % colors.length]}`,
      `border-radius:50%`,
      `pointer-events:none`,
      `z-index:9999`,
      `--tx:${(Math.cos(angle) * dist).toFixed(1)}px`,
      `--ty:${(Math.sin(angle) * dist).toFixed(1)}px`,
      `animation:cn-particle 0.65s ease-out forwards`,
    ].join(';');
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 750);
  }
};

const createBalloon = (src, onPopped) => {
  const bw       = 90  + Math.random() * 70;    // largura 90–160px
  const bh       = bw  * 1.18;                  // altura ~18% maior
  const kh       = bw  * 0.11;                  // altura do nó
  const kw       = bw  * 0.09;
  const strLen   = 72;                           // comprimento do cordão (fixo)
  const cx       = bw / 2;

  // curva do cordão: suave S
  const r1 = Math.random();
  const r2 = Math.random();
  const cp1x = cx - 6 + r1 * 12;
  const cp2x = cx + 6 - r2 * 12;
  const endX  = cx + (Math.random() - 0.5) * 6;
  const stringPath = `M${cx.toFixed(1)},0 C${cp1x.toFixed(1)},${(strLen*0.35).toFixed(1)} ${cp2x.toFixed(1)},${(strLen*0.65).toFixed(1)} ${endX.toFixed(1)},${strLen}`;

  const swayDur  = 1800 + Math.random() * 2400;
  const swayAmp  = 18   + Math.random() * 46;
  const rot      = (Math.random() - 0.5) * 12;
  const riseDur  = 9000 + Math.random() * 5000;
  const startPct = 4    + Math.random() * 88;
  const totalH   = bh + kh + strLen + 24;

  const wrap = document.createElement('div');
  wrap.className = 'cn-balloon-wrap';
  wrap.style.cssText = [
    `left:${startPct.toFixed(1)}%`,
    `bottom:-${(totalH + 20).toFixed(0)}px`,
    `--rise:${riseDur.toFixed(0)}ms`,
    `--sway:${swayDur.toFixed(0)}ms`,
    `--amp:${swayAmp.toFixed(1)}px`,
    `--rot:${rot.toFixed(2)}deg`,
    `--bw:${bw.toFixed(0)}px`,
  ].join(';');

  wrap.innerHTML = `
    <div class="cn-balloon-inner">
      <div class="cn-balloon-shell">
        <div class="cn-balloon-body" style="width:${bw.toFixed(0)}px;height:${bh.toFixed(0)}px">
          <img class="cn-balloon-img" src="${src}" loading="lazy" draggable="false" />
          <div class="cn-balloon-shine"></div>
        </div>
        <div class="cn-balloon-knot" style="width:${kw.toFixed(0)}px;height:${kh.toFixed(0)}px"></div>
        <svg class="cn-balloon-string" width="${bw.toFixed(0)}" height="${strLen}" viewBox="0 0 ${bw.toFixed(0)} ${strLen}">
          <path d="${stringPath}" stroke="rgba(255,255,255,0.45)" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        </svg>
      </div>
    </div>`;

  // clique: segura → incha → explode
  wrap.addEventListener('click', (e) => {
    e.stopPropagation();
    if (wrap.dataset.held) return;
    wrap.dataset.held = '1';

    // pausa subida e balanço
    wrap.style.animationPlayState = 'paused';
    const inner = wrap.querySelector('.cn-balloon-inner');
    if (inner) inner.style.animationPlayState = 'paused';

    const shell = wrap.querySelector('.cn-balloon-shell');
    shell.classList.add('cn-balloon--inflating');

    shell.addEventListener('animationend', () => {
      shell.classList.remove('cn-balloon--inflating');
      shell.classList.add('cn-balloon--pop');
      spawnParticles(wrap);
      onPopped?.();
      setTimeout(() => wrap.remove(), 450);
    }, { once: true });
  });

  return { wrap, riseDur, totalH };
};

let _timer = null;

export const stopBalloons = () => {
  if (_timer) { clearTimeout(_timer); _timer = null; }
};

export const startBalloons = (container, photos = BALLOON_PHOTOS, onDone, onAllPopped) => {
  stopBalloons();

  const list  = shuffle(photos);
  const total = list.length;
  const maxMs = 200_000;
  let launched = 0;
  let popped   = 0;
  let elapsed  = 0;

  const handlePop = () => {
    popped++;
    if (onAllPopped && popped >= total) onAllPopped();
  };

  const launch = () => {
    if (launched >= total || elapsed >= maxMs) return;

    const { wrap, riseDur } = createBalloon(list[launched++], handlePop);
    container.appendChild(wrap);

    const isLast = launched >= total || elapsed >= maxMs;
    setTimeout(() => {
      wrap.remove();
      if (isLast && onDone) onDone();
    }, riseDur + 900);

    if (!isLast) {
      const delay = 1400 + Math.random() * 1200;
      elapsed += delay;
      _timer = setTimeout(launch, delay);
    }
  };

  launch();
};
