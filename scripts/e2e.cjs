// End-to-end smoke test against a running preview server. Usage: node scripts/e2e.cjs [url] [screenshotDir]
// Needs Playwright (globally available in the Claude Code cloud image).
const { chromium } = require('playwright');
const url = process.argv[2] || 'http://localhost:4173/';
const shots = process.argv[3] || '/tmp';
const log = (...a) => console.log(...a);
let failures = 0;
const check = (cond, msg) => { if (cond) log('  ✓', msg); else { failures++; log('  ✗', msg); } };

async function passGate(page) {
  await page.waitForSelector('[data-testid=gate]');
  const q = await page.textContent('[data-testid=gate-q]');
  const [, a, b] = q.match(/(\d+) × (\d+)/);
  await page.click(`[data-testid=gate-option][data-n="${a * b}"]`);
}

/** Play whatever is on screen until the island is asleep. `wrongFirst` makes one deliberate first-try mistake. */
async function playAdventure(page, { wrongFirst = false, shot } = {}) {
  let madeMistake = !wrongFirst, steps = 0, sawBridge = false, sawRobot = false, sawFeed = false, sawRhyme = false;
  const seen = new Set();
  await page.click('[data-testid=play]');
  while (steps++ < 200) {
    await page.waitForTimeout(120);
    const done = await page.locator('[data-testid=greeting]').count();
    if (done) break;
    const has = (id) => page.locator(`[data-testid=${id}]`).first().isVisible().catch(() => false);
    if (await has('gate')) throw new Error('unexpected gate');
    if (await has('tiles') && await has('mouth')) {
      sawFeed = true;
      if (shot && !seen.has('feed')) { seen.add('feed'); await page.waitForTimeout(500); await page.screenshot({ path: `${shots}/${shot}-feed.png` }); }
      if (!madeMistake && (await page.locator('[data-testid=tile][data-answer="0"]').count())) {
        await page.locator('[data-testid=tile][data-answer="0"]').first().click();
        madeMistake = true;
        await page.waitForTimeout(900);
      }
      await page.locator('[data-testid=tile][data-answer="1"]:not([disabled])').first().click().catch(() => {});
      await page.waitForTimeout(900);
    } else if (await has('chips')) {
      sawRobot = true;
      if (shot && !seen.has('robot')) { seen.add('robot'); await page.screenshot({ path: `${shots}/${shot}-robot.png` }); }
      await page.waitForTimeout(2500); // let the robot finish
      await page.locator('[data-testid=pic][data-answer="1"]').first().click().catch(() => {});
      await page.waitForTimeout(1300);
    } else if (await has('rhyme-target')) {
      sawRhyme = true;
      await page.locator('[data-testid=pic][data-answer="1"]').first().click().catch(() => {});
      await page.waitForTimeout(1500);
    } else if (await has('word')) {
      sawBridge = true;
      if (shot && !seen.has('bridge')) { seen.add('bridge'); await page.screenshot({ path: `${shots}/${shot}-bridge.png` }); }
      const n = await page.locator('[data-testid=soundbutton]').count();
      for (let i = 0; i < n; i++) { await page.locator('[data-testid=soundbutton]').nth(i).click(); await page.waitForTimeout(80); }
      await page.waitForSelector('[data-testid=wordchoice]');
      await page.locator('[data-testid=wordchoice][data-answer="1"]').click();
      await page.waitForTimeout(1200);
    } else {
      for (const id of ['story-next', 'alive-next', 'goodnight', 'sleep-next', 'next']) {
        if (await has(id)) {
          if (shot && id === 'story-next' && !seen.has('story')) { seen.add('story'); await page.screenshot({ path: `${shots}/${shot}-story.png` }); }
          if (shot && id === 'goodnight' && !seen.has('good')) { seen.add('good'); await page.screenshot({ path: `${shots}/${shot}-goodnight.png` }); }
          await page.click(`[data-testid=${id}]`);
          break;
        }
      }
    }
  }
  return { sawBridge, sawRobot, sawFeed, sawRhyme, steps };
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1180, height: 820 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  const externalRequests = [];
  page.on('request', (r) => { if (!r.url().startsWith(new URL(url).origin) && !r.url().startsWith('data:')) externalRequests.push(r.url()); });

  log('SETUP');
  await page.goto(url);
  await passGate(page);
  await page.fill('[data-testid=nick]', 'Tom');
  await page.click('[data-testid=setup-next]');
  await page.locator('[data-testid=egg]').nth(1).click();
  await page.fill('[data-testid=companion-name]', 'Dotty');
  await page.click('[data-testid=hatch]');
  await page.click('[data-testid=next]'); // hatched
  await page.click('[data-testid=next]'); // placement intro
  // placement: answer the first set correctly, then fail the second (should start at set 2)
  let placed = 0;
  for (let i = 0; i < 6; i++) {
    await page.waitForSelector('[data-testid=tile]');
    const sel = i < 2 ? '[data-answer="1"]' : '[data-answer="0"]';
    await page.locator(`[data-testid=tile]${sel}`).first().click();
    placed++;
    await page.waitForTimeout(700);
  }
  await page.waitForSelector('[data-testid=greeting]');
  const st = await page.evaluate(() => JSON.parse(localStorage.getItem('soundling.proto.v1')));
  check(st.startSet === 2, `placement 2/2 on set 1 then misses -> starts at set 2 (got ${st.startSet})`);
  check(Object.keys(st.sounds).sort().join() === 'a,p,s,t', 'placed sounds seeded as introduced, not secure');
  check(!Object.values(st.sounds).some((r) => r.correctDays.length), 'placement grants no mastery days');
  check(st.nickname === 'Tom' && !JSON.stringify(st).includes('@'), 'only a nickname is stored, no email/real name fields');

  log('DAY 1 (first adventure, one deliberate mistake)');
  const r1 = await playAdventure(page, { wrongFirst: true, shot: 'day1' });
  check(r1.sawFeed && r1.sawRobot, 'feed-the-creature and robot-talk games appeared');
  check(r1.sawBridge === true, 'printed blending open (placement skipped set 1)');
  const st1 = await page.evaluate(() => JSON.parse(localStorage.getItem('soundling.proto.v1')));
  const newest = Object.keys(st1.sounds).find((id) => !['s', 'a', 't', 'p'].includes(id));
  check(newest === 'i', `first new sound after placement at set 2 is "i" (got ${newest})`);
  check(Object.values(st1.sounds).some((r) => r.attempts > r.correct), 'the deliberate wrong first tap was recorded as a failed first try');
  check(st1.adventureDays.length === 1, 'adventure marked complete once');
  check(st1.collection.length >= 1, 'treasure collected');
  const greet = await page.textContent('[data-testid=greeting]');
  check(/sleepy/i.test(greet), 'island sleeps after goodnight; no autoplay into another activity');
  await page.screenshot({ path: `${shots}/home-asleep.png` });
  check((await page.locator('[data-testid=play]').count()) === 1, 'play again offered only on the home screen (no upsell/ads on child screens)');

  log('PARENT AREA');
  await page.click('[data-testid=parent-btn]');
  await passGate(page);
  await page.click('[data-testid=tab-sounds]');
  check((await page.locator('[data-testid=mapcell]').count()) === 23, 'sound map shows all 23 sounds');
  const cell = await page.locator('[data-testid=mapcell][data-id=i]').getAttribute('data-status');
  check(cell === 'learning', 'new sound shows as learning (not secure after one day)');
  await page.screenshot({ path: `${shots}/parent-sounds.png` });
  await page.click('[data-testid=tab-settings]');
  await page.click('[data-testid=ff-7]');
  await page.click('[data-testid=parent-close]');
  await page.waitForSelector('[data-testid=greeting]');
  log('DAY 9 (after 7 fast-forwarded days)');
  const r2 = await playAdventure(page, { shot: 'day9' });
  check(r2.sawBridge, 'bridge builder (printed blending) appeared');
  await page.click('[data-testid=parent-btn]');
  await passGate(page);
  await page.click('[data-testid=tab-words]');
  const wc = await page.textContent('[data-testid=words-count]');
  check(/^\d+ word/.test(wc), `words list renders (${wc})`);
  await page.click('[data-testid=tab-sounds]');
  const secure = await page.locator('[data-testid=mapcell][data-status=secure]').count();
  check(secure >= 4, `multi-day play has secured sounds (${secure})`);
  await page.screenshot({ path: `${shots}/parent-sounds-day9.png` });

  log('FROM SCRATCH (fails placement, day 1 is oral only: no print)');
  const pageC = await (await browser.newContext({ viewport: { width: 1180, height: 820 } })).newPage();
  const errC = [];
  pageC.on('pageerror', (e) => errC.push(String(e)));
  await pageC.goto(url);
  await passGate(pageC);
  await pageC.fill('[data-testid=nick]', 'New');
  await pageC.click('[data-testid=setup-next]');
  await pageC.click('[data-testid=hatch]');
  await pageC.click('[data-testid=next]');
  await pageC.click('[data-testid=next]');
  for (let i = 0; i < 6; i++) {
    await pageC.waitForSelector('[data-testid=tile]');
    await pageC.locator('[data-testid=tile][data-answer="0"]').first().click();
    await pageC.waitForTimeout(700);
  }
  await pageC.waitForSelector('[data-testid=greeting]');
  const rC = await playAdventure(pageC, { shot: 'scratch' });
  check(!rC.sawBridge && rC.sawRhyme && rC.sawRobot, 'day 1 from scratch: robot talk + rhyme rocket, no printed words');
  const stC = await pageC.evaluate(() => JSON.parse(localStorage.getItem('soundling.proto.v1')));
  check(Object.keys(stC.sounds).join() === 's' && stC.adventureDays.length === 1, 'exactly one new sound (s) introduced and the adventure completed');
  check(errC.length === 0, 'no page errors on the from-scratch path');

  log('BAND B (ages 2-3, Sound Play, co-play only)');
  const pageB = await (await browser.newContext({ viewport: { width: 1180, height: 820 } })).newPage();
  await pageB.goto(url);
  await passGate(pageB);
  await pageB.fill('[data-testid=nick]', 'Wee');
  await pageB.click('[data-testid=band-B]');
  await pageB.click('[data-testid=setup-next]');
  await pageB.click('[data-testid=hatch]');
  await pageB.click('[data-testid=next]');
  await pageB.waitForSelector('[data-testid=play]');
  await pageB.click('[data-testid=play]');
  check(/grown-up/i.test(await pageB.textContent('[data-testid=coplay]')), 'Sound Play opens with "Find a grown-up to play with you"');
  await pageB.click('[data-testid=next]');
  let letters = 0;
  for (let i = 0; i < 3; i++) {
    await pageB.waitForSelector('[data-testid=rhyme-target]');
    letters += await pageB.locator('[data-letter]').count();
    await pageB.locator('[data-testid=pic][data-answer="1"]').click();
    await pageB.waitForTimeout(1500);
  }
  check(letters === 0, 'no letters shown in Sound Play (listening only)');
  const stB = await pageB.evaluate(() => JSON.parse(localStorage.getItem('soundling.proto.v1')));
  check(stB.band === 'B' && Object.keys(stB.sounds).length === 0, 'band B records no letter-sound mastery');

  check(errors.length === 0, `no console/page errors${errors.length ? ': ' + errors.join(' | ') : ''}`);
  check(externalRequests.length === 0, `no third-party network requests${externalRequests.length ? ': ' + externalRequests.join(', ') : ''}`);
  await browser.close();
  log(failures ? `\n${failures} FAILED` : '\nALL PASSED');
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
