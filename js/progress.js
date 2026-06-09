import { API_URL } from './config.js';

export const NEXT_ANNIVERSARY = new Date('2027-06-17T00:00:00-03:00').getTime();

const TOKEN_KEY = 'luana_token';
const LS_XP     = 'luana_xp';
const LS_ACH    = 'luana_achievements';
const LS_FIRST  = 'luana_first_access';
const ACCESS_MS = 7 * 24 * 60 * 60 * 1000;

let _token         = null;
let _apiOk         = false;
let _xp            = 0;
let _achievements  = new Set();
let _daysRemaining = null;

// ===== token =====

const resolveToken = () => {
  const urlToken = new URLSearchParams(location.search).get('t');
  if (urlToken) { localStorage.setItem(TOKEN_KEY, urlToken); return urlToken; }
  return localStorage.getItem(TOKEN_KEY);
};

export const getToken = () => _token;

export const getSessionInfo = () => ({ daysRemaining: _daysRemaining, apiOk: _apiOk });

// ===== helpers localStorage =====

const lsXP = () => Math.min(100, Math.max(0, Number(localStorage.getItem(LS_XP)) || 0));

const lsAchievements = () => {
  try {
    const raw = localStorage.getItem(LS_ACH);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
};

const lsAccess = () => {
  const ts = localStorage.getItem(LS_FIRST);
  if (!ts) { localStorage.setItem(LS_FIRST, String(Date.now())); return true; }
  return Date.now() - Number(ts) < ACCESS_MS;
};

// ===== init (async) =====

export const initSession = async () => {
  _token = resolveToken();

  // modo dev local: ?dev=1 bypassa a verificação de acesso
  if (new URLSearchParams(location.search).get('dev') === '1') {
    _xp = lsXP();
    _achievements.clear();
    lsAchievements().forEach(id => _achievements.add(id));
    return { hasAccess: true, nextUnlock: null };
  }

  // modo offline: API não configurada ou sem token
  if (!API_URL || !_token) {
    _xp = lsXP();
    _achievements.clear();
    lsAchievements().forEach(id => _achievements.add(id));
    const hasAccess = lsAccess();
    return { hasAccess, nextUnlock: hasAccess ? null : NEXT_ANNIVERSARY };
  }

  try {
    const res = await fetch(`${API_URL}/session/${_token}`);
    if (!res.ok) throw new Error('session not found');
    const data = await res.json();

    _apiOk = true;
    _xp    = data.xp ?? 0;
    // merge: conquistas locais + da API — muta o Set existente (não cria novo)
    // pois achievements.js já guarda referência ao mesmo objeto
    _achievements.clear();
    [...lsAchievements(), ...(data.achievements ?? [])].forEach(id => _achievements.add(id));
    _daysRemaining = data.daysRemaining ?? null;

    // merge eggs/pets/card da API com localStorage
    if (data.eggsFound?.length) {
      const local = new Set(JSON.parse(localStorage.getItem('luana_eggs_found') || '[]'));
      const merged = [...new Set([...local, ...data.eggsFound])];
      try { localStorage.setItem('luana_eggs_found', JSON.stringify(merged)); } catch {}
    }
    if (data.petsKilled?.length) {
      const local = new Set(JSON.parse(localStorage.getItem('luana_killed_pets') || '[]'));
      const merged = [...new Set([...local, ...data.petsKilled])];
      try { localStorage.setItem('luana_killed_pets', JSON.stringify(merged)); } catch {}
    }
    if (data.cardSeen) {
      try { localStorage.setItem('luana_card_seen', '1'); } catch {}
    }

    // cache local para quando a API estiver offline
    try { localStorage.setItem(LS_XP, String(_xp)); } catch {}
    try { localStorage.setItem(LS_ACH, JSON.stringify([..._achievements])); } catch {}

    // ancora o primeiro acesso para o fallback offline saber o prazo correto
    if (!localStorage.getItem(LS_FIRST)) {
      const firstAccess = data.nextUnlock
        ? data.nextUnlock - ACCESS_MS
        : Date.now();
      try { localStorage.setItem(LS_FIRST, String(firstAccess)); } catch {}
    }

    return { hasAccess: data.hasAccess, nextUnlock: data.nextUnlock ?? null };
  } catch {
    // API offline → fallback localStorage
    _xp = lsXP();
    _achievements.clear();
    lsAchievements().forEach(id => _achievements.add(id));
    const hasAccess = lsAccess();
    return { hasAccess, nextUnlock: hasAccess ? null : NEXT_ANNIVERSARY };
  }
};

// ===== XP =====

export const loadXP = () => _xp;

export const saveXP = (xp) => {
  _xp = xp;
  try { localStorage.setItem(LS_XP, String(xp)); } catch {}
  if (_apiOk && _token) {
    fetch(`${API_URL}/session/${_token}/progress`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ xp }),
    }).catch(() => {});
  }
};

export const saveLevel = (level) => {
  if (_apiOk && _token) {
    fetch(`${API_URL}/session/${_token}/progress`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level }),
    }).catch(() => {});
  }
};

// ===== achievements =====

export const loadAchievements = () => _achievements;

export const saveAchievements = (ids) => {
  _achievements = ids;
  try { localStorage.setItem(LS_ACH, JSON.stringify([...ids])); } catch {}
  if (_apiOk && _token) {
    fetch(`${API_URL}/session/${_token}/progress`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ achievements: [...ids] }),
    }).catch(() => {});
  }
};
