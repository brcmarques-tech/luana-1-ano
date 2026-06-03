// Editor de textos no painel admin.
// Renderiza forms baseado em schemas. Salva via setOverride() em content-overrides.js.
// Preserva CSS - só sobrescreve as strings/valores.

import {
  applyOverride, getOverride, setOverride, resetOverride, resetAllOverrides,
} from './content-overrides.js';

// schemas dos arquivos editáveis
const SCHEMAS = [
  {
    key: 'final',
    label: '💛 Tela final',
    defaultRef: () => import('./final-data.js').then(m => m.FINAL),
    layout: (val) => [
      { type: 'text',     path: 'date',             label: 'Data exibida' },
      { type: 'text',     path: 'badge',            label: 'Badge (1 ano)' },
      { type: 'textarea', path: 'epigraph.text',    label: 'Epígrafe — texto', rows: 2 },
      { type: 'text',     path: 'epigraph.author',  label: 'Epígrafe — autor' },
      { type: 'list-textarea', path: 'paragraphs',  label: 'Parágrafos (1 por linha)', rows: 2 },
      { type: 'text',     path: 'signature',        label: 'Assinatura' },
      { type: 'text',     path: 'restartLabel',     label: 'Botão restart' },
    ],
  },
  {
    key: 'loves',
    label: '💌 Coisas que ama nela',
    defaultRef: () => import('./loves-data.js').then(m => m.LOVES),
    isArray: true,
    layout: (val) => val.map((_, i) => ({
      type: 'group',
      label: `Item ${i + 1}`,
      fields: [
        { type: 'text',     path: `${i}.emoji`, label: 'Emoji' },
        { type: 'text',     path: `${i}.text`,  label: 'Frase principal' },
        { type: 'textarea', path: `${i}.sub`,   label: 'Sub (segunda linha)', rows: 2 },
      ],
    })),
  },
  {
    key: 'puzzle',
    label: '🧩 Sliding puzzle',
    defaultRef: () => import('./puzzle-data.js').then(m => m.PUZZLE),
    layout: () => [
      { type: 'text',     path: 'title',   label: 'Título da tela' },
      { type: 'text',     path: 'sub',     label: 'Subtítulo' },
      { type: 'text',     path: 'caption', label: 'Caption ao completar' },
    ],
  },
  {
    key: 'timeline',
    label: '📅 Timeline (13 meses)',
    defaultRef: () => import('./timeline-data.js').then(m => m.TIMELINE),
    isArray: true,
    layout: (val) => val.map((card, i) => ({
      type: 'group',
      label: card.date || `Card ${i + 1}`,
      fields: [
        { type: 'text',     path: `${i}.date`,    label: 'Data' },
        { type: 'text',     path: `${i}.caption`, label: 'Caption (mensagem do mês)' },
        ...(card.isFinal
          ? [{ type: 'text', path: `${i}.finalText`, label: 'Texto do card final' }]
          : []),
        ...(Array.isArray(card.quotes)
          ? card.quotes.flatMap((_, qi) => [
              { type: 'textarea', path: `${i}.quotes.${qi}.text`,   label: `Quote ${qi + 1}`, rows: 2 },
              { type: 'text',     path: `${i}.quotes.${qi}.source`, label: `Quote ${qi + 1} — fonte` },
            ])
          : []),
      ],
    })),
  },
  {
    key: 'questions',
    label: '🌌 Constelação — 7 perguntas',
    defaultRef: () => import('./constellation/data.js').then(m => m.QUESTIONS),
    isArray: true,
    layout: (val) => val.map((q, i) => ({
      type: 'group',
      label: `Dia ${q.day} · ${q.title}`,
      fields: [
        { type: 'text',     path: `${i}.title`,         label: 'Tema (eyebrow)' },
        { type: 'textarea', path: `${i}.quote.text`,    label: 'Quote literário', rows: 2 },
        { type: 'text',     path: `${i}.quote.author`,  label: 'Autor da quote' },
        { type: 'textarea', path: `${i}.text`,          label: 'Pergunta', rows: 2 },
        ...(q.options
          ? q.options.map((_, oi) => ({
              type: 'text', path: `${i}.options.${oi}.label`, label: `Opção ${oi + 1}`,
            }))
          : []),
        ...(q.placeholder !== undefined
          ? [{ type: 'text', path: `${i}.placeholder`, label: 'Placeholder' }]
          : []),
      ],
    })),
  },
  {
    key: 'reveal',
    label: '📍 Coordenadas do reveal',
    defaultRef: () => import('./constellation/data.js').then(m => m.REVEAL),
    layout: () => [
      { type: 'text',   path: 'dms',  label: 'DMS (exibida pra ela)' },
      { type: 'number', path: 'lat',  label: 'Latitude decimal' },
      { type: 'number', path: 'lon',  label: 'Longitude decimal' },
      { type: 'text',   path: 'date', label: 'Data do encontro' },
    ],
  },
  {
    key: 'card',
    label: '🎴 Carta Luana (principal)',
    defaultRef: () => import('./card-data.js').then(m => m.CARD),
    layout: () => [
      { type: 'text', path: 'name',   label: 'Nome' },
      { type: 'text', path: 'title',  label: 'Título' },
      { type: 'text', path: 'type',   label: 'Tipo (subtítulo)' },
      { type: 'text', path: 'rarity', label: 'Raridade (estrelas)' },
      { type: 'text', path: 'flavor', label: 'Flavor (citação)' },
    ],
  },
];

