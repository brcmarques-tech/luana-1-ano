// Modo admin oculto: digitar "admin" em qualquer tela (sem feedback visual).
// Abre painel para upload de músicas e fotos direto na luana-api.

import { renderTextsTab, bindTextsTab } from './admin-texts.js';
import { MUSIC_DEFAULTS, POOL } from './music-config.js';
import { applyOverride, setOverride, resetOverride } from './content-overrides.js';

const SECRET = 'admin';
let buffer = '';
let adminAuthenticated = false;
let adminApiUrl = '';
let adminSecret = '';

// ===== slots de conteúdo =====

const MUSIC_SLOTS = [
  { key: 'gate',          label: 'Gate',                       file: 'gate.mp3' },
  { key: 'welcome',       label: 'Welcome',                    file: 'welcome.mp3' },
  { key: 'hanami',        label: 'Hanami',                     file: 'hanami.mp3' },
  { key: 'timeline-01',   label: 'Timeline (todas as fotos)',  file: 'timeline-01.mp3' },
  { key: 'loves',         label: 'Loves',                      file: 'loves.mp3' },
  { key: 'game',          label: 'Memory Game',                file: 'game.mp3' },
  { key: 'final',         label: 'Final',                      file: 'final.mp3' },
];

const PHOTO_SLOTS = [
  { key: 'timeline-01', label: 'Foto Jan/25',    file: 'timeline-01.jpg' },
  { key: 'timeline-02', label: 'Foto Fev/25',    file: 'timeline-02.jpg' },
  { key: 'timeline-03', label: 'Foto Mar/25',    file: 'timeline-03.jpg' },
  { key: 'timeline-04', label: 'Foto Abr/25',    file: 'timeline-04.jpg' },
  { key: 'timeline-05', label: 'Foto Mai/25',    file: 'timeline-05.jpg' },
  { key: 'timeline-06', label: 'Foto Jun/25',    file: 'timeline-06.jpg' },
  { key: 'timeline-07', label: 'Foto Jul/25',    file: 'timeline-07.jpg' },
  { key: 'timeline-08', label: 'Foto Ago/25',    file: 'timeline-08.jpg' },
  { key: 'timeline-09', label: 'Foto Set/25',    file: 'timeline-09.jpg' },
  { key: 'timeline-10', label: 'Foto Out/25',    file: 'timeline-10.jpg' },
  { key: 'timeline-11', label: 'Foto Nov/25',    file: 'timeline-11.jpg' },
  { key: 'timeline-12', label: 'Foto Dez/25',    file: 'timeline-12.jpg' },
  { key: 'timeline-13', label: 'Foto Jun/26 🏁', file: 'timeline-13.jpg' },
  { key: 'game-01',     label: 'Game Par 1',     file: 'game-01.jpg' },
  { key: 'game-02',     label: 'Game Par 2',     file: 'game-02.jpg' },
  { key: 'game-03',     label: 'Game Par 3',     file: 'game-03.jpg' },
  { key: 'game-04',     label: 'Game Par 4',     file: 'game-04.jpg' },
  { key: 'game-05',     label: 'Game Par 5',     file: 'game-05.jpg' },
  { key: 'game-06',     label: 'Game Par 6',     file: 'game-06.jpg' },
  { key: 'card-luana',  label: 'Carta: Luana',   file: 'card-luana.jpg' },
  { key: 'card-luana-2',label: 'Carta: Luana 2', file: 'card-luana-2.jpg' },
  { key: 'card-gata',   label: 'Carta: Gata',    file: 'card-gata.jpg' },
  { key: 'card-gato',   label: 'Carta: Gato',    file: 'card-gato.jpg' },
  { key: 'card-dog1',   label: 'Carta: Dog 1',   file: 'card-dog1.jpg' },
  { key: 'card-dog2',   label: 'Carta: Dog 2',   file: 'card-dog2.jpg' },
  { key: 'card-dog3',   label: 'Carta: Dog 3',   file: 'card-dog3.jpg' },
  { key: 'card-bruno',  label: 'Carta: Bruno',   file: 'card-bruno.jpg' },
];

// ===== gatilho secreto =====

export const initAdmin = () => {
  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
    buffer += e.key.toLowerCase();
    if (buffer.length > SECRET.length) buffer = buffer.slice(-SECRET.length);
    if (buffer === SECRET) {
      buffer = '';
      openAdminPanel();
    }
  });
};

// ===== painel =====

