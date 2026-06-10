// Carta principal da Luana + baralho de pets + carta secreta do Bruno
// (textos editáveis pelo painel admin > Textos)

import { applyOverride } from './content-overrides.js';

const _CARD_DEFAULT = {
  id: 'luana',
  name: 'Luana Telles Melgarejo',
  title: 'A Deusa Acidental',
  type: 'Criatura · Humana · Divina · Confusa',
  rarity: '★★★★★',
  emoji: '🌸',
  photoKey: 'card-luana',
  photoPosition: 'center 14%',
  gradient: 'linear-gradient(135deg, #2a1740 0%, #1a0a2e 50%, #3d2058 100%)',
  border: 'linear-gradient(135deg, #caa3ea 0%, #e8d4ff 50%, #caa3ea 100%)',

  stats: [
    { label: 'AMOR',    value: 999, color: '#caa3ea' },
    { label: 'BELEZA',  value: 100, color: '#caa3ea' },
    { label: 'CARINHO', value: 100, color: '#caa3ea' },
    { label: 'INT',     value:  12, color: '#caa3ea' },
  ],

  abilities: [
    { icon: '☕', name: 'Café Salvador',        desc: 'Traz café sem ser pedido na cama. Restaura +50 HP do Bruno por turno.' },
    { icon: '✨', name: 'Sorriso Crítico',      desc: 'Causa dano emocional fatal em quem olha. Sem contra.' },
    { icon: '🤔', name: 'Pensamento Filosófico',desc: 'Faz perguntas 3 meses depois de filosofar.' },
  ],

  flavor: '"perfeita em tudo, exceto em saber disso."',
};

export const CARD = applyOverride('card', _CARD_DEFAULT);

// cartas de pets + carta bônus
const _BONUS_DEFAULT = [
  {
    id: 'wolf',
    name: 'Wolf',
    title: 'Sir Wolf, o Parceiro Alfa',
    type: 'Criatura · Canino · Alfa · Leal',
    rarity: '★★★★☆',
    emoji: '🐺',
    photoKey: 'card-wolf',
    photoPosition: 'center 52%',
    gradient: 'linear-gradient(135deg, #16303a 0%, #0d1f25 50%, #1e4450 100%)',
    border: 'linear-gradient(135deg, #e3b45c 0%, #ffd07a 50%, #e3b45c 100%)',
    stats: [
      { label: 'PARCERIA', value: 100, color: '#e3b45c' },
      { label: 'FORÇA',    value:  95, color: '#e3b45c' },
      { label: 'LEAL',     value:  99, color: '#e3b45c' },
      { label: 'FARO',     value:  88, color: '#e3b45c' },
    ],
    abilities: [
      { icon: '🐺', name: 'Pacto de Irmandade', desc: 'Sente quando o Bruno tá mal-humorado antes de qualquer um. Buff de presença permanente.' },
      { icon: '✊', name: 'Postura de Alfa',     desc: 'Só de existir, intimida. Passiva permanente (incapacidade de pegar a Winter).' },
    ],
    flavor: '"ele não late pra nada. ele late pra você."',
  },
  {
    id: 'moira',
    name: 'Moira',
    title: 'Moira, a Tsundere Cósmica',
    type: 'Criatura · Felina · Tsundere · Mandona',
    rarity: '★★★★☆',
    emoji: '🐱',
    photoKey: 'card-moira',
    photoPosition: 'center 32%',
    gradient: 'linear-gradient(135deg, #311626 0%, #1f0e18 50%, #451e32 100%)',
    border: 'linear-gradient(135deg, #dca05e 0%, #f5be7a 50%, #dca05e 100%)',
    stats: [
      { label: 'BRIGA',   value:  95, color: '#dca05e' },
      { label: 'ORGULHO', value: 100, color: '#dca05e' },
      { label: 'CARINHO', value:  95, color: '#dca05e' },
      { label: 'RONRON',  value:  80, color: '#dca05e' },
    ],
    abilities: [
      { icon: '🐱', name: 'Ataque Não Solicitado', desc: 'Arranha sem aviso. Dano aleatório. Sem remorso.' },
      { icon: '😼', name: 'Carinho Secreto',        desc: 'Deita do lado quando ninguém tá olhando. Efeito: aquece o coração.' },
    ],
    flavor: '"ela briga mas tá sempre perto."',
  },
  {
    id: 'jairo',
    name: 'Jairo',
    title: 'Jairo, o Bonitão Existencial',
    type: 'Criatura · Felino · Neutro · Estiloso',
    rarity: '★★★☆☆',
    emoji: '😎',
    photoKey: 'card-jairo',
    photoPosition: 'center 36%',
    gradient: 'linear-gradient(135deg, #15243a 0%, #0d1825 50%, #1d334e 100%)',
    border: 'linear-gradient(135deg, #e3b45c 0%, #ffd07a 50%, #e3b45c 100%)',
    stats: [
      { label: 'ESTILO', value: 95, color: '#e3b45c' },
      { label: 'BELEZA', value: 90, color: '#e3b45c' },
      { label: 'PERS',   value: 15, color: '#e3b45c' },
      { label: 'LIGA',   value: 10, color: '#e3b45c' },
    ],
    abilities: [
      { icon: '😎', name: 'Indiferença Calculada', desc: 'Recebe carinho, pisca uma vez. Dano emocional: 0. Charme: 100.' },
      { icon: '✨', name: 'Beleza Sem Esforço',    desc: 'Passiva. Só existe e já é bonito.' },
    ],
    flavor: '"não faz nada. faz tudo com estilo."',
  },
  {
    id: 'winter',
    name: 'Winter',
    title: 'Winter, a Alma Pura da Família',
    type: 'Criatura · Canina · Caótica · Felizardo',
    rarity: '★★★☆☆',
    emoji: '🐶',
    photoKey: 'card-winter',
    photoPosition: 'center 38%',
    gradient: 'linear-gradient(135deg, #3a281c 0%, #251a12 50%, #4e3424 100%)',
    border: 'linear-gradient(135deg, #d6a05c 0%, #f0be7a 50%, #d6a05c 100%)',
    stats: [
      { label: 'FELIZ', value:  99, color: '#d6a05c' },
      { label: 'AMOR',  value: 100, color: '#d6a05c' },
      { label: 'ENERG', value:  98, color: '#d6a05c' },
      { label: 'INT',   value:  10, color: '#d6a05c' },
    ],
    abilities: [
      { icon: '⚡', name: 'Buraco Sem Fim',    desc: 'Faz buracos por dias a fio. Motivo desconhecido.' },
      { icon: '🐶', name: 'Animação Perpétua', desc: 'Fica feliz com absolutamente tudo. Habilidade passiva (Wolf não pega ela por nada).' },
    ],
    flavor: '"nem sempre sabe o que tá fazendo. sempre sabe que te ama."',
  },
  {
    id: 'momoa',
    name: 'Momoa',
    title: 'Momoa, a Assombração Ressentida',
    type: 'Espectro · Felina · Abandonada · Rancorosa',
    rarity: '★★★☆☆',
    emoji: '👻',
    photoKey: 'card-momoa',
    photoPosition: '60% 38%',
    gradient: 'linear-gradient(135deg, #2b1633 0%, #1a0e20 50%, #3d1f47 100%)',
    border: 'linear-gradient(135deg, #c7a0e2 0%, #e0c4ff 50%, #c7a0e2 100%)',
    stats: [
      { label: 'RANCOR',   value: 99, color: '#c7a0e2' },
      { label: 'DOÇURA',   value: 85, color: '#c7a0e2' },
      { label: 'PERDÃO',   value:  2, color: '#c7a0e2' },
      { label: 'ASSOMBRA', value: 90, color: '#c7a0e2' },
    ],
    abilities: [
      { icon: '👻', name: 'Assombração Noturna', desc: 'Aparece nos sonhos da Luana todo dia 17. Sem aviso. Sem motivo.' },
      { icon: '😿', name: 'Era Doce, Era',        desc: 'Ronronava. Amava. E foi mandada embora assim mesmo. Passiva permanente de culpa.' },
    ],
    flavor: '"ela era filha. mas não de vocês, segundo a Luana."',
  },
  {
    id: 'endiabrada',
    name: 'Luana',
    title: 'Luana Endiabrada, a Caçadora',
    type: 'Lendária · Humana · Caótica · Imparável',
    rarity: '★★★★★★',
    emoji: '😈',
    photoKey: 'card-endiabrada',
    photoPosition: 'center 20%',
    gradient: 'linear-gradient(135deg, #3a1014 0%, #250a0d 50%, #4e151a 100%)',
    border: 'linear-gradient(135deg, #ecb24e 0%, #ffd070 50%, #ecb24e 100%)',
    stats: [
      { label: 'CAOS',    value: 999, color: '#ecb24e' },
      { label: 'ENERGIA', value: 999, color: '#ecb24e' },
      { label: 'PIEDADE', value:   0, color: '#ecb24e' },
      { label: 'ARTE',    value: 999, color: '#ecb24e' },
    ],
    abilities: [
      { icon: '😈', name: 'Modo Endiabrado', desc: 'Quando ativado, nada a para. Nenhum animal sobrevive. Nenhum aliado é poupado.' },
      { icon: '⚡', name: 'Arte do Caos',    desc: 'Transforma destruição em criatividade pura. Dano: ∞. Consequências: nenhuma pra ela.' },
      { icon: '🔥', name: 'Imparável',       desc: 'Matou todos os bichinhos inocentes. Conquistou o título mais improvável do universo.' },
    ],
    flavor: '"agitada. querendo fazer arte. nada a para."',
  },
];