// ===== utils path =====

const getByPath = (obj, path) => path.split('.').reduce((o, k) => o?.[k], obj);
const setByPath = (obj, path, val) => {
  const keys = path.split('.');
  const last = keys.pop();
  let cur = obj;
  for (const k of keys) {
    if (cur[k] === undefined || cur[k] === null) cur[k] = /^\d+$/.test(keys[keys.indexOf(k) + 1] || '') ? [] : {};
    cur = cur[k];
  }
  cur[last] = val;
};
const cloneDeep = (v) => JSON.parse(JSON.stringify(v));

// estado: schema atualmente aberto + working copy
let _openSchema = null;
let _workingCopy = null;
let _defaults = null;

// ===== render =====

export const renderTextsTab = () => `
  <div class="admin-texts">
    <p class="admin-texts-help">
      escolha uma seção pra editar. salva no banco — vale pra todos os links.
    </p>
    <div class="admin-texts-sections">
      ${SCHEMAS.map((s) => `
        <button class="admin-texts-section-btn" data-schema="${s.key}">
          <span>${s.label}</span>
          <span class="admin-texts-section-arrow">→</span>
        </button>
      `).join('')}
    </div>
    <button class="admin-texts-reset-all" id="admin-texts-reset-all">
      ↺ resetar tudo pro padrão
    </button>
  </div>
  <div class="admin-texts-editor" id="admin-texts-editor" hidden></div>
`;

export const bindTextsTab = () => {
  document.querySelectorAll('.admin-texts-section-btn').forEach((btn) => {
    btn.addEventListener('click', () => openSchemaEditor(btn.dataset.schema));
  });
  document.getElementById('admin-texts-reset-all')?.addEventListener('click', async () => {
    if (!confirm('Resetar TODOS os textos editados pro padrão? Não dá pra desfazer.')) return;
    const result = await resetAllOverrides();
    if (result.ok) {
      alert('Tudo resetado. Recarregue a página pra ver.');
    } else {
      alert(`Erro: ${result.error || 'falha ao resetar'}`);
    }
  });
};

