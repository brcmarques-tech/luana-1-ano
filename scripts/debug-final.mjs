import { chromium, devices } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['iPhone 13'], hasTouch: true });
const page = await ctx.newPage();

await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });

// vai direto pra final
await page.evaluate(() => {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-final').classList.add('active');
});
await page.waitForTimeout(500);

const dims = await page.evaluate(() => {
  const html = document.documentElement;
  const body = document.body;
  const app = document.getElementById('app');
  const screen = document.getElementById('screen-final');
  return {
    viewport: { w: window.innerWidth, h: window.innerHeight },
    html: { w: html.clientWidth, h: html.clientHeight },
    body: { w: body.clientWidth, h: body.clientHeight },
    app: { w: app.clientWidth, h: app.clientHeight, pos: getComputedStyle(app).position, h_css: getComputedStyle(app).height },
    screen: { w: screen.clientWidth, h: screen.clientHeight, pos: getComputedStyle(screen).position },
  };
});

console.log(JSON.stringify(dims, null, 2));

await browser.close();
