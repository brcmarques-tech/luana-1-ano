// WebGL shader background engine.
// Cada instância gerencia um <canvas> com um fragment shader próprio.
// Uniforms disponíveis: u_time (float), u_mouse (vec2 0-1), u_resolution (vec2).

const VERT = `
  attribute vec2 a_pos;
  void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

export const createShaderBg = (canvas, fragSrc) => {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
  if (!gl) return null;

  const mkShader = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };

  const prog = gl.createProgram();
  gl.attachShader(prog, mkShader(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, fragSrc));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const posLoc = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uMouse = gl.getUniformLocation(prog, 'u_mouse');
  const uRes = gl.getUniformLocation(prog, 'u_resolution');

  let raf = null;
  let t0 = null;
  let mx = 0.5, my = 0.5;
  let lx = 0.5, ly = 0.5;

  const resize = () => {
    canvas.width  = canvas.offsetWidth  || canvas.parentElement?.offsetWidth  || 390;
    canvas.height = canvas.offsetHeight || canvas.parentElement?.offsetHeight || 844;
    gl.viewport(0, 0, canvas.width, canvas.height);
  };

  const setMouse = (x, y) => {
    const r = canvas.getBoundingClientRect();
    mx = (x - r.left)  / (r.width  || 1);
    my = 1 - (y - r.top) / (r.height || 1);
  };

  const onMouse = (e) => setMouse(e.clientX, e.clientY);
  const onTouch = (e) => setMouse(e.touches[0].clientX, e.touches[0].clientY);
  const ro = new ResizeObserver(resize);

  const loop = (ts) => {
    if (!t0) t0 = ts;
    lx += (mx - lx) * 0.04;
    ly += (my - ly) * 0.04;
    gl.uniform1f(uTime, (ts - t0) / 1000);
    gl.uniform2f(uMouse, lx, ly);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    raf = requestAnimationFrame(loop);
  };

  return {
    start() {
      resize();
      ro.observe(canvas);
      document.addEventListener('mousemove', onMouse);
      document.addEventListener('touchmove', onTouch, { passive: true });
      t0 = null;
      raf = requestAnimationFrame(loop);
    },
    stop() {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      ro.disconnect();
      document.removeEventListener('mousemove', onMouse);
      document.removeEventListener('touchmove', onTouch);
    },
  };
};

// ─── Shader: Gate — plasma roxo/rosa que reage ao mouse ───────────────────────
export const SHADER_GATE = `
precision mediump float;
uniform float u_time;
uniform vec2  u_mouse;
uniform vec2  u_resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time * 0.35;

  float v  = sin(uv.x * 9.0 + t);
        v += sin(uv.y * 7.0 + t * 0.8);
        v += sin((uv.x + uv.y) * 8.0 + t * 0.55);
        v += sin(length(uv - u_mouse) * 13.0 - t * 1.3);
        v /= 4.0;

  float b = v * 0.5 + 0.5;
  vec3 dark   = vec3(0.10, 0.04, 0.18);
  vec3 purple = vec3(0.36, 0.10, 0.60);
  vec3 pink   = vec3(1.00, 0.37, 0.54);

  vec3 col = mix(dark,   purple, smoothstep(0.18, 0.55, b));
       col = mix(col,    pink,   smoothstep(0.52, 0.82, b) * 0.65);

  // brilho sutil perto do mouse
  float glow = exp(-length(uv - u_mouse) * 5.0) * 0.18;
  col += vec3(1.0, 0.6, 0.8) * glow;

  gl_FragColor = vec4(col, 1.0);
}
`;

// ─── Shader: Journey — aurora horizontal lenta que acompanha o scroll ─────────
export const SHADER_JOURNEY = `
precision mediump float;
uniform float u_time;
uniform vec2  u_mouse;
uniform vec2  u_resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t  = u_time * 0.18;
  float mx = u_mouse.x;

  float v  = sin(uv.x * 3.0 + t + mx * 1.5) * sin(uv.y * 7.0 + t * 0.6);
       v  += sin(uv.x * 5.0 - t * 0.7 + mx) * sin(uv.y * 5.0 + t * 0.4) * 0.7;
       v  += sin((uv.x + uv.y) * 4.0 + t * 0.5) * 0.5;
  float b  = v * 0.5 + 0.5;

  vec3 dark   = vec3(0.07, 0.03, 0.14);
  vec3 purple = vec3(0.28, 0.07, 0.50);
  vec3 teal   = vec3(0.04, 0.30, 0.50);

  vec3 col = mix(dark, purple, smoothstep(0.28, 0.62, b));
       col = mix(col,  teal,   smoothstep(0.58, 0.82, b) * 0.45);

  gl_FragColor = vec4(col, 1.0);
}
`;

// ─── Shader: Serendipity — poeira dourada flutuando devagar ───────────────────
export const SHADER_SERENDIPITY = `
precision mediump float;
uniform float u_time;
uniform vec2  u_mouse;
uniform vec2  u_resolution;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

