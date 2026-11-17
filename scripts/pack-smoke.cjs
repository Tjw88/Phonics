// Pack smoke test: for EVERY theme pack (read from the world picker), run the real setup (pick the world, hatch, the adaptive placement answered
// correctly), then in Free Play play each of the 8 games: ONE properly WON round (so the win, celebration, particles, vehicle, pot payoff and reaction code
// of that pack runs) followed by a few seconds of random taps and drags (toddler monkey) on the next round. Any page error or console error fails the run
// (exit 1). One line per pack. A pack with no custom props yet must still play (neutral fallbacks).
//
// Usage: node scripts/pack-smoke.cjs [url] [packId,packId...]      (needs Playwright; the url is a served build, default http://localhost:4173/)
// Env:   SMOKE_PAR=3 packs in parallel   SMOKE_MONKEY=3 seconds of random play per game   SMOKE_WIN_MS=30000 give-up time for one won round
const { chromium } = require('playwright');
const base = process.argv[2] || 'http://localhost:4173/';
const ONLY = (process.argv[3] || '').split(',').filter(Boolean);
const PAR = Number(process.env.SMOKE_PAR || 3);
const MONKEY_S = Number(process.env.SMOKE_MONKEY || 3);
const WIN_MS = Number(process.env.SMOKE_WIN_MS || 30000);
const GAMES = ['feed', 'robot', 'drum', 'safari', 'kitchen', 'bridge', 'rhyme', 'trace'];
const rnd = (n) => Math.floor(Math.random() * n);

async function passGate(page) {
  await page.waitForSelector('[data-testid=gate]');
  const q = await page.textContent('[data-testid=gate-q]');
  const [, a, b] = q.match(/(\d+) × (\d+)/);
  await page.click(`[data-testid=gate-option][data-n="${a * b}"]`);
}
const sceneId = (page) => page.getAttribute('#stage', 'data-scene');
const scenePast = (page, sid, ms = 9000) => page.waitForFunction((id) => document.querySelector('#stage')?.dataset.scene !== id, sid, { timeout: ms }).catch(() => {});
/** A real pointer drag from one element to another (what a finger does). */
async function dragBetween(page, fromSel, toSel, steps = 14) {
  const a = await page.locator(fromSel).first().boundingBox();
  const b = await page.locator(toSel).first().boundingBox();
  if (!a || !b) return;
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps });
  await page.mouse.up();
}

