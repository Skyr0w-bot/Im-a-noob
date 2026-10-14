// Usage: node render.mjs <outDir> [fps] [start] [end] [step]
//   or:  node render.mjs --stills <outDir> t1 t2 ...
import { createRequire } from 'module';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
let pw; try { pw = require('playwright'); } catch { pw = require('/opt/node22/lib/node_modules/playwright'); }

const root = path.dirname(fileURLToPath(import.meta.url));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = http.createServer((req, res) => {
  const f = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); res.end(d); });
}).listen(0);
const port = server.address().port;

const args = process.argv.slice(2);
const stills = args[0] === '--stills';
const out = stills ? args[1] : args[0];
fs.mkdirSync(out, { recursive: true });

const browser = await pw.chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
page.on('console', m => { if (m.type() === 'error') console.error('PAGE:', m.text()); });
page.on('pageerror', e => console.error('PAGEERR:', e.message));
await page.goto(`http://localhost:${port}/index.html`);
await page.waitForFunction(() => window.READY === true, null, { timeout: 180000 });

const stage = await page.$('#stage');
async function shot(t, file) {
  await page.evaluate(t => window.renderAt(t), t);
  await stage.screenshot({ path: file, type: 'jpeg', quality: 93 });
}
if (stills) {
  for (const t of args.slice(2).map(Number)) { const s = Date.now(); await shot(t, path.join(out, `t${t.toFixed(2)}.jpg`)); console.log(t, Date.now() - s, 'ms'); }
} else {
  const fps = Number(args[1] || 30), start = Number(args[2] || 0), end = Number(args[3] || await page.evaluate(() => window.DURATION));
  const step = Number(args[4] || 1);
  const n0 = Math.round(start * fps), n1 = Math.round(end * fps);
  const t0 = Date.now();
  for (let n = n0; n < n1; n += step) {
    const f = path.join(out, `f${String(n).padStart(5, '0')}.jpg`);
    if (fs.existsSync(f)) continue;
    await shot(n / fps, f);
    if (n % 60 === 0) console.log(`frame ${n}/${n1}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
}
await browser.close(); server.close();