void main() {
  vec2 uv     = gl_FragCoord.xy / u_resolution;
  vec2 offset = (u_mouse - 0.5) * 0.14;
  float t     = u_time * 0.05;

  vec3 col = vec3(0.07, 0.03, 0.12);

  for (float i = 0.0; i < 4.0; i++) {
    float scale = 10.0 + i * 7.0;
    vec2  drift = vec2(t + i * 0.3, t * 0.6 + i * 0.2);
    vec2  g     = (uv + offset * (0.2 + i * 0.1) + drift) * scale;
    vec2  cell  = floor(g);
    vec2  f     = fract(g);

    float r   = hash(cell + i * 7.1);
    float br  = hash(cell + i * 13.3 + 1.0);
    float twk = sin(u_time * (0.6 + br * 1.2) + r * 6.28) * 0.5 + 0.5;
    float p   = smoothstep(0.09, 0.0, length(f - 0.5) - 0.026 * twk);

    vec3 c = mix(vec3(1.0, 0.85, 0.35), vec3(0.75, 0.45, 1.0), br);
    col += p * c * (0.18 + twk * 0.45) * (0.12 + br * 0.55);
  }

  gl_FragColor = vec4(col, 1.0);
}
`;

// ─── Shader: Loves — bokeh rosa/dourado flutuando pra cima ────────────────────
export const SHADER_LOVES = `
precision mediump float;
uniform float u_time;
uniform vec2  u_mouse;
uniform vec2  u_resolution;

float hash(float n) { return fract(sin(n) * 43758.5453); }

void main() {
  vec2 uv  = gl_FragCoord.xy / u_resolution;
  vec3 col = vec3(0.09, 0.03, 0.15);

  for (float i = 0.0; i < 8.0; i++) {
    float seed  = i * 137.5;
    float x     = hash(seed);
    float speed = 0.05 + hash(seed + 1.0) * 0.07;
    float y     = fract(hash(seed + 2.0) - u_time * speed);
    float size  = 0.05 + hash(seed + 3.0) * 0.09;
    float br    = 0.25 + hash(seed + 4.0) * 0.45;

    vec2  pos  = vec2(x + sin(u_time * 0.25 + i) * 0.04 + (u_mouse.x - 0.5) * 0.07, y);
    float orb  = exp(-dot(uv - pos, uv - pos) / (size * size)) * br;
    vec3  c    = mix(vec3(1.0, 0.36, 0.54), vec3(1.0, 0.85, 0.30), hash(seed + 5.0));
    col += orb * c * 0.55;
  }

  gl_FragColor = vec4(col, 1.0);
}
`;

// ─── Shader: Game — faíscas energéticas, brilho perto do mouse ───────────────
export const SHADER_GAME = `
precision mediump float;
uniform float u_time;
uniform vec2  u_mouse;
uniform vec2  u_resolution;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time * 0.55;

  vec3 col = vec3(0.07, 0.03, 0.14);

  vec2 g    = uv * 26.0;
  vec2 cell = floor(g);
  vec2 f    = fract(g);
  float r   = hash(cell);
  float act = step(0.82, r);
  float ph  = hash(cell + 1.0) * 6.28;
  float pls = sin(t * (1.8 + r * 3.0) + ph) * 0.5 + 0.5;
  float sp  = smoothstep(0.13, 0.0, length(f - 0.5)) * act * pls;

  float mg  = exp(-length(uv - u_mouse) * 5.0) * 0.14;
  vec3  c   = mix(vec3(1.0, 0.37, 0.54), vec3(1.0, 0.85, 0.30), r);

  col += sp  * c * (0.55 + pls * 0.45);
  col += vec3(0.45, 0.18, 0.75) * mg;

  gl_FragColor = vec4(col, 1.0);
}
`;

// ─── Shader: Card — iridescência prismática com ondulação do mouse ────────────
export const SHADER_CARD = `
precision mediump float;
uniform float u_time;
uniform vec2  u_mouse;
uniform vec2  u_resolution;

vec3 hsl2rgb(float h, float s, float l) {
  vec3 rgb = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return l + s * (rgb - 0.5) * (1.0 - abs(2.0 * l - 1.0));
}

