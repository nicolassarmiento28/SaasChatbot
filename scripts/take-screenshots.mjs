import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const BASE = 'https://saaschatbotia.vercel.app';
const OUT = fileURLToPath(new URL('../docs/', import.meta.url));
mkdirSync(OUT, { recursive: true });

const shots = [
  { name: 'screenshot-landing.jpg', path: '/', theme: 'light' },
  { name: 'screenshot-landing-dark.jpg', path: '/', theme: 'dark' },
  { name: 'screenshot-login.jpg', path: '/login', theme: 'light' },
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

for (const shot of shots) {
  await page.goto(BASE + shot.path, { waitUntil: 'networkidle' });
  if (shot.theme === 'dark') {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.reload({ waitUntil: 'networkidle' });
  }
  await page.waitForTimeout(1000);
  await page.screenshot({ path: OUT + shot.name, quality: 90, type: 'jpeg' });
  console.log('saved', shot.name);
}

// Log in with the demo account to capture the dashboard.
await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
await page.getByText('Usar cuenta demo').click();
await page.waitForTimeout(1500);
await page.getByRole('button', { name: 'Entrar' }).click();
await page.waitForLoadState('networkidle');
await page.waitForTimeout(5000);
await page.screenshot({ path: OUT + 'screenshot-dashboard.jpg', quality: 90, type: 'jpeg' });
console.log('saved screenshot-dashboard.jpg');

await page.getByText('Mis bots').click();
await page.waitForLoadState('networkidle');
await page.waitForTimeout(3000);
await page.screenshot({ path: OUT + 'screenshot-bots.jpg', quality: 90, type: 'jpeg' });
console.log('saved screenshot-bots.jpg');

await browser.close();
