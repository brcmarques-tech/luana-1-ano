// 8 coisas que ele ama nela.
// (também editável pelo painel admin > Textos)

import { applyOverride } from './content-overrides.js';

const DEFAULT = [
  {
    emoji: '🌅',
    text: 'amo seu jeito lento de acordar',
    sub: 'como se a manhã também precisasse de tempo pra existir',
  },
  {
    emoji: '☕',
    text: 'amo que você lembre coisas que eu nem cheguei a dizer',
    sub: 'como se já tivesse me ouvido em outra vida',
  },
  {
    emoji: '😂',
    text: 'amo a sua risada quando só você acha graça',
    sub: 'é o som mais honesto que eu já ouvi',
  },
  {
    emoji: '🌧️',
    text: 'amo dia ruim, se for com você',
    sub: 'porque o seu colo desfaz qualquer nuvem',
  },
  {
    emoji: '🤔',
    text: 'amo as perguntas que você faz às 23h',
    sub: 'por que o céu é azul, será que a gente vai velho junto',
  },
  {
    emoji: '🐾',
    text: 'amo como você fala com os bichos da casa',
    sub: 'cada um ganha um tom seu, mais doce que o nosso',
  },
  {
    emoji: '🌸',
    text: 'amo sua memória que guarda partes minhas',
    sub: 'que eu nem sabia que tinha',
  },
  {
    emoji: '💛',
    text: 'amo você sendo só você',
    sub: 'sem editar pra ninguém, nem pra mim',
  },
];

export const LOVES = applyOverride('loves', DEFAULT);
