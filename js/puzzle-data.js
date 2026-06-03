// Sliding puzzle — config da foto e tamanho do grid.
// (textos editáveis pelo painel admin > Textos)

import { applyOverride } from './content-overrides.js';

const DEFAULT = {
  size: 3,
  photoKey: 'puzzle',
  fallbackGradient: 'linear-gradient(135deg, #ff5e8a 0%, #ffd93d 50%, #6bcb77 100%)',
  caption: 'tudo no lugar — inclusive a gente 💛',
  title: 'monte a foto',
  sub: 'arraste as peças até elas se encaixarem',
};

export const PUZZLE = applyOverride('puzzle', DEFAULT);
