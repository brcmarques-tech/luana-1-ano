// Sistema de overrides de conteúdo.
// FONTE DE VERDADE: backend (luana-api) — persiste em DB.
// localStorage = cache offline pra não bloquear render no boot.

import { API_URL } from './config.js';

const LS_KEY = 'luana_content_overrides';

// cache em memória (lido sincronamente por applyOverride)
let _cache = {};

const lsLoad = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};

const lsSave = (data) => {
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch {}
};

// inicializa do localStorage ANTES de qualquer applyOverride
_cache = lsLoad();

// merge profundo (arrays substituem, objetos mesclam)
const deepMerge = (def, ovr) => {
  if (Array.isArray(def)) return Array.isArray(ovr) ? ovr : def;
  if (def && typeof def === 'object') {
    if (!ovr || typeof ovr !== 'object') return def;
    const out = { ...def };
    for (const k of Object.keys(ovr)) out[k] = deepMerge(def[k], ovr[k]);
    return out;
  }
  return ovr !== undefined ? ovr : def;
};

export const applyOverride = (key, defaultValue) => {
  if (!(key in _cache)) return defaultValue;
  return deepMerge(defaultValue, _cache[key]);
};

export const getOverride = (key) => (key in _cache ? _cache[key] : null);

// ========== sync com a API ==========

// sincroniza overrides do backend → cache + localStorage.
// se algo mudou em relação ao cache local, recarrega a página
// (mais simples que re-renderizar cada tela)
const RELOAD_SENTINEL = '_content_reloaded';

export const syncFromAPI = async () => {
  if (!API_URL) return;
  try {
    const res = await fetch(`${API_URL}/content`);
    if (!res.ok) return;
    const data = await res.json();
    const before = JSON.stringify(_cache);
    const after = JSON.stringify(data);
    if (before === after) return;

    _cache = data;
    lsSave(data);

    // se houve mudança e ainda não recarregamos nessa visita,
    // recarrega pra os data files re-importarem com cache fresco.
    if (!sessionStorage.getItem(RELOAD_SENTINEL)) {
      sessionStorage.setItem(RELOAD_SENTINEL, '1');
      location.reload();
    }
  } catch { /* offline = usa cache localStorage */ }
};

// ========== mutações (admin) ==========

const getAdminAuth = () => {
  try {
    const raw = sessionStorage.getItem('luana_admin');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

export const setOverride = async (key, value) => {
  // otimista: atualiza local primeiro
  _cache[key] = value;
  lsSave(_cache);

  // PUT pra API
  const auth = getAdminAuth();
  if (!auth || !API_URL) {
    return { ok: false, error: 'admin não autenticado ou API indisponível' };
  }
  try {
    const res = await fetch(`${auth.apiUrl}/content/${encodeURIComponent(key)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.secret}`,
      },
      body: JSON.stringify({ value }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
};

export const resetOverride = async (key) => {
  delete _cache[key];
  lsSave(_cache);

  const auth = getAdminAuth();
  if (!auth || !API_URL) return { ok: false };
  try {
    const res = await fetch(`${auth.apiUrl}/content/${encodeURIComponent(key)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${auth.secret}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
};

export const resetAllOverrides = async () => {
  _cache = {};
  lsSave({});

  const auth = getAdminAuth();
  if (!auth || !API_URL) return { ok: false };
  try {
    const res = await fetch(`${auth.apiUrl}/content`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${auth.secret}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
};

export const listOverriddenKeys = () => Object.keys(_cache);
