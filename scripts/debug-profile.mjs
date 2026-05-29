import { chromium, devices } from 'playwright';
import { mkdirSync } from 'node:fs';
const OUT = 'scripts/screenshots/debug';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['iPhone 13'], hasTouch: true });
const page = await ctx.newPage();
await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

// força cardSeen = true + XP alto + ir pro final
await page.evaluate(() => {
  localStorage.setItem('luana_card_seen', '1');
  localStorage.setItem('luana_xp', '90');
});
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(800);

// abre o perfil clicando no avatar
await page.locator('#hud-avatar').click({ force: true });
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/profile-panel.png`, fullPage: true });

// dump do DOM do .pcard
const info = await page.evaluate(() => {
  const p = document.querySelector('.pcard');
  if (!p) return { found: false };
  const cs = getComputedStyle(p);
  return {
    found: true,
    bg: cs.background.slice(0, 100),
    color: cs.color,
    height: p.clientHeight,
    children: Array.from(p.children).map(c => ({
      cls: c.className,
      text: c.textContent.slice(0, 30),
      display: getComputedStyle(c).display,
      color: getComputedStyle(c).color,
      visibility: getComputedStyle(c).visibility,
    })),
  };
});
console.log(JSON.stringify(info, null, 2));

await browser.close();
