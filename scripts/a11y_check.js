// Accessibility test: loads every page in a real browser and runs axe-core
// against WCAG 2.0/2.1/2.2 A + AA rules. Fails if any violation is found.
//   npm i playwright axe-core && npx playwright install chromium && node scripts/a11y_check.js
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

const root = path.resolve(__dirname, '..');
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
  const pages = fs.readdirSync(root).filter(f => f.endsWith('.html')).sort();
  const browser = await chromium.launch();
  let total = 0;
  for (const width of [1280, 390]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    // outside requests (the live GitHub API) are blocked so results are repeatable
    await page.route(u => !u.href.startsWith(base), r => r.abort());
    for (const f of pages) {
      await page.goto(`${base}/${f}`, { waitUntil: 'load' });
      await page.addStyleTag({ content: '.loading-screen{display:none!important}body{overflow:auto!important}' });
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(axeSource);
      const result = await page.evaluate(() => axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } }));
      for (const v of result.violations) {
        total += v.nodes.length;
        console.log(`✗ ${f} @${width}px  ${v.id} (${v.impact}): ${v.help}`);
        v.nodes.slice(0, 3).forEach(n => console.log(`    ${n.target.join(' ')}`));
      }
    }
    await ctx.close();
  }
  await browser.close(); server.close();
  if (total) { console.log(`\n${total} accessibility violation(s) found.`); process.exit(1); }
  console.log(`All ${pages.length} pages passed axe (WCAG 2.x A/AA) at desktop and phone width.`);
})();
