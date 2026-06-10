// TELA: welcome (typing do nome + botão continuar).

import { goToScreen, registerScreenEnter } from '../nav.js';
import { spawnConfetti } from '../confetti.js';
import { wait } from '../utils.js';

const typeText = (el, text, speed = 110) => new Promise((resolve) => {
  let i = 0;
  el.textContent = '';
  const tick = () => {
    if (i < text.length) {
      el.textContent += text[i++];
      setTimeout(tick, speed);
    } else {
      resolve();
    }
  };
  tick();
});

let welcomePlayed = false;
let welcomeName, welcomeSub, welcomeExtra, btnStart;

const playSequence = async () => {
  if (welcomePlayed) return;
  welcomePlayed = true;
  await wait(400);
  await typeText(welcomeName, 'Amor', 140);
  welcomeName.classList.add('done');
  spawnConfetti(25);

  await wait(500);
  welcomeSub.textContent = 'faz exatamente 1 ano que tudo começou 💛';
  welcomeSub.classList.add('show');

  await wait(700);
  welcomeExtra.textContent = 'eu fiz esse lugar pra você — está cheio de mistérios e segredos esperando pra ser descobertos. espero que goste muito. 🌸';
  welcomeExtra.classList.add('show');

  await wait(900);
  btnStart.classList.add('show');
};

export const resetWelcome = () => {
  welcomePlayed = false;
  if (welcomeName)  welcomeName.classList.remove('done');
  if (welcomeSub)   welcomeSub.classList.remove('show');
  if (welcomeExtra) welcomeExtra.classList.remove('show');
  if (btnStart)     btnStart.classList.remove('show');
};

export const initWelcome = () => {
  welcomeName  = document.getElementById('welcome-name');
  welcomeSub   = document.getElementById('welcome-sub');
  welcomeExtra = document.getElementById('welcome-extra');
  btnStart     = document.getElementById('btn-start');

  btnStart.addEventListener('click', () => goToScreen('hanami'));

  registerScreenEnter('welcome', playSequence);
};