const openSchemaEditor = async (key) => {
  const schema = SCHEMAS.find((s) => s.key === key);
  if (!schema) return;
  _openSchema = schema;

  const def = await schema.defaultRef();
  _defaults = cloneDeep(def);

  // working copy começa do default (já mergeado se houver override)
  _workingCopy = cloneDeep(def);

  const editor = document.getElementById('admin-texts-editor');
  editor.hidden = false;
  editor.innerHTML = renderEditor(schema, _workingCopy);
  bindEditor(schema);

  // scroll pra editor
  editor.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const renderEditor = (schema, val) => {
  const layout = schema.layout(val);
  return `
    <div class="admin-texts-editor-header">
      <button class="admin-texts-back" id="admin-texts-back">← voltar</button>
      <h3 class="admin-texts-title">${schema.label}</h3>
    </div>
    <div class="admin-texts-fields">
      ${layout.map((f) => renderField(f, val)).join('')}
    </div>
    <div class="admin-texts-actions">
      <button class="admin-texts-reset" id="admin-texts-reset" type="button">↺ resetar essa seção</button>
      <button class="admin-texts-save" id="admin-texts-save" type="button">💾 salvar</button>
    </div>
    <p class="admin-texts-saved" id="admin-texts-saved" hidden>✅ salvo. recarregue a página pra ver no site.</p>
  `;
};

const renderField = (field, val) => {
  if (field.type === 'group') {
    return `
      <fieldset class="admin-texts-group">
        <legend>${field.label}</legend>
        ${field.fields.map((f) => renderField(f, val)).join('')}
      </fieldset>
    `;
  }

  if (field.type === 'list-textarea') {
    const arr = getByPath(val, field.path) || [];
    return `
      <div class="admin-texts-field">
        <label>${field.label}</label>
        <textarea
          data-path="${field.path}"
          data-list="1"
          rows="${field.rows || 5}"
          class="admin-texts-input">${arr.join('\n')}</textarea>
      </div>
    `;
  }

  const v = getByPath(val, field.path) ?? '';
  if (field.type === 'textarea') {
    return `
      <div class="admin-texts-field">
        <label>${field.label}</label>
        <textarea
          data-path="${field.path}"
          rows="${field.rows || 3}"
          class="admin-texts-input">${escapeHTML(String(v))}</textarea>
      </div>
    `;
  }

  const inputType = field.type === 'number' ? 'number' : 'text';
  const step = field.type === 'number' ? 'step="0.00001"' : '';
  return `
    <div class="admin-texts-field">
      <label>${field.label}</label>
      <input
        type="${inputType}" ${step}
        data-path="${field.path}"
        class="admin-texts-input"
        value="${escapeHTML(String(v))}" />
    </div>
  `;
};

const escapeHTML = (s) => s
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const bindEditor = (schema) => {
  document.getElementById('admin-texts-back').addEventListener('click', () => {
    document.getElementById('admin-texts-editor').hidden = true;
    _openSchema = null;
    _workingCopy = null;
  });

  // commit no working copy em cada input
  document.querySelectorAll('.admin-texts-input').forEach((el) => {
    el.addEventListener('input', () => {
      const path = el.dataset.path;
      const isList = el.dataset.list === '1';
      let v = el.value;
      if (isList) v = v.split('\n').filter((l) => l.trim().length > 0);
      else if (el.type === 'number') v = parseFloat(v);
      setByPath(_workingCopy, path, v);
    });
  });

  document.getElementById('admin-texts-save').addEventListener('click', async () => {
    const btn = document.getElementById('admin-texts-save');
    btn.disabled = true;
    btn.textContent = 'salvando...';
    const result = await setOverride(schema.key, _workingCopy);
    btn.disabled = false;
    btn.textContent = '💾 salvar';
    const tip = document.getElementById('admin-texts-saved');
    if (result.ok) {
      tip.textContent = '✅ salvo no banco. recarregue a página pra ver no site.';
      tip.hidden = false;
    } else {
      tip.textContent = `❌ erro: ${result.error || 'falha'} (salvo localmente apenas)`;
      tip.hidden = false;
    }
    setTimeout(() => { tip.hidden = true; }, 5000);
  });

  document.getElementById('admin-texts-reset').addEventListener('click', async () => {
    if (!confirm(`Resetar "${schema.label}" pro padrão?`)) return;
    await resetOverride(schema.key);
    openSchemaEditor(schema.key);
  });
};