export const openAdminPanel = () => {
  if (document.getElementById('admin-panel')) return;

  const saved = sessionStorage.getItem('luana_admin');
  if (saved) {
    const parsed = JSON.parse(saved);
    adminApiUrl = parsed.apiUrl;
    adminSecret = parsed.secret;
    adminAuthenticated = true;
  }

  const panel = document.createElement('div');
  panel.id = 'admin-panel';
  panel.innerHTML = `
    <div class="admin-header">
      <span class="admin-title">⚙️ admin</span>
      <button class="admin-close" id="admin-close">✕</button>
    </div>
    <div class="admin-body" id="admin-body">
      ${adminAuthenticated ? renderTabs() : renderAuth()}
    </div>
  `;
  document.body.appendChild(panel);
  requestAnimationFrame(() => panel.classList.add('open'));

  document.getElementById('admin-close').addEventListener('click', closeAdminPanel);

  if (!adminAuthenticated) {
    document.getElementById('admin-auth-btn').addEventListener('click', handleAuth);
    document.getElementById('admin-secret-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleAuth();
    });
  } else {
    bindTabs();
  }
};

const closeAdminPanel = () => {
  const panel = document.getElementById('admin-panel');
  if (!panel) return;
  panel.classList.remove('open');
  setTimeout(() => panel.remove(), 300);
};

// ===== auth =====

const renderAuth = () => `
  <div class="admin-auth">
    <p class="admin-auth-title">modo admin</p>
    <input id="admin-api-input" class="admin-input" type="text"
      placeholder="API URL (ex: https://luana-api.render.com)"
      value="${adminApiUrl}" autocomplete="off" spellcheck="false" />
    <input id="admin-secret-input" class="admin-input" type="password"
      placeholder="Admin secret" autocomplete="off" />
    <button id="admin-auth-btn" class="admin-btn">Entrar →</button>
    <p class="admin-auth-error" id="admin-auth-error"></p>
  </div>
`;

