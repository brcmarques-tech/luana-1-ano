// ✏️ Edite aqui o conteúdo da tela final.
// (também editável pelo painel admin > Textos)

import { applyOverride } from './content-overrides.js';

const DEFAULT = {
  date: '17 . 06 . 2026',
  badge: '1 ano',

  epigraph: {
    text: 'A vida é muito bela, basta um beijo e o delicado mecanismo se move.',
    author: 'Adélia Prado',
  },

  paragraphs: [
    'Eu queria escrever isso de um jeito engraçado, mas não consegui.',
    'A verdade é que eu nem sei direito o que dizer. Não dá pra resumir um ano com você em um site, em uma página, em mil palavras.',
    'Mas se eu pudesse escolher uma frase, seria essa: do dia que você entrou na minha vida até agora, tudo ficou um pouco mais leve, um pouco mais bobo, um pouco mais nosso.',
    'Encontrei você e na minha vida tudo mudou para melhor. Eu celebro a tua existência na minha vida todos os dias, principalmente hoje, dia em que comemoramos o nosso primeiro aniversário de namoro / noivado.',
    'Antes de te conhecer a solidão me consumia (mesmo sem eu saber), e a minha vida parecia não ter a cor que tem hoje. Você é a minha alegria, você faz com que eu queira ser uma pessoa melhor todos os dias da minha vida. Acredito que juntos podemos voar bem alto, alcançando grandes conquistas!',
    'Sempre achei meio ridículo a expressão "alma gêmea", mas você mudou a minha opinião. Não sei se essa é a designação correta, mas a verdade é que eu sei que não existe outra pessoa no mundo capaz de me fazer feliz como você.',
    'O dia 17 nunca mais será o mesmo e hoje especificamente é dia de festejar o milagre de um amor verdadeiro, que restaurou o meu coração quebrado e sem esperança. Obrigado, meu amor!',
  ],

  signature: '— seu, Bruno',
  restartLabel: 'voltar pro começo ↺',
};

export const FINAL = applyOverride('final', DEFAULT);
