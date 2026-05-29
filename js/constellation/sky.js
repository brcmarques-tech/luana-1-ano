// Céu noturno pra Constelação.
// 2 camadas: estrelas de fundo aleatórias (twinkle) + 7 estrelas do pin.

import { PIN_STARS, PIN_LINES } from './star-positions.js';

const BG_STAR_COUNT = 180;

// gera estrelas de fundo determinísticas (seed simples)
const seedRng = (seed) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

export const createSky = (canvas) => {
  const ctx = canvas.getContext('2d');
  const rng = seedRng(42);

  // estrelas de fundo: { x, y, r, phase, freq }
  const bgStars = [];
  for (let i = 0; i < BG_STAR_COUNT; i++) {
    bgStars.push({
      x: rng(),
      y: rng(),
      r: 0.3 + rng() * 1.4,
      phase: rng() * Math.PI * 2,
      freq: 0.4 + rng() * 0.8,
      hue: rng() < 0.85 ? 0 : 40 + rng() * 20, // maioria branca, alguns dourados
    });
  }

  let W = 0, H = 0;
  let dpr = window.devicePixelRatio || 1;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  // estado: quais estrelas do pin estão acesas + animações
  let litCount = 0;
  let revealing = false;     // animação de "conexão" das linhas
  let revealProgress = 0;     // 0..1
  let onReveal = null;
  let just_lit_idx = -1;      // estrela recém acesa (anima entrada)
  let just_lit_t = 0;

  // fases do reveal cinematográfico após linhas terminarem
  // 0 = idle; 1 = pulse sincronizado; 2 = fade out tudo; 3 = preto
  let cinePhase = 0;
  let cineT = 0;
  let onCineComplete = null;

  const setLitCount = (n) => { litCount = Math.max(litCount, n); };
  const playLitAnimation = (idx) => { just_lit_idx = idx; just_lit_t = 0; };
  const startReveal = (cb) => {
    revealing = true;
    revealProgress = 0;
    onReveal = () => {
      // após linhas formarem o pin, entra na fase cinematográfica
      onCineComplete = cb;
      cinePhase = 1;
      cineT = 0;
    };
  };

  // ===== render loop =====

  let t0 = null;
  let raf = null;

  const tick = (now) => {
    if (!t0) t0 = now;
    const t = (now - t0) / 1000;

    // === fase cinematográfica pós-linhas ===
    // 1: pulse sincronizado (1.5s); 2: fade-out tudo (1.2s); 3: tela preta (0.4s)
    let globalAlpha = 1;
    let pinScale = 1;
    let bgAlpha = 1;

    if (cinePhase >= 1) {
      cineT += 0.016;

      if (cinePhase === 1) {
        const k = Math.min(1, cineT / 1.5);
        pinScale = 1 + Math.sin(k * Math.PI) * 0.6;
        if (cineT >= 1.5) { cinePhase = 2; cineT = 0; }
      } else if (cinePhase === 2) {
        const k = Math.min(1, cineT / 1.2);
        bgAlpha = 1 - k;
        globalAlpha = 1 - k * 0.7;
        if (cineT >= 1.2) { cinePhase = 3; cineT = 0; }
      } else if (cinePhase === 3) {
        bgAlpha = 0;
        globalAlpha = 0.3 * (1 - Math.min(1, cineT / 0.4));
        if (cineT >= 0.4) {
          cinePhase = 0;
          cineT = 0;
          if (onCineComplete) { const cb = onCineComplete; onCineComplete = null; cb(); }
        }
      }
    }

    // gradient de noite (interpola pra preto durante fase 2-3)
    const grad = ctx.createRadialGradient(W / 2, H * 0.65, 0, W / 2, H * 0.65, Math.max(W, H));
    if (bgAlpha < 1) {
      // mistura com preto baseado em bgAlpha
      const a = Math.round(0x1a * bgAlpha).toString(16).padStart(2, '0');
      const b = Math.round(0x0a * bgAlpha).toString(16).padStart(2, '0');
      const c = Math.round(0x2e * bgAlpha).toString(16).padStart(2, '0');
      grad.addColorStop(0, `#${a}${b}${c}`);
      const d = Math.round(0x0a * bgAlpha).toString(16).padStart(2, '0');
      const e = Math.round(0x05 * bgAlpha).toString(16).padStart(2, '0');
      const f = Math.round(0x18 * bgAlpha).toString(16).padStart(2, '0');
      grad.addColorStop(0.5, `#${d}${e}${f}`);
      grad.addColorStop(1, '#000');
    } else {
      grad.addColorStop(0, '#1a0a2e');
      grad.addColorStop(0.5, '#0a0518');
      grad.addColorStop(1, '#000');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // estrelas de fundo com twinkle
    bgStars.forEach((s) => {
      const tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * s.freq + s.phase));
      const x = s.x * W;
      const y = s.y * H;
      ctx.beginPath();
      ctx.arc(x, y, s.r, 0, Math.PI * 2);
      const finalAlpha = tw * 0.85 * bgAlpha;
      if (s.hue === 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${finalAlpha})`;
      } else {
        ctx.fillStyle = `hsla(${s.hue}, 80%, 75%, ${finalAlpha})`;
      }
      ctx.fill();
    });

    // linhas conectando estrelas (durante reveal e mantém após)
    if (revealing || revealProgress > 0) {
      const totalLines = PIN_LINES.length;
      const linesToDraw = revealProgress * totalLines;

      ctx.strokeStyle = `rgba(255, 217, 61, ${0.55 * globalAlpha})`;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 5]);
      ctx.lineDashOffset = -t * 30;

      PIN_LINES.forEach(([a, b], i) => {
        if (i >= linesToDraw) return;
        const sA = PIN_STARS[a];
        const sB = PIN_STARS[b];
        const partial = Math.min(1, linesToDraw - i);
        ctx.globalAlpha = partial * globalAlpha;
        ctx.beginPath();
        ctx.moveTo(sA.x * W, sA.y * H);
        ctx.lineTo(sB.x * W, sB.y * H);
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
      ctx.setLineDash([]);

      // só incrementa enquanto não chegou no cinematic
      if (cinePhase === 0) {
        revealProgress += 0.006;
        if (revealProgress >= 1 + 0.1 && onReveal) {
          const cb = onReveal;
          onReveal = null;
          cb();
        }
      }
    }

    // estrelas do pin (acesas)
    PIN_STARS.forEach((star, i) => {
      if (i >= litCount) return;
      const x = star.x * W;
      const y = star.y * H;

      // pulse sutil
      const pulse = (0.85 + 0.15 * Math.sin(t * 1.4 + i * 0.7)) * globalAlpha;

      // a estrela central do pin (i=3) é maior — é o "alvo" do pin
      const isCore = i === 3;

      // animação de "acabou de acender"
      let radius = (isCore ? 9 : 6) * pinScale;
      let glow = (isCore ? 38 : 26) * pinScale;
      if (just_lit_idx === i) {
        just_lit_t += 0.016;
        const k = Math.min(1, just_lit_t / 1.2);
        radius += (1 - k) * 30;
        glow += (1 - k) * 60;
      }

      // glow
      const g = ctx.createRadialGradient(x, y, 0, x, y, glow);
      g.addColorStop(0, `rgba(255, 217, 61, ${0.55 * pulse})`);
      g.addColorStop(0.4, `rgba(255, 94, 138, ${0.18 * pulse})`);
      g.addColorStop(1, 'rgba(255, 94, 138, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, glow, 0, Math.PI * 2);
      ctx.fill();

      // core
      ctx.fillStyle = `rgba(255, 245, 220, ${pulse})`;
      ctx.beginPath();
      ctx.arc(x, y, radius * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // 4 raios cruz
      const rayLen = radius * 1.8;
      ctx.strokeStyle = `rgba(255, 245, 220, ${pulse * 0.7})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - rayLen, y); ctx.lineTo(x + rayLen, y);
      ctx.moveTo(x, y - rayLen); ctx.lineTo(x, y + rayLen);
      ctx.stroke();
    });

    raf = requestAnimationFrame(tick);
  };

  const start = () => {
    resize();
    if (!raf) raf = requestAnimationFrame(tick);
  };

  const stop = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = null;
    t0 = null;
  };

  window.addEventListener('resize', resize);

  return { start, stop, resize, setLitCount, playLitAnimation, startReveal };
};
