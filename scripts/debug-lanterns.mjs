import { chromium, devices } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['iPhone 13'], hasTouch: true });
const page = await ctx.newPage();
await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
const info = await page.evaluate(() => {
  const layer = document.querySelector('.lantern-layer');
  const lanterns = document.querySelectorAll('.lantern');
  return {
    layerExists: !!layer,
    layerStyle: layer ? { display: getComputedStyle(layer).display, zIndex: getComputedStyle(layer).zIndex, top: getComputedStyle(layer).top, height: layer.clientHeight, width: layer.clientWidth } : null,
    lanternCount: lanterns.length,
    firstLantern: lanterns[0] ? { bg: getComputedStyle(lanterns[0]).backgroundImage.slice(0, 100), w: lanterns[0].clientWidth, h: lanterns[0].clientHeight } : null,
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
