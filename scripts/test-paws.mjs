import { chromium, devices } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = 'scripts/screenshots/paws';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['iPhone 13'], hasTouch: true });
const page = await ctx.newPage();
await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

// click numa área vazia
await page.mouse.click(195, 550);
await page.waitForTimeout(450);
await page.screenshot({ path: `${OUT}/click-burst.png` });

// verificar cursor padrão
const info = await page.evaluate(() => {
  const layer = document.querySelector('.paw-trail-layer');
  const paws = document.querySelectorAll('.paw-burst');
  return {
    htmlClass: document.documentElement.className,
    bodyCursor: getComputedStyle(document.body).cursor,
    pawLayer: !!layer,
    pawCount: paws.length,
    firstPaw: paws[0] ? {
      text: paws[0].textContent,
      style: paws[0].style.cssText.slice(0, 200),
      opacity: getComputedStyle(paws[0]).opacity,
    } : null,
  };
});
console.log(JSON.stringify(info, null, 2));

await browser.close();
