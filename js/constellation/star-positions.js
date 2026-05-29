// 7 estrelas formando um pin clássico de mapa.
// Coordenadas normalizadas (0-1) relativas à área do canvas.
// Ordem = ordem em que acendem (dia 1 → dia 7).

export const PIN_STARS = [
  { day: 1, x: 0.50, y: 0.06, label: 'topo' },           // topo da cabeça
  { day: 2, x: 0.20, y: 0.26, label: 'lateral esquerda' }, // esquerda
  { day: 3, x: 0.80, y: 0.26, label: 'lateral direita' },  // direita
  { day: 4, x: 0.50, y: 0.30, label: 'centro' },          // ponto central (o "alvo")
  { day: 5, x: 0.50, y: 0.54, label: 'pescoço' },         // base da cabeça
  { day: 6, x: 0.50, y: 0.74, label: 'meio' },            // meio da cauda
  { day: 7, x: 0.50, y: 0.94, label: 'ponta' },           // ponta inferior
];

// Linhas conectando estrelas pra formar o pin no reveal.
// Cabeça (losango): topo → esq → pescoço → dir → topo
// Cauda (linha vertical): pescoço → meio → ponta
export const PIN_LINES = [
  [0, 1], // topo -> esq
  [1, 4], // esq -> pescoço
  [4, 2], // pescoço -> dir
  [2, 0], // dir -> topo
  [4, 5], // pescoço -> meio cauda
  [5, 6], // meio cauda -> ponta
];
