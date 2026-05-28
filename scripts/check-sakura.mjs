import { chromium, devices } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['iPhone 13'], hasTouch: true });
const page = await ctx.newPage();
await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
const info = await page.evaluate(() => {
  const layer = document.querySelector('.sakura-layer');
  const petals = document.querySelectorAll('.sakura-petal');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return {
    layerExists: !!layer,
    petalCount: petals.length,
    reducedMotion: reduced,
    firstPetal: petals[0] ? {
      bg: getComputedStyle(petals[0]).backgroundImage.slice(0, 80),
      w: petals[0].clientWidth,
      opacity: getComputedStyle(petals[0]).opacity,
      anim: getComputedStyle(petals[0]).animationName,
    } : null,
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
