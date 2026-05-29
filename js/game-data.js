// 30 fotos aleatórias disponíveis — a cada jogo sorteia 6 diferentes.
// Grid 3x4 (6 pares = 12 cartas).

const ALL_PHOTOS = Array.from({ length: 30 }, (_, i) =>
  `assets/img/game-${String(i + 1).padStart(2, '0')}.jpg`
);

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const PAIRS = shuffle(ALL_PHOTOS).slice(0, 6).map((photo, i) => ({
  id: `p${i + 1}`,
  photo,
  label: `foto ${i + 1}`,
}));
