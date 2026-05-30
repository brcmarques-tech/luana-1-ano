// Precarrega assets críticos antes de entrar no site.
// Cada task tem um label e uma fn() que retorna Promise.
// runPreloader() chama onStep (awaitable) e onProgress para cada task.

const audioBase = () => 'assets/audio';

const imgBase = () => {
  const u = localStorage.getItem('luana_api_url');
  return u ? `${u}/assets/img` : 'assets/img';
};

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const preloadAudio = (key, timeout = 5000) =>
  new Promise((resolve) => {
    const a = new Audio();
    const done = () => { clearTimeout(t); resolve(); };
    const t = setTimeout(done, timeout);
    a.preload = 'auto';
    a.oncanplaythrough = done;
    a.onerror = done;
    a.src = `${audioBase()}/${key}.mp3`;
  });

const preloadImg = (key, timeout = 6000) =>
  new Promise((resolve) => {
    const img = new Image();
    const done = () => { clearTimeout(t); resolve(); };
    const t = setTimeout(done, timeout);
    img.onload = done;
    img.onerror = done;
    img.src = `${imgBase()}/${key}.jpg`;
  });

export const LOAD_TASKS = [
  {
    label: 'abrindo o portal 💛',
    fn: () => Promise.all([document.fonts.ready, wait(500)]),
  },
  {
    label: 'reunindo as memórias 🌸',
    fn: () => Promise.all([preloadImg('timeline-01'), wait(400)]),
  },
  {
    label: 'carregando as músicas 🎵',
    fn: () => Promise.all([preloadAudio('gate'), preloadAudio('welcome')]),
  },
  {
    label: 'preparando as surpresas ✨',
    fn: () => Promise.all([
      preloadImg('timeline-02'),
      preloadImg('timeline-03'),
      wait(500),
    ]),
  },
  {
    label: 'quase lá 💌',
    fn: () => wait(700),
  },
];

export const runPreloader = async (onStep, onProgress) => {
  const total = LOAD_TASKS.length;
  for (let i = 0; i < total; i++) {
    await onStep?.(LOAD_TASKS[i].label);
    onProgress?.((i / total) * 100);
    await LOAD_TASKS[i].fn();
    onProgress?.(((i + 1) / total) * 100);
    await wait(80);
  }
};
