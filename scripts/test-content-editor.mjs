// Testa o editor de textos no painel admin (modo offline / localStorage).
// Cobre: abertura do painel, navegação até a tab Textos, edição,
// save, persistência em localStorage, recarregar e ver mudança, reset.

import { chromium, devices } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['iPhone 13'], hasTouch: true });
const page = await ctx.newPage();

const errors = [];
page.on('pageerror', (e) => errors.push(`💥 ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') {
    const t = m.text();
    if (!t.includes('localhost:3003') && !t.includes('ERR_CONNECTION')) {
      console.log('[console err]', t);
    }
  }
});

console.log('>>> 1. carregando site...');
await page.goto('http://localhost:8080?cn=complete', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// simula auth do admin (sem chamar API)
console.log('>>> 2. injetando admin auth no sessionStorage...');
await page.evaluate(() => {
  sessionStorage.setItem('luana_admin', JSON.stringify({
    apiUrl: 'http://localhost:3003',
    secret: 'test-secret',
  }));
});

console.log('>>> 3. abrindo painel admin via openAdminPanel()...');
// expõe a função via dynamic import e dispara
await page.evaluate(async () => {
  const mod = await import('./js/admin.js');
  mod.openAdminPanel();
});
await page.waitForTimeout(800);

const panelInfo = await page.evaluate(() => ({
  panelOpen: !!document.getElementById('admin-panel')?.classList.contains('open'),
  hasTextsTab: !!document.querySelector('[data-tab="texts"]'),
}));
console.log('   painel:', JSON.stringify(panelInfo));

console.log('>>> 4. clicando na tab "Textos"...');
await page.locator('[data-tab="texts"]').click({ force: true });
await page.waitForTimeout(400);

const sectionsInfo = await page.evaluate(() => ({
  sections: document.querySelectorAll('.admin-texts-section-btn').length,
  hasResetAll: !!document.getElementById('admin-texts-reset-all'),
}));
console.log('   sections:', JSON.stringify(sectionsInfo));

console.log('>>> 5. abrindo seção "💛 Tela final"...');
await page.locator('[data-schema="final"]').click({ force: true });
await page.waitForTimeout(600);

const editorOpen = await page.evaluate(() => ({
  editorVisible: !document.getElementById('admin-texts-editor')?.hidden,
  fields: document.querySelectorAll('.admin-texts-input').length,
  hasSaveBtn: !!document.getElementById('admin-texts-save'),
}));
console.log('   editor:', JSON.stringify(editorOpen));

console.log('>>> 6. editando o campo "signature"...');
const sigInput = page.locator('[data-path="signature"]');
await sigInput.fill('— TESTE PLAYWRIGHT');
await page.waitForTimeout(200);

console.log('>>> 7. clicando salvar...');
await page.locator('#admin-texts-save').click({ force: true });
await page.waitForTimeout(800);

const savedInfo = await page.evaluate(() => {
  const raw = localStorage.getItem('luana_content_overrides');
  const parsed = raw ? JSON.parse(raw) : null;
  return {
    hasOverride: !!parsed?.final,
    signature: parsed?.final?.signature,
    saveMsg: document.getElementById('admin-texts-saved')?.textContent?.slice(0, 60),
  };
});
console.log('   após salvar:', JSON.stringify(savedInfo));

console.log('>>> 8. recarregando página + verificando que override foi aplicado...');
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

const overrideApplied = await page.evaluate(async () => {
  // importa direto pra ver o que tá ativo
  const m = await import('./js/final-data.js?ts=' + Date.now());
  return { signature: m.FINAL.signature };
});
console.log('   FINAL.signature após reload:', JSON.stringify(overrideApplied));

console.log('>>> 9. resetando override...');
await page.evaluate(() => {
  sessionStorage.setItem('luana_admin', JSON.stringify({
    apiUrl: 'http://localhost:3003',
    secret: 'test-secret',
  }));
});
await page.evaluate(async () => {
  const mod = await import('./js/content-overrides.js?ts=' + Date.now());
  await mod.resetOverride('final');
});
await page.waitForTimeout(400);

const afterReset = await page.evaluate(() => {
  const raw = localStorage.getItem('luana_content_overrides');
  const parsed = raw ? JSON.parse(raw) : {};
  return { hasOverride: !!parsed.final };
});
console.log('   após reset:', JSON.stringify(afterReset));

console.log('>>> 10. recarregando + checando que voltou ao default...');
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const backToDefault = await page.evaluate(async () => {
  const m = await import('./js/final-data.js?ts=' + Date.now());
  return { signature: m.FINAL.signature };
});
console.log('   FINAL.signature default:', JSON.stringify(backToDefault));

console.log('\n=== ERROS JS ===');
console.log(errors.length ? errors.join('\n') : '(nenhum) ✅');
await browser.close();
