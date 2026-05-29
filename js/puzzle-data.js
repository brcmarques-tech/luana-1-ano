// Sliding puzzle — config da foto e tamanho do grid.
// Edite photoKey pra apontar pra uma foto real (assets/img/puzzle.jpg ou luana-api).

export const PUZZLE = {
  // tamanho do grid: 3 = 3x3 (8 peças + 1 vazia), 4 = 4x4 (15 peças)
  size: 3,

  // chave da foto - mesma lógica das outras (imgBase + photoKey + .jpg)
  photoKey: 'puzzle',

  // fallback se a foto não existir (gradient)
  fallbackGradient: 'linear-gradient(135deg, #ff5e8a 0%, #ffd93d 50%, #6bcb77 100%)',

  // legenda que aparece quando ela completa
  caption: 'tudo no lugar 💛',

  // título da tela
  title: 'monte a foto',
  sub: 'arraste as peças até elas se encaixarem',
};
