import { chromium, devices } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['iPhone 13'], hasTouch: true });
const page = await ctx.newPage();
await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
const info = await page.evaluate(() => {
  const screen = document.getElementById('screen-gate');
  const content = document.querySelector('.gate-content');
  const sc = getComputedStyle(screen);
  const cc = getComputedStyle(content);
  return {
    screen: {
      h: screen.clientHeight,
      w: screen.clientWidth,
      display: sc.display,
      flexDir: sc.flexDirection,
      alignItems: sc.alignItems,
      justifyContent: sc.justifyContent,
      padding: sc.padding,
      pos: sc.position,
    },
    content: {
      h: content.clientHeight,
      w: content.clientWidth,
      rect: { top: content.getBoundingClientRect().top, height: content.getBoundingClientRect().height },
    },
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
