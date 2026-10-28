// TELA: sunday — trava o site inteiro com countdown até 31/10/2026 23:59:59
// (Brasília). Quando libera (ou se ela abrir depois), toca o vídeo — se o
// navegador barrar som sem toque, mostra o botão de play. Ao terminar o vídeo,
// resolve a promise e o boot normal segue. Visto uma vez, não volta mais.
//
// A hora vem do header Date do próprio servidor, então mexer no relógio do
// celular não libera antes. Sem rede, cai no relógio local.

export const SUNDAY_UNLOCK = new Date('2026-10-31T23:59:59-03:00').getTime();

const VIDEO_SRC = 'assets/video/domingo.mp4';
// músicas da espera, uma depois da outra em loop
const WAIT_SONGS = [
  { src: 'assets/audio/antes-do-primeiro-beijo.mp3', title: 'Antes do primeiro beijo' },
  { src: 'assets/audio/kimi-datta.mp3',              title: '君だった' },
  { src: 'assets/audio/cetait-toi.mp3',              title: 'C’était Toi' },
  { src: 'assets/audio/neoyeosseo.mp3',              title: '너였어' },
  { src: 'assets/audio/eto-ty.mp3',                  title: 'Это ты' },
];
const LS_SEEN = 'luana_domingo_visto';
const LS_FIRST_ACCESS = 'luana_first_access'; // mesma chave do progress.js

const isLocalHost = ['localhost', '127.0.0.1'].includes(location.hostname);

// diferença servidor − local, em ms
const fetchClockOffset = async () => {
  try {
    const res = await fetch(`${location.pathname}?t=${Date.now()}`, { method: 'HEAD', cache: 'no-store' });
    const date = res.headers.get('Date');
    if (!date) return 0;
    return new Date(date).getTime() - Date.now();
  } catch {
    return 0;
  }
};

const pad = (n, len = 2) => String(n).padStart(len, '0');

export const holdUntilSunday = async () => {
  const params = new URLSearchParams(location.search);
  // atalhos de teste só em localhost: ?domingo=liberado / ?domingo=travado
  const forced = isLocalHost ? params.get('domingo') : null;

  if (!forced && localStorage.getItem(LS_SEEN)) return;

  // troca de tela antes do fetch pra não piscar o gate
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  const screen = document.getElementById('screen-sunday');
  screen.classList.add('active');

  const offset = forced ? 0 : await fetchClockOffset();
  const now = () => (forced === 'liberado' ? SUNDAY_UNLOCK : Date.now() + offset);

  const waitingEl = document.getElementById('sunday-waiting');
  const readyEl   = document.getElementById('sunday-ready');
  const playBtn   = document.getElementById('sunday-play');
  const videoWrap = document.getElementById('sunday-video-wrap');
  const video     = document.getElementById('sunday-video');

  // src só aqui: quem já viu não baixa o vídeo de novo
  video.src = VIDEO_SRC;

  return new Promise((resolve) => {
    let timer = null;
    let released = false;

    // músicas da espera alternando em loop. Navegador barra som sem interação,
    // então se o play falhar tenta de novo no primeiro toque/tecla em qualquer lugar.
    let songIdx = 0;
    const song = new Audio(WAIT_SONGS[0].src);
    song.volume = 0.5;

    const toggleBtn = document.getElementById('sunday-toggle');
    const titleEl   = document.getElementById('sunday-song-title');

    const syncPlayer = () => {
      toggleBtn.textContent = song.paused ? '▶' : '⏸';
      toggleBtn.setAttribute('aria-label', song.paused ? 'tocar' : 'pausar');
      titleEl.textContent = WAIT_SONGS[songIdx].title;
    };
    song.addEventListener('play', syncPlayer);
    song.addEventListener('pause', syncPlayer);

    const goToSong = (idx) => {
      songIdx = idx % WAIT_SONGS.length;
      song.src = WAIT_SONGS[songIdx].src;
      song.play().catch(() => {});
      syncPlayer();
    };

    song.addEventListener('ended', () => {
      if (!released) goToSong(songIdx + 1);
    });

    const unlockEvents = ['pointerdown', 'keydown', 'touchstart'];
    const stopUnlock = () => unlockEvents.forEach((ev) => document.removeEventListener(ev, startSong));
    const startSong = (e) => {
      if (released) return;
      // toque nos botões do player é tratado por eles mesmos
      if (e?.target?.closest?.('.sunday-player')) return;
      song.play().then(stopUnlock).catch(() => {});
    };
    unlockEvents.forEach((ev) => document.addEventListener(ev, startSong));

    toggleBtn.addEventListener('click', () => {
      stopUnlock();
      if (song.paused) song.play().catch(() => {});
      else song.pause();
    });
    document.getElementById('sunday-next').addEventListener('click', () => {
      stopUnlock();
      goToSong(songIdx + 1);
    });

    const stopSong = () => {
      unlockEvents.forEach((ev) => document.removeEventListener(ev, startSong));
      const fade = setInterval(() => {
        song.volume = Math.max(0, song.volume - 0.05);
        if (song.volume === 0) { clearInterval(fade); song.pause(); }
      }, 60);
    };

    // tenta tocar direto; se o navegador barrar som sem toque, mostra o botão
    const playVideo = () => {
      stopSong();
      videoWrap.hidden = false;
      video.currentTime = 0;
      return video.play();
    };

    const showReady = () => {
      if (released) return;
      released = true;
      clearInterval(timer);
      waitingEl.hidden = true;
      playVideo().catch(() => {
        videoWrap.hidden = true;
        readyEl.hidden = false;
      });
    };

    const tick = () => {
      const diff = SUNDAY_UNLOCK - now();
      if (diff <= 0 && forced !== 'travado') { showReady(); return; }
      const d = Math.max(diff, 0);
      document.getElementById('sd-days').textContent  = pad(Math.floor(d / 86400000));
      document.getElementById('sd-hours').textContent = pad(Math.floor((d % 86400000) / 3600000));
      document.getElementById('sd-mins').textContent  = pad(Math.floor((d % 3600000) / 60000));
      document.getElementById('sd-secs').textContent  = pad(Math.floor((d % 60000) / 1000));
    };

    timer = setInterval(tick, 1000);
    tick();
    startSong(); // depois do tick: se já liberou, não toca

    playBtn.addEventListener('click', () => {
      readyEl.hidden = true;
      playVideo().catch(() => {});
    });

    // viu até o fim → nunca mais aparece (só limpando os dados do site)
    // e ganha 7 dias novos de acesso ao site
    video.addEventListener('ended', () => {
      try { localStorage.setItem(LS_SEEN, String(Date.now())); } catch {}
      try { localStorage.setItem(LS_FIRST_ACCESS, String(Date.now())); } catch {}
      videoWrap.hidden = true;
      screen.classList.remove('active');
      resolve();
    });
  });
};