/** Win whatever single round is on screen (the e2e player's moves for each game); returns true once the scene has changed. */
async function winRound(page) {
  const sid0 = await sceneId(page);
  const end = Date.now() + WIN_MS;
  const has = (id) => page.locator(`[data-testid=${id}]`).first().isVisible().catch(() => false);
  while (Date.now() < end) {
    if ((await sceneId(page)) !== sid0) return true;
    const sid = sid0;
    if (await has('tiles') && await has('mouth')) { // feed
      await dragBetween(page, '[data-testid=tile][data-answer="1"]:not([disabled])', '[data-testid=mouth]').catch(() => {});
      await scenePast(page, sid);
    } else if (await has('chips')) { // robot
      await page.waitForTimeout(2500);
      await page.locator('[data-testid=pic][data-answer="1"]').first().click().catch(() => {});
      await scenePast(page, sid);
    } else if (await has('rhyme-target')) { // rhyme rocket
      await dragBetween(page, '[data-testid=pic][data-answer="1"]', '.rocket').catch(() => {});
      await scenePast(page, sid);
    } else if (await has('drum')) { // beat the drum: tap the right number of times, then done
      const n = Number(await page.getAttribute('[data-testid=drum]', 'data-n'));
      for (let i = 0; i < n; i++) { await page.click('[data-testid=drum]').catch(() => {}); await page.waitForTimeout(140); }
      await page.click('[data-testid=drum-done]').catch(() => {});
      await scenePast(page, sid);
    } else if (await has('safari-item')) { // safari: find every matching item
      const n = await page.locator('[data-testid=safari-item][data-answer="1"]').count();
      for (let i = 0; i < n; i++) { await page.locator('.safari-item[data-answer="1"]:not(.found)').first().click().catch(() => {}); await page.waitForTimeout(180); }
      await scenePast(page, sid);
    } else if (await has('kitchen')) { // word kitchen: each tile onto its slot
      const gs = (await page.getAttribute('[data-testid=kitchen]', 'data-graphemes')).split(',');
      for (let k = 0; k < gs.length; k++) { await dragBetween(page, `[data-testid=ktile][data-letter="${gs[k]}"]:not([disabled])`, `[data-testid=slot] >> nth=${k}`).catch(() => {}); await page.waitForTimeout(160); }
      await scenePast(page, sid);
    } else if (await has('trace-svg')) { // trace trail: follow the guide
      for (let k = 0; k < 9; k++) {
        const pts = await page.evaluate(() => {
          const g = document.querySelector('[data-testid=trace-guide]'); const svg = document.querySelector('[data-testid=trace-svg]');
          if (!g || !svg) return null; const m = svg.getScreenCTM(); const L = g.getTotalLength(); const out = [];
          for (let l = 0; l <= L; l += 3) { const p = g.getPointAtLength(l); const q = new DOMPoint(p.x, p.y).matrixTransform(m); out.push([q.x, q.y]); }
          return out;
        });
        if (!pts) break;
        await page.mouse.move(pts[0][0], pts[0][1]); await page.mouse.down();
        for (const [x, y] of pts) await page.mouse.move(x, y);
        await page.mouse.up(); await page.waitForTimeout(500);
        if ((await sceneId(page)) !== sid) break;
      }
      await scenePast(page, sid);
    } else if (await has('word')) { // bridge builder: tap each sound, then the right word
      const n = await page.locator('[data-testid=soundbutton]').count();
      for (let i = 0; i < n; i++) { await page.locator('[data-testid=soundbutton]').nth(i).click().catch(() => {}); await page.waitForTimeout(90); }
      await page.waitForSelector('[data-testid=wordchoice]', { timeout: 6000 }).catch(() => {});
      await page.locator('[data-testid=wordchoice][data-answer="1"]').click().catch(() => {});
      await scenePast(page, sid);
    } else await page.waitForTimeout(250);
  }
  return (await sceneId(page)) !== sid0;
}

/** Random taps and drags for a few seconds on whatever is on screen (nothing here can finish a round on purpose; it hunts for crashes). */
async function monkey(page, seconds) {
  const end = Date.now() + seconds * 1000;
  while (Date.now() < end) {
    const els = await page.locator('#stage button:visible, #stage .tile:visible, #stage .safari-item:visible, #stage .drum:visible, #stage .soundbutton:visible, #stage .kslot:visible').all();
    try {
      if (els.length > 1 && rnd(3) === 0) {
        const x = await els[rnd(els.length)].boundingBox(); const y = await els[rnd(els.length)].boundingBox();
        if (x && y) { await page.mouse.move(x.x + x.width / 2, x.y + x.height / 2); await page.mouse.down(); await page.mouse.move(y.x + y.width / 2, y.y + y.height / 2, { steps: 5 }); await page.mouse.up(); }
      } else if (els.length) await els[rnd(els.length)].click({ timeout: 700, force: true });
    } catch { /* an element vanished mid-action: normal */ }
    await page.waitForTimeout(150 + rnd(250));
  }
}

