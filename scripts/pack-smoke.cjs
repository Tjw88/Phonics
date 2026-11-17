// Pack smoke test: for EVERY theme pack, play a short stretch of every game (random taps and drags, like a toddler) and fail on any page error.
// A pack with no custom props or reactions yet must still play (the games fall back to a neutral style). Usage: node scripts/pack-smoke.cjs [url]
const { chromium } = require('playwright');
const base = process.argv[2] || 'http://localhost:4173/';
const GAMES = ['feed', 'robot', 'drum', 'safari', 'kitchen', 'bridge', 'rhyme', 'trace'];
const SECONDS = Number(process.env.SMOKE_SECONDS || 6);
const rnd = (n) => Math.floor(Math.random() * n);
(async () => {
  const browser = await chromium.launch();
  const probe = await (await browser.newContext({ viewport: { width: 1180, height: 820 } })).newPage();
  await probe.goto(base);
  const packs = await (async () => {
    // read the pack ids from the world picker on the first setup screen
    const q = await probe.textContent('[data-testid=gate-q]'); const [, a, b] = q.match(/(\d+) × (\d+)/);
    await probe.click(`[data-testid=gate-option][data-n="${a * b}"]`);
    await probe.fill('[data-testid=nick]', 'S'); await probe.click('[data-testid=setup-next]');
    await probe.waitForSelector('[data-testid=world]');
    return probe.locator('[data-testid=world]').evaluateAll((els) => els.map((e) => e.dataset.id));
  })();
  await probe.close();
  let failures = 0;
  for (const pack of packs) {
    const errors = [];
    const ctx = await browser.newContext({ viewport: { width: 1180, height: 820 }, hasTouch: true });
    await ctx.addInitScript(() => { try { localStorage.setItem('soundling.tools', '1'); } catch { /* */ } });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(base + '?fpRounds=2');
    const q = await page.textContent('[data-testid=gate-q]'); const [, a, b] = q.match(/(\d+) × (\d+)/);
    await page.click(`[data-testid=gate-option][data-n="${a * b}"]`);
    await page.fill('[data-testid=nick]', 'Smoke'); await page.click('[data-testid=setup-next]');
    await page.click(`[data-testid=world][data-id=${pack}]`);
    await page.click('[data-testid=hatch]');
    await page.waitForSelector('[data-testid=next]'); await page.click('[data-testid=next]'); await page.click('[data-testid=next]');
    for (let i = 0; i < 12; i++) {
      const w = await Promise.race([page.waitForSelector('[data-testid=tile]').then(() => 'tile'), page.waitForSelector('[data-testid=greeting]').then(() => 'g')]);
      if (w === 'g') break; await page.locator('[data-testid=tile]').nth(rnd(2)).click(); await page.waitForTimeout(500);
    }
    await page.waitForSelector('[data-testid=greeting]');
    await page.evaluate(() => {
      const k = 'soundling.proto.v1'; const s = JSON.parse(localStorage.getItem(k));
      const day = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
      s.startSet = 2; s.adventureDays = []; for (const id of ['s', 'a', 't', 'p', 'i', 'n', 'm', 'd', 'g', 'o', 'c', 'k', 'sh', 'ch', 'ai', 'ee']) s.sounds[id] = { introducedOn: day(5), attempts: 6, correct: 6, correctDays: [day(3), day(2), day(1)], dayTally: {}, box: 3, due: day(0), boxDay: null };
      s.words = {}; localStorage.setItem(k, JSON.stringify(s));
    });
    await page.reload(); await page.waitForSelector('[data-testid=greeting]');
    await page.click('[data-testid=freeplay]');
    let played = 0;
    for (const g of GAMES) {
      await page.waitForSelector('[data-testid=gamegrid]', { timeout: 20000 }).catch(() => {});
      if (!(await page.locator(`[data-testid=fp-${g}]`).count())) continue;
      await page.click(`[data-testid=fp-${g}]`); played++;
      const end = Date.now() + SECONDS * 1000;
      while (Date.now() < end && !(await page.locator('[data-testid=gamegrid]').count())) {
        const els = await page.locator('#stage button:visible, #stage .tile:visible, #stage .safari-item:visible, #stage .drum:visible, #stage .soundbutton:visible, #stage .kslot:visible').all();
        try {
          if (els.length > 1 && rnd(3) === 0) { const x = await els[rnd(els.length)].boundingBox(); const y = await els[rnd(els.length)].boundingBox(); if (x && y) { await page.mouse.move(x.x + x.width / 2, x.y + x.height / 2); await page.mouse.down(); await page.mouse.move(y.x + y.width / 2, y.y + y.height / 2, { steps: 5 }); await page.mouse.up(); } }
          else if (els.length) await els[rnd(els.length)].click({ timeout: 700, force: true });
        } catch { /* element vanished mid-action */ }
        await page.waitForTimeout(150 + rnd(250));
      }
      for (let k = 0; k < 15 && !(await page.locator('[data-testid=gamegrid]').count()); k++) await page.waitForTimeout(600);
    }
    console.log(`${errors.length ? '✗' : '✓'} ${pack.padEnd(10)} played ${played}/${GAMES.length} games${errors.length ? ' PAGE ERRORS: ' + errors.slice(0, 2).join(' | ') : ''}`);
    if (errors.length) failures++;
    await ctx.close();
  }
  await browser.close();
  console.log(failures ? `\n${failures} pack(s) with page errors` : '\nAll packs played without page errors');
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