void main() {
  vec2  uv  = gl_FragCoord.xy / u_resolution;
  float t   = u_time * 0.12;
  float rip = sin(length(uv - u_mouse) * 18.0 - u_time * 3.5) * 0.5 + 0.5;
  float hue = uv.x * 0.35 + uv.y * 0.25 + t + rip * 0.08 + u_mouse.x * 0.18;

  vec3 rainbow = hsl2rgb(fract(hue), 0.65, 0.07 + rip * 0.035);
  vec3 base    = vec3(0.05, 0.02, 0.11);
  vec3 col     = mix(base, rainbow, 0.75 + rip * 0.08);

  gl_FragColor = vec4(col, 1.0);
}
`;

// ─── Shader: Final — bokeh dourado quente respirando ──────────────────────────
export const SHADER_FINAL = `
precision mediump float;
uniform float u_time;
uniform vec2  u_mouse;
uniform vec2  u_resolution;

float hash(float n) { return fract(sin(n) * 43758.5453); }

void main() {
  vec2 uv  = gl_FragCoord.xy / u_resolution;
  vec3 col = vec3(0.07, 0.03, 0.11);

  for (float i = 0.0; i < 10.0; i++) {
    float seed   = i * 91.7;
    vec2  center = vec2(hash(seed), hash(seed + 1.0) * 0.8 + 0.1);
    center += (u_mouse - 0.5) * 0.04 * (1.0 + hash(seed + 2.0));
    float size   = 0.07 + hash(seed + 3.0) * 0.13;
    float breath = sin(u_time * (0.35 + hash(seed + 4.0) * 0.5) + hash(seed + 5.0) * 6.28);
    float br     = (0.18 + hash(seed + 6.0) * 0.45) * (0.88 + breath * 0.12);
    float d      = length(uv - center);
    float orb    = exp(-d * d / (size * size * (1.0 + breath * 0.08))) * br;
    vec3  warm   = mix(vec3(1.0, 0.85, 0.30), vec3(1.0, 0.48, 0.28), hash(seed + 7.0));
    col += orb * warm * 0.5;
  }

  col *= 1.0 - length(uv - 0.5) * 0.55;
  gl_FragColor = vec4(col, 1.0);
}
`;

// ─── Shader: Locked — espaço profundo, melancólico e quase estático ───────────
export const SHADER_LOCKED = `
precision mediump float;
uniform float u_time;
uniform vec2  u_resolution;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

void main() {
  vec2 uv  = gl_FragCoord.xy / u_resolution;
  vec3 col = vec3(0.04, 0.02, 0.09);

  for (float i = 0.0; i < 2.0; i++) {
    float scale = 22.0 + i * 16.0;
    vec2  g     = uv * scale;
    vec2  cell  = floor(g);
    vec2  f     = fract(g);
    float r     = hash(cell + i * 17.3);
    float br    = hash(cell + i * 23.1 + 1.0);
    float twk   = sin(u_time * (0.25 + br * 0.6) + r * 6.28) * 0.5 + 0.5;
    float star  = smoothstep(0.05, 0.0, length(f - 0.5) - 0.014 * twk) * step(0.72, r);
    col += star * vec3(0.55, 0.65, 1.0) * (0.18 + twk * 0.35) * br;
  }

  gl_FragColor = vec4(col, 1.0);
}
`;

// ─── Shader: Welcome/Hanami — campo de estrelas que inclina com o toque ───────
export const SHADER_WELCOME = `
precision mediump float;
uniform float u_time;
uniform vec2  u_mouse;
uniform vec2  u_resolution;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec2 uv     = gl_FragCoord.xy / u_resolution;
  vec2 offset = (u_mouse - 0.5) * 0.22;

  vec3 col = vec3(0.10, 0.04, 0.18);

  for (float i = 0.0; i < 3.0; i++) {
    float scale = 16.0 + i * 13.0;
    vec2  g    = (uv + offset * (0.35 + i * 0.2)) * scale;
    vec2  cell = floor(g);
    vec2  f    = fract(g);

    float r   = hash(cell + i * 17.3);
    float br  = hash(cell + i * 23.1 + 1.0);
    float twk = sin(u_time * (1.1 + br * 2.5) + r * 6.28) * 0.5 + 0.5;
    float star = smoothstep(0.07, 0.0, length(f - 0.5) - 0.019 * (0.55 + twk * 0.45));

    vec3 c = mix(vec3(1.0, 0.92, 0.80), vec3(1.0, 0.85, 0.30), br);
    col += star * c * (0.30 + twk * 0.70) * (0.20 + br * 0.80);
  }

  // névoa suave no centro
  float fog = exp(-length(uv - vec2(0.5)) * 3.0) * 0.06;
  col += vec3(0.6, 0.3, 0.9) * fog;

  gl_FragColor = vec4(col, 1.0);
}
`;