async function smokePack(browser, pack) {
  const errors = [];
  const notes = [];
  const ctx = await browser.newContext({ viewport: { width: 1180, height: 820 }, hasTouch: true });
  await ctx.addInitScript(() => { try { localStorage.setItem('soundling.tools', '1'); } catch { /* */ } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.stack ? e.stack.split('\n').slice(0, 3).join(' <- ') : e}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  let won = 0, played = 0, stage = 'setup';
  try {
    await page.goto(base + '?fpRounds=2');
    await passGate(page);
    await page.fill('[data-testid=nick]', 'Smoke'); await page.click('[data-testid=setup-next]');
    await page.click(`[data-testid=world][data-id=${pack}]`);
    await page.locator('[data-testid=egg]').nth(1).click();
    await page.click('[data-testid=hatch]'); stage = 'hatch';
    await page.waitForSelector('[data-testid=next]', { state: 'visible' }); await page.click('[data-testid=next]'); // hatched
    await page.click('[data-testid=next]'); // placement intro
    stage = 'placement'; // adaptive: answer every question correctly until the island appears
    for (let i = 0; i < 40; i++) {
      if (await page.locator('[data-testid=greeting]').count()) break;
      if (await page.locator('[data-testid=tile]').count()) { await page.locator('[data-testid=tile][data-answer="1"]').first().click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(650); }
      else await page.waitForTimeout(300);
    }
    await page.waitForSelector('[data-testid=greeting]', { timeout: 15000 });
    await page.waitForTimeout(500);
    // enough secure sounds that every game is on offer
    await page.evaluate(() => {
      const k = 'soundling.proto.v1'; const s = JSON.parse(localStorage.getItem(k));
      const day = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
      s.startSet = Math.max(s.startSet || 1, 2);
      for (const id of ['s', 'a', 't', 'p', 'i', 'n', 'm', 'd', 'g', 'o', 'c', 'k']) s.sounds[id] = { introducedOn: day(5), attempts: 6, correct: 6, correctDays: [day(3), day(2), day(1)], dayTally: {}, box: 3, due: day(-3), boxDay: null };
      localStorage.setItem(k, JSON.stringify(s));
    });
    await page.reload(); await page.waitForSelector('[data-testid=greeting]');
    for (const g of GAMES) {
      stage = `free play: ${g}`;
      await page.click('[data-testid=freeplay]');
      await page.waitForSelector('[data-testid=gamegrid]', { timeout: 15000 });
      if (!(await page.locator(`[data-testid=fp-${g}]`).count())) { notes.push(`${g} not offered`); await page.click('[data-testid=freeplay-back]'); await page.waitForSelector('[data-testid=greeting]'); continue; }
      await page.click(`[data-testid=fp-${g}]`); played++;
      await page.waitForTimeout(500);
      if (await winRound(page)) won++; else notes.push(`${g}: round not won in ${WIN_MS / 1000}s`);
      await page.waitForTimeout(600);
      if (!(await page.locator('[data-testid=gamegrid]').count())) await monkey(page, MONKEY_S); // round 2 of the pick: random play
      await page.click('[data-testid=freeplay-back]'); await page.waitForSelector('[data-testid=greeting]', { timeout: 15000 });
    }
    stage = 'done';
  } catch (e) {
    errors.push(`script (${stage}): ${String(e.message || e).split('\n')[0]}`);
  }
  await ctx.close();
  return { pack, errors, notes, won, played };
}

(async () => {
  const browser = await chromium.launch();
  const probe = await (await browser.newContext({ viewport: { width: 1180, height: 820 } })).newPage();
  await probe.goto(base);
  await passGate(probe);
  await probe.fill('[data-testid=nick]', 'S'); await probe.click('[data-testid=setup-next]');
  await probe.waitForSelector('[data-testid=world]');
  let packs = await probe.locator('[data-testid=world]').evaluateAll((els) => els.map((e) => e.dataset.id));
  await probe.close();
  if (ONLY.length) packs = packs.filter((p) => ONLY.includes(p));
  console.log(`packs: ${packs.join(', ')}`);
  const results = [];
  const queue = packs.slice();
  await Promise.all(Array.from({ length: Math.min(PAR, queue.length) }, async () => {
    while (queue.length) {
      const p = queue.shift();
      const r = await smokePack(browser, p);
      results.push(r);
      console.log(`${r.errors.length ? '✗' : '✓'} ${r.pack.padEnd(10)} played ${r.played}/${GAMES.length}, won ${r.won}/${r.played}${r.notes.length ? ' | ' + r.notes.join('; ') : ''}${r.errors.length ? '\n    ' + [...new Set(r.errors)].slice(0, 4).join('\n    ') : ''}`);
    }
  }));
  await browser.close();
  const bad = results.filter((r) => r.errors.length);
  console.log(bad.length ? `\n${bad.length} of ${results.length} pack(s) with errors: ${bad.map((r) => r.pack).join(', ')}` : `\nAll ${results.length} packs played without page or console errors`);
  process.exit(bad.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