const handleAuth = async () => {
  const url = document.getElementById('admin-api-input').value.trim().replace(/\/$/, '');
  const secret = document.getElementById('admin-secret-input').value.trim();
  const errEl = document.getElementById('admin-auth-error');
  const btn = document.getElementById('admin-auth-btn');

  if (!url || !secret) { errEl.textContent = 'preenche os dois campos'; return; }

  btn.textContent = 'verificando...';
  btn.disabled = true;

  try {
    const res = await fetch(`${url}/assets/ping`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    if (!res.ok) throw new Error('unauthorized');

    adminApiUrl = url;
    adminSecret = secret;
    adminAuthenticated = true;
    sessionStorage.setItem('luana_admin', JSON.stringify({ apiUrl: url, secret }));
    localStorage.setItem('luana_api_url', url);

    document.getElementById('admin-body').innerHTML = renderTabs();
    bindTabs();
  } catch {
    errEl.textContent = 'secret inválido ou API offline';
    btn.textContent = 'Entrar →';
    btn.disabled = false;
  }
};

// ===== tabs =====

let activeTab = 'music';

const renderTabs = () => `
  <div class="admin-generate">
    <button class="admin-btn admin-gen-btn" id="admin-gen-btn">🔗 Gerar link para a Luana</button>
    <input id="admin-gen-url" class="admin-input admin-gen-url" type="text" readonly placeholder="link vai aparecer aqui..." />
  </div>
  <div class="admin-tabs">
    <button class="admin-tab ${activeTab === 'music' ? 'active' : ''}" data-tab="music">🎵 Músicas</button>
    <button class="admin-tab ${activeTab === 'photo' ? 'active' : ''}" data-tab="photo">📷 Fotos</button>
    <button class="admin-tab ${activeTab === 'texts' ? 'active' : ''}" data-tab="texts">📝 Textos</button>
  </div>
  <div class="admin-slots" id="admin-slots">
    ${renderTabContent()}
  </div>
`;

const renderMusicTab = () => {
  const current = applyOverride('music', MUSIC_DEFAULTS);
  const options = POOL.map(t => `<option value="${t}">${t}</option>`).join('');
  const rows = MUSIC_SLOTS.map(slot => {
    const val = current[slot.key] ?? '';
    const opts = POOL.map(t =>
      `<option value="${t}"${t === val ? ' selected' : ''}>${t}</option>`
    ).join('');
    return `
      <div class="admin-music-row">
        <span class="admin-music-label">${slot.label}</span>
        <select class="admin-music-select" data-key="${slot.key}">${opts}</select>
      </div>`;
  }).join('');
  return `
    <div class="admin-music-selector">
      <div class="admin-music-actions">
        <button class="admin-btn admin-music-save" id="admin-music-save">💾 salvar seleção</button>
        <button class="admin-btn admin-music-reset" id="admin-music-reset">↺ resetar padrões</button>
      </div>
      <p class="admin-music-hint">Mudanças recarregam a página ao confirmar.</p>
      ${rows}
      <span class="admin-music-msg" id="admin-music-msg"></span>
    </div>
  `;
};

const renderTabContent = () => {
  if (activeTab === 'texts') return renderTextsTab();
  if (activeTab === 'music') return renderMusicTab();
  return renderSlots(PHOTO_SLOTS, 'img');
};

const bindGenerateLink = () => {
  const btn = document.getElementById('admin-gen-btn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    btn.textContent = 'gerando...';
    btn.disabled = true;
    try {
      const res = await fetch(`${adminApiUrl}/session`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminSecret}` },
      });
      if (!res.ok) throw new Error('erro');
      const { token } = await res.json();
      const url = `${location.origin}${location.pathname}?t=${token}`;
      const input = document.getElementById('admin-gen-url');
      input.value = url;
      input.select();
      navigator.clipboard?.writeText(url).catch(() => {});
      btn.textContent = '✅ copiado!';
    } catch {
      btn.textContent = '❌ erro ao gerar';
    }
    setTimeout(() => { btn.textContent = '🔗 Gerar link para a Luana'; btn.disabled = false; }, 2500);
  });
};

const bindTabs = () => {
  bindGenerateLink();
  document.querySelectorAll('.admin-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      activeTab = tab.dataset.tab;
      document.querySelectorAll('.admin-tab').forEach((t) => t.classList.toggle('active', t === tab));
      document.getElementById('admin-slots').innerHTML = renderTabContent();
      bindActiveTab();
    });
  });
  bindActiveTab();
};

const bindMusicTab = () => {
  const msgEl = document.getElementById('admin-music-msg');

  document.getElementById('admin-music-save')?.addEventListener('click', async () => {
    const selects = document.querySelectorAll('.admin-music-select');
    const newMap = {};
    selects.forEach(s => { newMap[s.dataset.key] = s.value; });
    msgEl.textContent = '⏳ salvando...';
    const result = await setOverride('music', newMap);
    msgEl.textContent = result.ok
      ? '✅ salvo. recarregando...'
      : `❌ erro: ${result.error} (salvo localmente apenas)`;
    if (result.ok) setTimeout(() => location.reload(), 1200);
  });

  document.getElementById('admin-music-reset')?.addEventListener('click', async () => {
    if (!confirm('Resetar todas as músicas para o padrão?')) return;
    msgEl.textContent = '⏳ resetando...';
    const result = await resetOverride('music');
    msgEl.textContent = result.ok ? '✅ resetado. recarregando...' : '❌ erro ao resetar';
    if (result.ok) setTimeout(() => location.reload(), 1200);
  });
};

const bindActiveTab = () => {
  if (activeTab === 'texts') {
    bindTextsTab();
  } else if (activeTab === 'music') {
    bindMusicTab();
  } else {
    bindSlotUploads('img');
  }
};

const renderSlots = (slots, type) => slots.map((slot) => `
  <div class="admin-slot" id="slot-${slot.key}">
    <div class="slot-info">
      <span class="slot-label">${slot.label}</span>
      <span class="slot-file">${slot.file}</span>
    </div>
    <label class="slot-upload-btn">
      Enviar
      <input type="file" class="slot-file-input"
        data-key="${slot.key}" data-type="${type}" data-file="${slot.file}"
        accept="${type === 'audio' ? 'audio/*' : 'image/*'}" hidden />
    </label>
    <span class="slot-status" id="status-${slot.key}"></span>
  </div>
`).join('');

const bindSlotUploads = (type) => {
  document.querySelectorAll('.slot-file-input').forEach((input) => {
    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const key = input.dataset.key;
      const targetName = input.dataset.file;
      const statusEl = document.getElementById(`status-${key}`);
      statusEl.textContent = '⏳';

      // renomeia o arquivo para o nome correto
      const renamedFile = new File([file], targetName, { type: file.type });
      const formData = new FormData();
      formData.append('file', renamedFile);

      try {
        const res = await fetch(`${adminApiUrl}/assets/upload?type=${type}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${adminSecret}` },
          body: formData,
        });
        if (!res.ok) throw new Error('upload falhou');
        statusEl.textContent = '✅';
      } catch {
        statusEl.textContent = '❌';
      }
    });
  });
};
