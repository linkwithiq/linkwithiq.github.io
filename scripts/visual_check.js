// Visual regression check: screenshots every page at desktop and phone width and
// compares them with saved baselines in tests/visual/.
//   npm i playwright pngjs pixelmatch@5 && npx playwright install chromium
//   node scripts/visual_check.js           compare (creates baselines if none exist yet)
//   node scripts/visual_check.js --update  replace the baselines with the current look
// Baselines depend on the machine's font rendering, so create them on the machine that
// will compare them (for CI, take them from the workflow's "visual-baselines" artifact).
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');

const root = path.resolve(__dirname, '..');
const baseDir = path.join(root, 'tests', 'visual');
const diffDir = path.join(root, 'tests', 'visual-diff');
const update = process.argv.includes('--update');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split('?')[0]).replace(/^\/$/, '/index.html'));
  if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});

(async () => {
  await new Promise(r => server.listen(0, r));
  const base = `http://localhost:${server.address().port}`;
  const pages = fs.readdirSync(root).filter(f => f.endsWith('.html') && f !== '404.html').sort();
  fs.mkdirSync(baseDir, { recursive: true });
  fs.rmSync(diffDir, { recursive: true, force: true });
  const browser = await chromium.launch();
  let created = 0, failed = 0, checked = 0;
  for (const width of [1280, 390]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
    const page = await ctx.newPage();
    await page.route(u => !u.href.startsWith(base), r => r.abort()); // live GitHub data would make shots differ
    for (const f of pages) {
      await page.goto(`${base}/${f}`, { waitUntil: 'load' });
      await page.addStyleTag({ content: '.loading-screen{display:none!important} *{animation:none!important;transition:none!important} .back-to-top,.scroll-progress{display:none!important}' });
      await page.evaluate(() => document.fonts.ready);
      const name = `${f.replace('.html', '')}-${width}.png`;
      const shot = await page.screenshot({ fullPage: true });
      const basePath = path.join(baseDir, name);
      if (update || !fs.existsSync(basePath)) { fs.writeFileSync(basePath, shot); created++; continue; }
      checked++;
      const a = PNG.sync.read(fs.readFileSync(basePath)), b = PNG.sync.read(shot);
      if (a.width !== b.width || a.height !== b.height) {
        failed++; fs.mkdirSync(diffDir, { recursive: true }); fs.writeFileSync(path.join(diffDir, name), shot);
        console.log(`✗ ${name}: size changed ${a.width}x${a.height} -> ${b.width}x${b.height}`); continue;
      }
      const diff = new PNG({ width: a.width, height: a.height });
      const n = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1 });
      if (n / (a.width * a.height) > 0.002) {
        failed++; fs.mkdirSync(diffDir, { recursive: true }); fs.writeFileSync(path.join(diffDir, name), PNG.sync.write(diff));
        console.log(`✗ ${name}: ${n} pixels differ (see tests/visual-diff/${name})`);
      }
    }
    await ctx.close();
  }
  await browser.close(); server.close();
  if (created) console.log(`${update ? 'Updated' : 'Created'} ${created} baseline screenshot(s) in tests/visual/`);
  if (failed) { console.log(`\n${failed} page(s) look different from the baseline. If that's intended, run with --update.`); process.exit(1); }
  console.log(`Visual check passed (${checked} compared).`);
})();
