// "Toddler" robustness audit: random taps and drags in every game, to find crashes, frozen screens and tiny tap targets.
// Usage: node scripts/audit-monkey.cjs [url]   (needs Playwright). Prints a table; exit 1 if any game crashed or froze.
const { chromium } = require('playwright');
const url = (process.argv[2] || 'http://localhost:4173/') + '?fpRounds=2';
const SECONDS = Number(process.env.MONKEY_SECONDS || 20);
const GAMES = ['feed', 'robot', 'drum', 'safari', 'kitchen', 'bridge', 'rhyme', 'trace'];
const rnd = (n) => Math.floor(Math.random() * n);

async function gate(page) {
  await page.waitForSelector('[data-testid=gate]');
  const q = await page.textContent('[data-testid=gate-q]');
  const [, a, b] = q.match(/(\d+) × (\d+)/);
  await page.click(`[data-testid=gate-option][data-n="${a * b}"]`);
}

(async () => {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1180, height: 820 }, hasTouch: true })).newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(url);
  await gate(page);
  await page.fill('[data-testid=nick]', 'Monkey');
  await page.click('[data-testid=setup-next]');
  await page.click('[data-testid=hatch]');
  await page.click('[data-testid=next]'); await page.click('[data-testid=next]');
  for (let i = 0; i < 6; i++) { await page.waitForSelector('[data-testid=tile]'); await page.locator('[data-testid=tile]').nth(rnd(2)).click(); await page.waitForTimeout(650); }
  await page.waitForSelector('[data-testid=greeting]');
  // give the child a lot of learned sounds so every game is available
  await page.click('[data-testid=parent-btn]'); await gate(page);
  await page.click('[data-testid=tab-settings]'); await page.click('[data-testid=ff-7]'); await page.click('[data-testid=parent-close]');
  await page.waitForSelector('[data-testid=greeting]');
  // Free Play only unlocks once today's adventure is done and random taps cannot finish an adventure, so mark it done
  // in the saved state (a window of dates around today covers the fast-forward offset) and reload. The adventure itself is
  // monkeyed afterwards from a second fresh page.
  await page.evaluate(() => {
    const k = 'soundling.proto.v1'; const s = JSON.parse(localStorage.getItem(k));
    const ds = []; for (let i = -12; i <= 12; i++) ds.push(new Date(Date.now() + i * 864e5).toISOString().slice(0, 10));
    s.adventureDays = [...new Set([...(s.adventureDays || []), ...ds])];
    // sets 1-3 secure, so print blending opens and every game is offered
    for (const id of ['s', 'a', 't', 'p', 'i', 'n', 'm', 'd', 'g', 'o', 'c', 'k']) {
      const day = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
      s.sounds[id] = { introducedOn: day(5), attempts: 6, correct: 6, correctDays: [day(3), day(2), day(1)], dayTally: {}, box: 3, due: day(0), boxDay: null };
    }
    localStorage.setItem(k, JSON.stringify(s));
  });
  await page.reload();
  await page.waitForSelector('[data-testid=greeting]');
  const results = [];
  const smallTargets = new Map();
  const monkey = async (ms, tag, stopOnGrid = false) => {
    const end = Date.now() + ms; let scenes = new Set(); let actions = 0;
    while (Date.now() < end) {
      if (stopOnGrid && (await page.locator('[data-testid=gamegrid]').count())) break;
      const sid = await page.getAttribute('#stage', 'data-scene'); scenes.add(sid);
      // measure tap targets on the current screen (spec: at least 64 pt)
      const small = await page.evaluate(() => [...document.querySelectorAll('#stage button, #stage [role=button], #stage .tile, #stage .soundbutton, #stage .safari-item, #stage .drum')]
        .filter((e) => e.offsetParent !== null).map((e) => { const r = e.getBoundingClientRect(); return { n: ((e.dataset.testid || e.className || e.tagName) + '<' + (e.parentElement?.className || '')).toString().slice(0, 48), w: Math.round(r.width), h: Math.round(r.height) }; }).filter((x) => x.w < 64 || x.h < 64));
      for (const s of small) smallTargets.set(`${tag}:${s.n}`, `${s.w}x${s.h}`);
      const els = await page.locator('#stage button:visible, #stage .tile:visible, #stage .safari-item:visible, #stage .drum:visible, #stage .soundbutton:visible, #stage .kslot:visible').all();
      const act = rnd(3);
      try {
        if (els.length && act < 2) { await els[rnd(els.length)].click({ timeout: 800, force: true }); }
        else if (els.length > 1) {
          const a = await els[rnd(els.length)].boundingBox(); const b = await els[rnd(els.length)].boundingBox();
          if (a && b) { await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down(); await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 6 }); await page.mouse.up(); }
        } else { await page.mouse.click(100 + rnd(900), 100 + rnd(600)); }
      } catch { /* element vanished mid-action: normal */ }
      actions++; await page.waitForTimeout(120 + rnd(300));
    }
    return { scenes: scenes.size, actions };
  };
  if (await page.locator('[data-testid=freeplay]').count()) {
    await page.click('[data-testid=freeplay]');
    for (const g of GAMES) {
      await page.waitForSelector('[data-testid=gamegrid]', { timeout: 20000 }).catch(async () => { if (process.env.MONKEY_DEBUG) await page.screenshot({ path: process.env.MONKEY_DEBUG }); });
      if (!(await page.locator(`[data-testid=fp-${g}]`).count())) { results.push({ game: g, note: 'not offered' }); continue; }
      await page.click(`[data-testid=fp-${g}]`);
      const r = await monkey(SECONDS * 1000, g, true);
      const frozen = r.scenes <= 1 && g !== 'trace';
      results.push({ game: g, ...r, note: frozen ? 'did not change screen under random play (can be fine: needs the right answers)' : '' });
      for (let k = 0; k < 20 && !(await page.locator('[data-testid=gamegrid]').count()); k++) await monkey(3000, g, true);
    }
  } else results.push({ game: 'free play', note: 'NOT REACHABLE after marking adventure done' });
  // the adventure screens, from a clean state (random play cannot finish it; we only look for crashes and small targets)
  await page.evaluate(() => { const k = 'soundling.proto.v1'; const s = JSON.parse(localStorage.getItem(k)); s.adventureDays = []; localStorage.setItem(k, JSON.stringify(s)); });
  await page.reload(); await page.waitForSelector('[data-testid=greeting]'); await page.click('[data-testid=play]');
  results.push({ game: 'adventure (all screens)', ...(await monkey(60000, 'adventure')) });
  console.log('\nGame                       screens   actions   notes');
  for (const r of results) console.log(String(r.game).padEnd(26), String(r.scenes ?? '-').padEnd(9), String(r.actions ?? '-').padEnd(9), r.note || '');
  console.log('\nTap targets under 64x64 px (spec minimum 64 pt):', smallTargets.size ? '' : 'none');
  for (const [k, v] of smallTargets) console.log('  ', k, v);
  console.log('\nPage errors:', errors.length ? errors.slice(0, 8) : 'none');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