export const BONUS_CARDS = applyOverride('bonusCards', _BONUS_DEFAULT);

// carta secreta do Bruno — desbloqueada ao encontrar todos os easter eggs
const _SPECIAL_DEFAULT = {
  id: 'bruno',
  name: 'Bruno Marques',
  title: 'O Agraciado Involuntário',
  type: 'Mítica · Humano · Comediante · Abençoado',
  rarity: '★★★★★★',
  emoji: '😂',
  photoKey: 'card-bruno',
  photoPosition: 'center 24%',
  gradient: 'linear-gradient(135deg, #34301a 0%, #201e0f 50%, #4a4420 100%)',
  border: 'linear-gradient(135deg, #e7c45c 0%, #ffd97a 50%, #e7c45c 100%)',
  stats: [
    { label: 'SORTE',   value: 999, color: '#e7c45c' },
    { label: 'COMÉDIA', value: 100, color: '#e7c45c' },
    { label: 'INT',     value: 100, color: '#e7c45c' },
    { label: 'ATQ',     value:   5, color: '#e7c45c' },
    { label: 'DEF',     value:   3, color: '#e7c45c' },
  ],
  abilities: [
    { icon: '🍀', name: 'Sortudo Demais',  desc: 'Casou com a Luana. +999 em tudo só por isso. Habilidade inata e imerecida.' },
    { icon: '😂', name: 'Comédia Passiva', desc: 'Faz ela rir mesmo sem querer. Não tem controle disso.' },
    { icon: '❤️', name: 'Ruim em Tudo',   desc: '-95 em todas as habilidades técnicas. (a menos que precise, aí fica ∞)' },
  ],
  flavor: '"a sorte? é por ter ela."',
};

export const SPECIAL_CARD = applyOverride('specialCard', _SPECIAL_DEFAULT);
