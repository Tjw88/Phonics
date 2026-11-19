// End-to-end smoke test against a running preview server. Usage: node scripts/e2e.cjs [url] [screenshotDir]
// Needs Playwright (globally available in the Claude Code cloud image).
const { chromium } = require('playwright');
const url = process.argv[2] || 'http://localhost:4173/';
const shots = process.argv[3] || '/tmp';
const log = (...a) => console.log(...a);
const [VW, VH] = (process.env.VP || '1180x820').split('x').map(Number);
const MOBILE = VW < 600;
let failures = 0;
const errors = [];
// FUN_TIMELINE=/path/file.json records, for every adventure played, when each screen appeared (ms since the adventure started), which testids
// were on it and its caption. Because the player here answers instantly, each screen's duration is roughly the minimum time the APP makes a
// child spend on it (voice-over, celebrations, animations): the engagement review uses it to find dead air and repetition.
const FUN_TIMELINE = process.env.FUN_TIMELINE || '';
const timelines = [];
const check = (cond, msg) => { if (cond) log('  ✓', msg); else { failures++; log('  ✗', msg); } };

async function passGate(page) {
  await page.waitForSelector('[data-testid=gate]');
  const q = await page.textContent('[data-testid=gate-q]');
  const [, a, b] = q.match(/(\d+) × (\d+)/);
  await page.click(`[data-testid=gate-option][data-n="${a * b}"]`);
}

/** A real pointer drag from one element to another (what a finger does). */
async function dragBetween(page, fromSel, toSel, steps = 14) {
  const a = await page.locator(fromSel).first().boundingBox();
  const b = await page.locator(toSel).first().boundingBox();
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps });
  await page.mouse.up();
}
const sceneId = (page) => page.getAttribute('#stage', 'data-scene');
const scenePast = (page, sid) => page.waitForFunction((id) => document.querySelector('#stage')?.dataset.scene !== id, sid, { timeout: 9000 }).catch(() => {});

/** Play whatever is on screen until the island is asleep. `wrongFirst` makes one deliberate first-try mistake. */
async function playAdventure(page, { wrongFirst = false, shot, start = true, stopWhen } = {}) {
  let madeMistake = !wrongFirst, steps = 0, sawBridge = false, sawRobot = false, sawFeed = false, sawRhyme = false;
  const kinds = new Set();
  const seen = new Set();
  const T0 = Date.now(); let lastSid = null; const timeline = [];
  if (FUN_TIMELINE) timelines.push(timeline);
  if (start) await page.click('[data-testid=play]');
  while (steps++ < 300) {
    await page.waitForTimeout(120);
    if (FUN_TIMELINE) {
      const sid = await sceneId(page).catch(() => null);
      if (sid !== lastSid) {
        lastSid = sid;
        const info = await page.evaluate(() => ({
          ids: [...document.querySelectorAll('#stage [data-testid]')].map((e) => e.dataset.testid).filter((v, i, a) => a.indexOf(v) === i).slice(0, 12),
          caption: (document.querySelector('#stage .caption')?.textContent || '').slice(0, 90),
        })).catch(() => ({ ids: [], caption: '' }));
        timeline.push({ t: Date.now() - T0, sid, ...info });
      }
    }
    const done = stopWhen ? await stopWhen(page) : await page.locator('[data-testid=greeting]').count();
    if (done) break;
    if (process.env.E2E_TRACE && steps % 5 === 0) console.log('  [trace]', steps, await page.evaluate(() => [...document.querySelectorAll('#stage [data-testid]')].map((e) => e.dataset.testid).filter((v, i, a) => a.indexOf(v) === i).slice(0, 10).join(',') + ' | scene=' + document.querySelector('#stage')?.dataset.scene).catch(() => '?'));
    const has = (id) => page.locator(`[data-testid=${id}]`).first().isVisible().catch(() => false);
    if (await has('gate')) throw new Error('unexpected gate');
    if (await has('tiles') && await has('mouth')) {
      sawFeed = true; kinds.add('feed');
      if (shot && !seen.has('feed')) { seen.add('feed'); await page.waitForTimeout(500); await page.screenshot({ path: `${shots}/${shot}-feed.png` }); }
      if (!madeMistake && (await page.locator('[data-testid=tile][data-answer="0"]').count())) {
        await dragBetween(page, '[data-testid=tile][data-answer="0"]', '[data-testid=mouth]'); // a wrong letter, dragged in: the dino says "oh"
        madeMistake = true;
        await page.waitForTimeout(900);
      }
      const sid = await sceneId(page);
      if (shot && !seen.has('drag')) {
        // a REAL pointer drag into the mouth, with frames of the dino opening and chomping
        seen.add('drag');
        const t = await page.locator('[data-testid=tile][data-answer="1"]').first().boundingBox();
        const m = await page.locator('[data-testid=mouth]').boundingBox();
        await page.mouse.move(t.x + t.width / 2, t.y + t.height / 2);
        await page.mouse.down();
        await page.mouse.move(m.x + m.width / 2, m.y + m.height / 2, { steps: 12 });
        await page.waitForTimeout(150);
        await page.screenshot({ path: `${shots}/${shot}-drag-hot.png` });
        await page.mouse.up();
        await page.waitForTimeout(650);
        await page.screenshot({ path: `${shots}/${shot}-chomp.png` });
      } else {
        await dragBetween(page, '[data-testid=tile][data-answer="1"]:not([disabled])', '[data-testid=mouth]').catch(() => {});
      }
      await scenePast(page, sid);
    } else if (await has('chips')) {
      sawRobot = true; kinds.add('robot');
      if (shot && !seen.has('robot')) { seen.add('robot'); await page.screenshot({ path: `${shots}/${shot}-robot.png` }); }
      if (shot && !seen.has('robot2')) { seen.add('robot2'); await page.waitForTimeout(700); await page.screenshot({ path: `${shots}/${shot}-robot-talking.png` }); }
      await page.waitForTimeout(2500); // let the robot finish
      const sid = await sceneId(page);
      await page.locator('[data-testid=pic][data-answer="1"]').first().click().catch(() => {});
      await scenePast(page, sid);
    } else if (await has('rhyme-target')) {
      sawRhyme = true; kinds.add('rhyme');
      const sid = await sceneId(page);
      if (shot && !seen.has('rhyme')) { seen.add('rhyme'); await page.waitForTimeout(500); await page.screenshot({ path: `${shots}/${shot}-rhyme.png` }); }
      await dragBetween(page, '[data-testid=pic][data-answer="1"]', '.rocket').catch(() => {});
      if (shot && !seen.has('rhyme2')) { seen.add('rhyme2'); await page.waitForTimeout(1100); await page.screenshot({ path: `${shots}/${shot}-rocket-launch.png` }); }
      await scenePast(page, sid);
    } else if (await has('drum')) {
      kinds.add('drum');
      const n = Number(await page.getAttribute('[data-testid=drum]', 'data-n'));
      const sid = await sceneId(page);
      if (!seen.has('drum')) {
        seen.add('drum'); // a deliberate wrong count first: the game must model it and let the child retry
        for (let i = 0; i < n - 1; i++) { await page.click('[data-testid=drum]'); await page.waitForTimeout(120); }
        if (shot) await page.screenshot({ path: `${shots}/${shot}-drum.png` });
        await page.click('[data-testid=drum-done]');
        await page.waitForFunction(() => document.querySelectorAll('[data-testid=taps] .bead').length === 0, null, { timeout: 12000 });
        kinds.add('drum-retry');
      }
      for (let i = 0; i < n; i++) { await page.click('[data-testid=drum]'); await page.waitForTimeout(120); }
      await page.click('[data-testid=drum-done]');
      await scenePast(page, sid);
    } else if (await has('safari-item')) {
      kinds.add('safari');
      const sid = await sceneId(page);
      if (!seen.has('safari')) {
        seen.add('safari');
        await page.waitForTimeout(500);
        if (shot) await page.screenshot({ path: `${shots}/${shot}-safari.png` });
        await page.locator('[data-testid=safari-item][data-answer="0"]').first().click(); // one wrong tap: it just says the word
        await page.waitForTimeout(300);
      }
      const n = await page.locator('[data-testid=safari-item][data-answer="1"]').count();
      for (let i = 0; i < n; i++) { await page.locator('.safari-item[data-answer="1"]:not(.found)').first().click(); await page.waitForTimeout(150); }
      if (shot && !seen.has('safari2')) { seen.add('safari2'); await page.screenshot({ path: `${shots}/${shot}-safari-found.png` }); }
      await scenePast(page, sid);
    } else if (await has('kitchen')) {
      kinds.add('kitchen');
      const gs = (await page.getAttribute('[data-testid=kitchen]', 'data-graphemes')).split(',');
      const sid = await sceneId(page);
      const letters = await page.locator('[data-testid=ktile]').evaluateAll((ts) => ts.map((t) => t.dataset.letter));
      const decoy = letters.find((l) => !gs.includes(l));
      const order = gs.slice();
      if (!seen.has('kitchen') && decoy) {
        seen.add('kitchen'); // a wrong letter in the first slot: it must go back, the right ones stay
        await dragBetween(page, `[data-testid=ktile][data-letter="${decoy}"]`, '[data-testid=slot] >> nth=0');
        for (let k = 1; k < gs.length; k++) { await dragBetween(page, `[data-testid=ktile][data-letter="${gs[k]}"]:not([disabled])`, `[data-testid=slot] >> nth=${k}`); await page.waitForTimeout(150); }
        await page.waitForFunction(() => [...document.querySelectorAll('[data-testid=slot]')].filter((s) => s.textContent).length === Math.max(0, document.querySelectorAll('[data-testid=slot]').length - 1), null, { timeout: 6000 });
        kinds.add('kitchen-retry');
        if (shot) await page.screenshot({ path: `${shots}/${shot}-kitchen.png` });
        order.splice(1); // only slot 0 is empty now
      }
      // each tile is dropped on ITS slot (the game puts a dropped tile in the empty slot nearest to where it lands)
      for (let k = 0; k < order.length; k++) { await dragBetween(page, `[data-testid=ktile][data-letter="${order[k]}"]:not([disabled])`, `[data-testid=slot] >> nth=${k}`); await page.waitForTimeout(150); }
      if (shot && !seen.has('cook')) { seen.add('cook'); await page.waitForTimeout(1500); await page.screenshot({ path: `${shots}/${shot}-cooked.png` }); }
      await scenePast(page, sid);
    } else if (await has('trace-svg')) {
      kinds.add('trace');
      const sid = await sceneId(page);
      for (let k = 0; k < 8; k++) {
        const pts = await page.evaluate(() => {
          const g = document.querySelector('[data-testid=trace-guide]'); const svg = document.querySelector('[data-testid=trace-svg]');
          if (!g || !svg) return null; const m = svg.getScreenCTM(); const L = g.getTotalLength(); const out = [];
          for (let l = 0; l <= L; l += 3) { const p = g.getPointAtLength(l); const q = new DOMPoint(p.x, p.y).matrixTransform(m); out.push([q.x, q.y]); }
          return out;
        });
        if (!pts) break;
        await page.mouse.move(pts[0][0], pts[0][1]); await page.mouse.down();
        for (let i = 0; i < pts.length; i++) {
          await page.mouse.move(pts[i][0], pts[i][1]);
          if (shot && !seen.has('trace') && i === Math.floor(pts.length / 2)) { seen.add('trace'); await page.screenshot({ path: `${shots}/${shot}-trace.png` }); }
        }
        await page.mouse.up(); await page.waitForTimeout(500);
        if ((await sceneId(page)) !== sid) break;
      }
      await scenePast(page, sid);
    } else if (await has('word')) {
      sawBridge = true;
      kinds.add('bridge');
      if (shot && !seen.has('bridge')) { seen.add('bridge'); await page.screenshot({ path: `${shots}/${shot}-bridge.png` }); }
      const n = await page.locator('[data-testid=soundbutton]').count();
      for (let i = 0; i < n; i++) { await page.locator('[data-testid=soundbutton]').nth(i).click(); await page.waitForTimeout(80); }
      if (!seen.has('replay')) {
        seen.add('replay');
        await page.waitForSelector('[data-testid=wordchoice]', { timeout: 6000 });
        // the child can tap any sound again, in any order, after all have been tapped (it must not reset or dead-end)
        await page.locator('[data-testid=soundbutton]').nth(0).click();
        await page.locator('[data-testid=soundbutton]').nth(n - 1).click();
        await page.waitForTimeout(250);
        const hits = await page.locator('[data-testid=soundbutton].hit').count();
        const fadedNow = (await page.locator('[data-testid=soundbutton].faded').count()) > 0; // big-reader mode: no tap-in-order step, buttons only replay
        check(fadedNow ? (await page.locator('[data-testid=wordchoice]').count()) > 0 : hits === n && (await page.locator('[data-testid=wordchoice]').count()) > 0,
          fadedNow ? 'Bridge Builder (big-reader mode): faded buttons can be tapped for help and the choices stay' : 'Bridge Builder: after all sounds are tapped they can be tapped again (no reset, choices stay)');
        // slide a finger across the letters left to right: the letters blend
        const cols = await page.locator('.gcol .glyph').evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }));
        await page.mouse.move(cols[0][0] - 20, cols[0][1]); await page.mouse.down();
        for (const [x, y] of cols) { await page.mouse.move(x, y, { steps: 5 }); }
        await page.mouse.move(cols[cols.length - 1][0] + 30, cols[0][1], { steps: 3 }); await page.mouse.up();
        await page.waitForTimeout(200);
        check((await page.locator('.word.merge').count()) === 1, 'Bridge Builder: sliding a finger across the letters blends the word');
      }
      await page.waitForSelector('[data-testid=wordchoice]', { timeout: 6000 }).catch(async (e) => { await page.screenshot({ path: `${shots}/DEBUG-bridge.png` }); console.log((await page.innerHTML('#stage')).slice(0, 1500)); throw e; });
      const sid = await sceneId(page);
      if (shot && !seen.has('planks')) { seen.add('planks'); await page.waitForTimeout(400); await page.screenshot({ path: `${shots}/${shot}-planks.png` }); }
      await page.locator('[data-testid=wordchoice][data-answer="1"]').click();
      if (shot && !seen.has('cross')) { seen.add('cross'); await page.waitForTimeout(800); await page.screenshot({ path: `${shots}/${shot}-crossing.png` }); }
      await scenePast(page, sid); // wait for the scene to change, not a fixed sleep
    } else {
      for (const id of ['story-next', 'alive-next', 'treasure', 'goodnight', 'sleep-next', 'next']) {
        if (await has(id)) {
          if (shot && id === 'story-next' && !seen.has('story')) { seen.add('story'); await page.screenshot({ path: `${shots}/${shot}-story.png` }); }
          if (id === 'goodnight' && !seen.has('mission')) {
            seen.add('mission');
            const card = await page.locator('[data-testid=mission-card]').textContent().catch(() => '');
            check(/For the grown-up/.test(card) && /Sound hunt/.test(card), 'goodnight screen shows the off-screen mission in plain sight for the grown-up');
          }
          if (shot && id === 'goodnight' && !seen.has('good')) { seen.add('good'); await page.waitForTimeout(1500); await page.screenshot({ path: `${shots}/${shot}-goodnight.png` }); }
          if (shot && id === 'alive-next' && !seen.has('alive')) { seen.add('alive'); await page.waitForTimeout(900); await page.screenshot({ path: `${shots}/${shot}-alive.png` }); }
          await page.click(`[data-testid=${id}]`);
          break;
        }
      }
    }
  }
  return { sawBridge, sawRobot, sawFeed, sawRhyme, steps, kinds };
}

(async () => {
  const browser = await chromium.launch();
  const TOOLS = () => { try { localStorage.setItem('soundling.tools', '1'); } catch { /* ignore */ } }; // the prototype tools (fast-forward) are hidden unless this is set
  const newPageWithTools = async (opts) => { const c = await browser.newContext(opts); await c.addInitScript(TOOLS); return c.newPage(); };
  const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 1, hasTouch: MOBILE, isMobile: MOBILE });
  await ctx.addInitScript(TOOLS);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  const manifestRequests = [];
  page.on('request', (r) => { const m = r.url().match(/audio\/(\w+)\/manifest\.json/); if (m) manifestRequests.push(m[1]); });
  const externalRequests = [];
  page.on('request', (r) => { if (!r.url().startsWith(new URL(url).origin) && !r.url().startsWith('data:')) externalRequests.push(r.url()); });

  log('SETUP');
  await page.goto(url + '?fpRounds=1');
  await passGate(page);
  await page.fill('[data-testid=nick]', 'Tom');
  await page.click('[data-testid=accent-north]');
  check(/short a/.test(await page.textContent('[data-testid=accent-note]')), 'choosing Northern English explains the differences (short a, shared bus/put vowel)');
  await page.click('[data-testid=setup-next]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${shots}/setup-welcome.png` });
  await page.locator('[data-testid=egg]').nth(1).click();
  await page.fill('[data-testid=companion-name]', 'Dotty');
  await page.click('[data-testid=hatch]');
  await page.click('[data-testid=next]'); // hatched
  await page.click('[data-testid=next]'); // placement intro
  // placement: answer the first set correctly, then miss: it stops at the first miss (should start at set 2)
  let placed = 0;
  for (let i = 0; i < 12; i++) {
    const which = await Promise.race([
      page.waitForSelector('[data-testid=tile]').then(() => 'tile'),
      page.waitForSelector('[data-testid=greeting]').then(() => 'greeting'),
    ]);
    if (which === 'greeting') break;
    const sel = i < 2 ? '[data-answer="1"]' : '[data-answer="0"]';
    await page.locator(`[data-testid=tile]${sel}`).first().click();
    placed++;
    await page.waitForTimeout(700);
  }
  check(placed === 3, `placement stops at the first miss (asked ${placed} questions: 2 right on set 1, then one miss)`);
  await page.waitForSelector('[data-testid=greeting]');
  const st = await page.evaluate(() => JSON.parse(localStorage.getItem('soundling.proto.v1')));
  check(st.startSet === 2, `placement 2/2 on set 1 then misses -> starts at set 2 (got ${st.startSet})`);
  check(Object.keys(st.sounds).sort().join() === 'a,p,s,t', 'placed sounds seeded as introduced, not secure');
  check(!Object.values(st.sounds).some((r) => r.correctDays.length), 'placement grants no mastery days');
  check(st.accent === 'north' && manifestRequests.includes('north'), `northern accent saved and its audio pack fetched (requests: ${[...new Set(manifestRequests)].join(',')})`);
  check(st.nickname === 'Tom' && !JSON.stringify(st).includes('@'), 'only a nickname is stored, no email/real name fields');

  log('DAY 1 (first adventure, one deliberate mistake)');
  const r1 = await playAdventure(page, { wrongFirst: true, shot: 'day1' });
  check(r1.sawFeed && r1.kinds.has('bridge'), 'day 1 (placed at set 2): feed-the-creature and printed blending appeared');
  check(r1.kinds.has('safari'), 'day 1 rotation: the listening game was Sound Safari (the new sound has things to find)');
  check(!r1.kinds.has('trace'), 'Trace Trail is OFF by default (it is an optional parent setting)');
  check(r1.sawBridge === true, 'printed blending open (placement skipped set 1)');
  const st1 = await page.evaluate(() => JSON.parse(localStorage.getItem('soundling.proto.v1')));
  const newest = Object.keys(st1.sounds).find((id) => !['s', 'a', 't', 'p'].includes(id));
  check(newest === 'i', `first new sound after placement at set 2 is "i" (got ${newest})`);
  check(Object.values(st1.sounds).some((r) => r.attempts > r.correct), 'the deliberate wrong first tap was recorded as a failed first try');
  check(st1.adventureDays.length === 1, 'adventure marked complete once');
  check(st1.collection.length >= 1, 'treasure collected');
  const greet = await page.textContent('[data-testid=greeting]');
  check(/sleepy/i.test(greet), 'island sleeps after goodnight; no autoplay into another activity');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${shots}/home-asleep.png` });
  await page.click('[data-testid=island-pet]'); await page.waitForTimeout(100);
  check(/wiggle/.test(await page.getAttribute('[data-testid=island-pet]', 'class')), 'touching the home character makes it wiggle (every child tries this first)');
  check((await page.locator('[data-testid=play]').count()) === 1, 'play again offered only on the home screen (no upsell/ads on child screens)');

  log('FREE PLAY (a menu of every game, one round each)');
  await page.click('[data-testid=freeplay]');
  await page.waitForSelector('[data-testid=gamegrid]');
  const fpGames = await page.locator('[data-testid=gamegrid] .gamebtn').evaluateAll((bs) => bs.map((b) => b.dataset.testid));
  check(fpGames.length === 8, `free play offers all 8 games (${fpGames.map((g) => g.replace('fp-', '')).join(', ')})`);
  const fpKinds = new Set();
  for (const id of fpGames) {
    const sid0 = await sceneId(page);
    await page.click(`[data-testid=${id}]`);
    await scenePast(page, sid0);
    const rr = await playAdventure(page, { start: false, shot: id === 'fp-drum' ? 'fp' : undefined, stopWhen: async (p) => (await p.locator('[data-testid=gamegrid]').count()) > 0 });
    rr.kinds.forEach((k) => fpKinds.add(k));
  }
  for (const k of ['feed', 'robot', 'drum', 'safari', 'kitchen', 'bridge', 'rhyme', 'trace']) check(fpKinds.has(k), `free play: ${k} played to completion`);
  check(fpKinds.has('drum-retry'), 'Beat the Drum: a wrong count is modelled and the child can retry');
  check(fpKinds.has('kitchen-retry'), 'Word Kitchen: a wrong letter goes back to the tray, the right ones stay');
  // tap fallback: with several letters the first taps do not place the letter (it hops toward the mouth to show the way); the 3rd tap places it
  {
    const sid0 = await sceneId(page);
    await page.click('[data-testid=fp-feed]');
    await scenePast(page, sid0);
    await page.waitForSelector('[data-testid=tile]');
    const sidF = await sceneId(page);
    for (let i = 0; i < 2; i++) { await page.locator('[data-testid=tile][data-answer="1"]').first().click(); await page.waitForTimeout(600); }
    check((await sceneId(page)) === sidF, 'tap fallback: the first two taps do not place the letter (it hops toward the mouth to teach the drag)');
    await page.locator('[data-testid=tile][data-answer="1"]').first().click();
    await scenePast(page, sidF);
    check((await sceneId(page)) !== sidF, 'tap fallback: after two taps a tap places the letter (no child is ever stuck)');
    await page.waitForSelector('[data-testid=gamegrid]', { timeout: 12000 }).catch(() => {});
  }
  await page.click('[data-testid=freeplay-back]');
  await page.waitForSelector('[data-testid=greeting]');

  log('PARENT AREA');
  await page.click('[data-testid=parent-btn]');
  await passGate(page);
  await page.click('[data-testid=tab-sounds]');
  check((await page.locator('[data-testid=mapcell]').count()) === 48, 'sound map shows all 48 sounds (sets 1-12)');
  const cell = await page.locator('[data-testid=mapcell][data-id=i]').getAttribute('data-status');
  check(cell === 'learning', 'new sound shows as learning (not secure after one day)');
  await page.screenshot({ path: `${shots}/parent-sounds.png` });
  // the weekly summary (day 1 has been played: one day, the sound just learned, no streak language)
  await page.click('[data-testid=tab-week]');
  check((await page.locator('[data-testid=weekbar] .weekday').count()) === 7, 'This week: seven days shown');
  check((await page.locator('[data-testid=weekbar] .weekday.played').count()) === 1, 'This week: exactly today is marked as played');
  const wl = await page.textContent('[data-testid=week-lines]');
  check(/Played on 1 day of the last 7/.test(wl), `This week: says how many days were played (${wl.slice(0, 60)}...)`);
  check(/New this week: \/i\//.test(wl), 'This week: names the new sound after placement (i), not the sounds placement skipped');
  check(!/streak|missed|behind/i.test(wl), 'This week: no streak or guilt wording');
  check(/Sound hunt this week/.test(await page.textContent('[data-testid=week-activity]')), 'This week: an off-screen activity is suggested');
  await page.screenshot({ path: `${shots}/parent-week.png` });
  await page.click('[data-testid=tab-settings]');
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem('soundling.proto.v1')).sounds);
  await page.selectOption('[data-testid=accent]', 'rp');
  await page.waitForTimeout(400);
  const afterRp = await page.evaluate(() => JSON.parse(localStorage.getItem('soundling.proto.v1')));
  check(afterRp.accent === 'rp' && manifestRequests.includes('rp'), 'switching to RP in settings saves it and loads the RP pack');
  check(JSON.stringify(afterRp.sounds) === JSON.stringify(before), 'progress is untouched by the accent switch');
  check(/long a/.test(await page.textContent('[data-testid=accent-help]')), 'settings explain what RP changes');
  await page.selectOption('[data-testid=accent]', 'north');
  await page.waitForTimeout(300);
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

  log('BIG READER (sound buttons fade once a child has read enough words)');
  await page.click('[data-testid=parent-close]');
  await page.waitForSelector('[data-testid=greeting]');
  const setReaderState = (soundButtons, nWords) => page.evaluate(([sb, n]) => {
    const k = 'soundling.proto.v1'; const s = JSON.parse(localStorage.getItem(k));
    const day = (i) => new Date(Date.now() - i * 864e5).toISOString().slice(0, 10);
    s.words = {}; for (let i = 0; i < n; i++) s.words[`zz${i}`] = { correctDays: [day(2), day(1)], attempts: 2, correct: 2 };
    s.soundButtons = sb; localStorage.setItem(k, JSON.stringify(s));
  }, [soundButtons, nWords]);
  const openBridge = async () => {
    await page.reload(); await page.waitForSelector('[data-testid=greeting]');
    await page.click('[data-testid=freeplay]'); await page.waitForSelector('[data-testid=gamegrid]');
    await page.click('[data-testid=fp-bridge]');
    await page.waitForSelector('[data-testid=word]');
  };
  await setReaderState('auto', 10);
  await openBridge();
  await page.waitForSelector('[data-testid=wordchoice]', { timeout: 6000 });
  const nBtn = await page.locator('[data-testid=soundbutton]').count();
  check((await page.locator('[data-testid=soundbutton].faded').count()) === nBtn && nBtn >= 2, `big reader: with 10 words read the sound buttons are faded (${nBtn}) and the word choices are already there, no tapping needed`);
  await page.locator('[data-testid=soundbutton]').nth(0).click(); await page.waitForTimeout(150);
  check((await page.locator('[data-testid=wordchoice]').count()) > 0, 'big reader: a faded sound button still plays its sound when tapped (help is never removed)');
  await page.locator('[data-testid=wordchoice][data-answer="0"]').first().click(); await page.waitForTimeout(300);
  check((await page.locator('[data-testid=soundbutton].faded').count()) === 0, 'big reader: after a wrong pick the sound buttons come back in full');
  await page.locator('[data-testid=wordchoice][data-answer="1"]').click();
  await page.waitForSelector('[data-testid=gamegrid]', { timeout: 15000 });
  await setReaderState('auto', 7);
  await openBridge();
  await page.waitForTimeout(500);
  check((await page.locator('[data-testid=soundbutton].faded').count()) === 0 && (await page.locator('[data-testid=wordchoice]').count()) === 0, 'big reader: with only 7 words read the buttons are not faded and each sound must be tapped first');
  await page.click('[data-testid=freeplay-back]'); await page.waitForSelector('[data-testid=greeting]');
  await setReaderState('always', 12);
  await openBridge();
  await page.waitForTimeout(500);
  check((await page.locator('[data-testid=soundbutton].faded').count()) === 0 && (await page.locator('[data-testid=wordchoice]').count()) === 0, 'big reader: the parent setting "always show them" keeps the buttons even for a confident reader');
  await page.click('[data-testid=freeplay-back]'); await page.waitForSelector('[data-testid=greeting]');
  await page.click('[data-testid=parent-btn]'); await passGate(page); await page.click('[data-testid=tab-settings]');
  check((await page.locator('[data-testid=soundbuttons]').count()) === 1, 'Settings has the sound-buttons option');
  await page.click('[data-testid=parent-close]'); await page.waitForSelector('[data-testid=greeting]');

  log('GROWN-UP GATE and small fixes');
  {
    const pg = await newPageWithTools({ viewport: { width: VW, height: VH }, hasTouch: MOBILE, isMobile: MOBILE });
    await pg.goto(url);
    await pg.waitForSelector('[data-testid=gate]');
    const q = await pg.textContent('[data-testid=gate-q]'); const [, ga, gb] = q.match(/(\d+) × (\d+)/);
    const wrongN = await pg.locator(`[data-testid=gate-option]:not([data-n="${ga * gb}"])`).first().getAttribute('data-n');
    await pg.click(`[data-testid=gate-option][data-n="${wrongN}"]`);
    await pg.waitForSelector('[data-testid=gate-locked]', { timeout: 4000 }).catch(() => {});
    const lockText = await pg.locator('[data-testid=gate-locked]').textContent().catch(() => '');
    check(/Please wait \d+ seconds/.test(lockText), `a wrong grown-up-gate answer locks the gate for a while (${lockText.trim().slice(0, 60)})`);
    check((await pg.locator('[data-testid=gate-option]').count()) === 0, 'while locked there are no answers to guess');
    await pg.close();
  }

  log('WORLDS (theme packs)');
  {
    const pw = await newPageWithTools({ viewport: { width: VW, height: VH }, hasTouch: MOBILE, isMobile: MOBILE });
    const errW = [];
    pw.on('pageerror', (e) => errW.push(String(e)));
    await pw.goto(url);
    await passGate(pw);
    await pw.fill('[data-testid=nick]', 'World');
    await pw.click('[data-testid=setup-next]');
    await pw.waitForSelector('[data-testid=world]');
    const worldIds = await pw.locator('[data-testid=world]').evaluateAll((els) => els.map((e) => e.dataset.id));
    check(worldIds.length >= 5 && worldIds[0] === 'dino', `the friend picker offers ${worldIds.length} worlds (${worldIds.join(', ')})`);
    const bgOf = () => pw.evaluate(() => document.querySelector('#scene-bg').innerHTML.length + ':' + (document.querySelector('#scene-bg').innerHTML.match(/id="[^"]+"/g) || []).slice(0, 3).join(','));
    const eggsOf = () => pw.locator('[data-testid=egg]').evaluateAll((els) => els.map((e) => e.innerHTML.length).join(','));
    const bg0 = await bgOf(); const eggs0 = await eggsOf();
    check((await pw.locator('[data-testid=egg]').count()) === 4, 'four friends to pick from in the first world');
    await pw.locator('[data-testid=world][data-id=ocean]').click();
    await pw.waitForTimeout(200);
    check((await bgOf()) !== bg0, 'choosing a world changes the backdrop at once');
    check((await eggsOf()) !== eggs0 && (await pw.locator('[data-testid=egg]').count()) === 4, 'choosing a world changes the four friends offered');
    await pw.screenshot({ path: `${shots}/world-ocean-picker.png` });
    await pw.locator('[data-testid=egg]').nth(2).click();
    await pw.click('[data-testid=hatch]');
    await pw.waitForSelector('[data-testid=next]');
    await pw.screenshot({ path: `${shots}/world-ocean-hatched.png` });
    await pw.click('[data-testid=next]'); // hatched
    await pw.click('[data-testid=next]'); // placement intro
    await pw.waitForSelector('[data-testid=tile]');
    await pw.locator('[data-testid=tile][data-answer="0"]').first().click(); // a first miss ends placement at once
    await pw.waitForSelector('[data-testid=greeting]');
    const stW = await pw.evaluate(() => JSON.parse(localStorage.getItem('soundling.proto.v1')));
    check(stW.theme === 'ocean' && /^ocean-/.test(stW.companion.kind), `the chosen world and friend are saved (${stW.theme}, ${stW.companion.kind}); the name defaults per world (${stW.companion.name})`);
    check(stW.companion.name === 'Tilly', `the default friend name comes from the creature (the turtle is called ${stW.companion.name})`);
    await pw.screenshot({ path: `${shots}/world-ocean-home.png` });
    // a grown-up switches world later: same friend slot, new backdrop, progress untouched
    await pw.click('[data-testid=parent-btn]'); await passGate(pw);
    await pw.click('[data-testid=tab-settings]');
    const bgBefore = await bgOf();
    await pw.selectOption('[data-testid=theme]', 'farm');
    await pw.waitForTimeout(300);
    const stF = await pw.evaluate(() => JSON.parse(localStorage.getItem('soundling.proto.v1')));
    check(stF.theme === 'farm' && /^farm-/.test(stF.companion.kind), `switching world in Settings re-skins the friend (${stW.companion.kind} -> ${stF.companion.kind})`);
    check(stF.companion.name === stW.companion.name && JSON.stringify(stF.sounds) === JSON.stringify(stW.sounds), 'switching world keeps the friend\'s name and all progress');
    check((await bgOf()) !== bgBefore, 'the backdrop changes when the world is switched');
    await pw.screenshot({ path: `${shots}/world-farm-settings.png` });
    check(errW.length === 0, `no page errors while choosing and switching worlds${errW.length ? ': ' + errW[0] : ''}`);
    await pw.close();
  }

  log('FROM SCRATCH (fails placement, day 1 is oral only: no print)');
  const pageC = await newPageWithTools({ viewport: { width: VW, height: VH }, hasTouch: MOBILE, isMobile: MOBILE });
  const errC = [];
  pageC.on('pageerror', (e) => errC.push(String(e)));
  await pageC.goto(url);
  await passGate(pageC);
  await pageC.fill('[data-testid=nick]', 'New');
  await pageC.click('[data-testid=setup-next]');
  await pageC.click('[data-testid=hatch]');
  await pageC.click('[data-testid=next]');
  await pageC.click('[data-testid=next]');
  let placedC = 0;
  for (let i = 0; i < 12; i++) {
    const which = await Promise.race([
      pageC.waitForSelector('[data-testid=tile]').then(() => 'tile'),
      pageC.waitForSelector('[data-testid=greeting]').then(() => 'greeting'),
    ]);
    if (which === 'greeting') break;
    await pageC.locator('[data-testid=tile][data-answer="0"]').first().click();
    placedC++;
    await pageC.waitForTimeout(700);
  }
  check(placedC === 1, `a first miss on set 1 ends placement at once (asked ${placedC})`);
  await pageC.waitForSelector('[data-testid=greeting]');
  await pageC.click('[data-testid=parent-btn]');
  await passGate(pageC);
  await pageC.click('[data-testid=tab-settings]');
  await pageC.check('[data-testid=tracing]');
  await pageC.click('[data-testid=parent-close]');
  const rC = await playAdventure(pageC, { shot: 'scratch' });
  check(rC.kinds.has('trace'), 'Trace Trail appears once the parent turns it on (day 1 has a new sound)');
  check(!rC.sawBridge && rC.sawRhyme && rC.sawRobot, 'day 1 from scratch: oral games and rhyme rocket, no printed words');
  const stC = await pageC.evaluate(() => JSON.parse(localStorage.getItem('soundling.proto.v1')));
  check(Object.keys(stC.sounds).join() === 's' && stC.adventureDays.length === 1, 'exactly one new sound (s) introduced and the adventure completed');
  check(errC.length === 0, 'no page errors on the from-scratch path');

  log('FINALE LAYOUT (owner decision Q16: the "For the grown-up" header must be visible without scrolling)');
  for (const [fw, fh, mob] of [[1180, 820, false], [1024, 768, false], [390, 844, true]]) {
    const cF = await browser.newContext({ viewport: { width: fw, height: fh }, hasTouch: mob, isMobile: mob });
    await cF.addInitScript(TOOLS);
    // a child who has used up today's time: the adventure goes straight to the end-of-day screen (the layout is the same as after a full day)
    await cF.addInitScript(() => {
      try {
        if (localStorage.getItem('soundling.proto.v1')) return;
        const d = new Date().toISOString().slice(0, 10);
        const sounds = {};
        localStorage.setItem('soundling.proto.v1', JSON.stringify({ nickname: 'Fin', band: 'C', accent: 'rp', tracing: false, musicOn: false, easyTap: false, soundButtons: 'auto', theme: 'dino', companion: { kind: 'rexy', name: 'Dino' }, startSet: 1, sounds, words: {}, collection: [], adventureDays: [], lastIntroDay: null, dayOffset: 0, playMs: { [d]: 99999999 }, dailyLimitMin: 10, version: 1 }));
      } catch { /* ignore */ }
    });
    const pF = await cF.newPage();
    const errF = []; pF.on('pageerror', (e) => errF.push(String(e)));
    await pF.goto(url);
    await pF.waitForSelector('[data-testid=play]');
    await pF.click('[data-testid=play]');
    // day 1 from scratch: hello, the new-sound story, two single-tile Feed trials, then (time is up) the end-of-day screen
    for (let k = 0; k < 60 && !(await pF.locator('[data-testid=mission-card]').count()); k++) {
      if (await pF.locator('[data-testid=tile]').count()) await pF.locator('[data-testid=tile]').first().click().catch(() => {});
      else for (const id of ['next', 'story-next']) if (await pF.locator(`[data-testid=${id}]`).count()) { await pF.click(`[data-testid=${id}]`).catch(() => {}); break; }
      await pF.waitForTimeout(350);
    }
    await pF.waitForSelector('[data-testid=mission-card]', { timeout: 5000 });
    await pF.waitForTimeout(400);
    const mF = await pF.evaluate(() => { const e = document.querySelector('[data-testid=mission-card] strong'); const r = e.getBoundingClientRect(); return { text: e.textContent, top: r.top, bottom: r.bottom, ih: innerHeight, doc: document.documentElement.scrollHeight }; });
    check(/For the grown-up/.test(mF.text) && mF.top >= 0 && mF.bottom <= mF.ih, `end of day at ${fw}x${fh}: the "For the grown-up" header is above the fold (bottom ${Math.round(mF.bottom)} of ${mF.ih})`);
    check(mF.doc <= mF.ih + 24, `end of day at ${fw}x${fh}: the page barely scrolls (document ${mF.doc} for a ${mF.ih} px window)`);
    check(errF.length === 0, `no page errors on the finale at ${fw}x${fh}`);
    await cF.close();
  }

  log('PICK A FRIEND LAYOUT (twelve worlds: title, worlds, friends and Hatch reachable without hunting)');
  for (const [pw, ph, mob] of [[1180, 820, false], [1024, 768, false], [390, 844, true]]) {
    const cP = await browser.newContext({ viewport: { width: pw, height: ph }, hasTouch: mob, isMobile: mob });
    await cP.addInitScript(TOOLS);
    const pP = await cP.newPage();
    await pP.goto(url); await passGate(pP);
    await pP.click('[data-testid=setup-next]'); await pP.waitForSelector('[data-testid=hatch]'); await pP.waitForTimeout(500);
    const mP = await pP.evaluate(() => { const t = document.querySelector('#stage h1').getBoundingClientRect(); const hb = document.querySelector('[data-testid=hatch]').getBoundingClientRect(); const w = [...document.querySelectorAll('[data-testid=world]')].map((e) => e.getBoundingClientRect()); return { y: window.scrollY, titleTop: t.top, hatchBottom: hb.bottom, ih: innerHeight, minW: Math.min(...w.map((r) => r.width)), minH: Math.min(...w.map((r) => r.height)), n: w.length, doc: document.documentElement.scrollHeight }; });
    check(mP.n === 12 && mP.y === 0 && mP.titleTop >= 0 && mP.hatchBottom <= mP.ih && mP.minW >= 64 && mP.minH >= 64, `pick a friend at ${pw}x${ph}: ${mP.n} worlds, opens at the top, title and Hatch on screen (Hatch bottom ${Math.round(mP.hatchBottom)} of ${mP.ih}), smallest world ${Math.round(mP.minW)}x${Math.round(mP.minH)}`);
    await cP.close();
  }

  log('IN-GAME GROWN-UP MENU (gear -> parent gate -> menu: tap/drag, switch activity, change world or friend, home)');
  {
    const seed = () => {
      try {
        if (localStorage.getItem('soundling.proto.v1')) return;
        const day = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
        const sounds = {}; for (const id of ['s', 'a', 't', 'p', 'i', 'n', 'm', 'd', 'g', 'o', 'c', 'k']) sounds[id] = { introducedOn: day(5), attempts: 6, correct: 6, correctDays: [day(3), day(2), day(1)], dayTally: {}, box: 3, due: day(-3), boxDay: null };
        localStorage.setItem('soundling.proto.v1', JSON.stringify({ nickname: 'Menu', band: 'C', accent: 'rp', tracing: false, musicOn: false, easyTap: false, soundButtons: 'auto', theme: 'dino', companion: { kind: 'rexy', name: 'Dino' }, startSet: 2, sounds, words: {}, collection: [], adventureDays: [], lastIntroDay: null, dayOffset: 0, playMs: {}, dailyLimitMin: 30, version: 1 }));
      } catch { /* ignore */ }
    };
    const open = async (opts = {}) => {
      const c = await browser.newContext({ viewport: { width: VW, height: VH }, hasTouch: MOBILE, isMobile: MOBILE, ...opts });
      await c.addInitScript(TOOLS); await c.addInitScript(seed);
      const pg = await c.newPage(); const errs = []; pg.on('pageerror', (e) => errs.push(String(e)));
      await pg.goto(url + '?fpRounds=1'); await pg.waitForSelector('[data-testid=freeplay]');
      return { c, pg, errs };
    };
    const saved = (pg) => pg.evaluate(() => JSON.parse(localStorage.getItem('soundling.proto.v1')));
    const gearMenu = async (pg) => { await pg.click('[data-testid=parent-btn]'); await passGate(pg); await pg.waitForSelector('[data-testid=game-menu]'); };
    const { c: cM, pg: pM, errs: errM } = await open();
    // 1. a Free Play Feed round; the gear is small, quiet and clear of the answers
    await pM.click('[data-testid=freeplay]'); await pM.click('[data-testid=fp-feed]'); await pM.waitForSelector('[data-testid=tile]'); await pM.waitForTimeout(700);
    const geom = await pM.evaluate(() => { const g = document.querySelector('[data-testid=parent-btn]').getBoundingClientRect(); const rs = [...document.querySelectorAll('[data-testid=tile], [data-testid=mouth]')].map((e) => e.getBoundingClientRect()); const hit = rs.some((r) => !(g.right < r.left || g.left > r.right || g.bottom < r.top || g.top > r.bottom)); return { w: g.width, h: g.height, hit }; });
    check(geom.w >= 44 && geom.h >= 44 && geom.w <= 64 && !geom.hit, `in a game the grown-up gear is 44-64 px (${Math.round(geom.w)}x${Math.round(geom.h)}) and does not cover the answers`);
    // 2. the gate comes first, then the menu with large labelled buttons
    await gearMenu(pM);
    const labels = await pM.locator('.gmenu .gm-btn').evaluateAll((els) => els.map((e) => ({ id: e.dataset.testid, h: e.getBoundingClientRect().height })));
    check(['menu-keep', 'menu-tapmode', 'menu-adventure', 'menu-soundplay', 'menu-world', 'menu-friend', 'menu-parent', 'menu-home'].every((id) => labels.some((l) => l.id === id)) && labels.every((l) => l.h >= 64), `the grown-up menu opens after the gate with ${labels.length} large buttons (all at least 64 px high)`);
    // 3. the play clock is stopped while the menu is open
    const clockA = JSON.stringify((await saved(pM)).playMs);
    await pM.waitForTimeout(2600);
    const sidClock = await sceneId(pM);
    // 4. tap instead of drag, in the round that is on screen
    const sidTap = await sceneId(pM);
    await pM.click('[data-testid=menu-tapmode]');
    check((await pM.getAttribute('[data-testid=menu-tapmode]', 'aria-pressed')) === 'true' && (await saved(pM)).easyTap === true, 'the menu switches to tap-to-place (shown on the button, saved)');
    await pM.click('[data-testid=menu-keep]');
    check(JSON.stringify((await saved(pM)).playMs) === clockA && sidClock === sidTap, 'the play-time clock does not run while the menu is open (2.6 s open, no time counted)');
    check((await pM.locator('[data-testid=game-menu]').count()) === 0 && (await sceneId(pM)) === sidTap && (await pM.locator('[data-testid=tile]').count()) > 1, 'Keep playing closes the menu and the same round carries on');
    await pM.locator('[data-testid=tile][data-answer="1"]').first().click();
    await scenePast(pM, sidTap);
    check((await sceneId(pM)) !== sidTap, 'in tap mode ONE tap on the right letter places it (no dragging needed), in the round that was already on screen');
    // back to drag: a single tap must not place the letter any more (several letters on offer)
    await pM.waitForSelector('[data-testid=gamegrid]', { timeout: 12000 }); await pM.click('[data-testid=fp-feed]'); await pM.waitForSelector('[data-testid=tile]'); await pM.waitForTimeout(600);
    await gearMenu(pM); await pM.click('[data-testid=menu-tapmode]');
    check((await pM.getAttribute('[data-testid=menu-tapmode]', 'aria-pressed')) === 'false' && (await saved(pM)).easyTap === false, 'the menu switches back to drag');
    await pM.click('[data-testid=menu-keep]');
    const sidDrag = await sceneId(pM);
    if ((await pM.locator('[data-testid=tile]').count()) > 1) { await pM.locator('[data-testid=tile][data-answer="1"]').first().click(); await pM.waitForTimeout(700); check((await sceneId(pM)) === sidDrag, 'back in drag mode a single tap does not place the letter (it hops towards the mouth)'); }
    // 5. Free Play -> Adventure -> Free Play without finishing anything
    await gearMenu(pM); await pM.click('[data-testid=menu-adventure]');
    await pM.waitForSelector('[data-testid=next]', { timeout: 8000 });
    check((await pM.locator('[data-testid=freeplay-back]').count()) === 0 && (await pM.locator('.overlay').count()) === 0, 'switching to Adventure from Free Play leaves no back button or overlay behind and starts the Adventure');
    await gearMenu(pM); await pM.click('[data-testid=menu-freeplay]');
    await pM.waitForSelector('[data-testid=gamegrid]', { timeout: 8000 });
    check((await pM.locator('[data-testid=freeplay-back]').count()) === 1, 'switching back to Free Play shows the game menu again (one Back button)');
    // 6. leave to the home screen in the middle of a round: nothing recorded for it, no leftovers
    const before = await saved(pM); // (starting an Adventure introduces today's sound: that is saved, an unfinished round is not)
    await pM.click('[data-testid=fp-robot]'); await pM.waitForSelector('[data-testid=chips]'); await pM.waitForTimeout(500);
    await gearMenu(pM); await pM.click('[data-testid=menu-home]');
    await pM.waitForSelector('[data-testid=greeting]', { timeout: 8000 });
    const after = await saved(pM);
    check(JSON.stringify(after.sounds) === JSON.stringify(before.sounds) && JSON.stringify(after.words) === JSON.stringify(before.words), 'an abandoned round records nothing (sounds and words are unchanged)');
    check((await pM.locator('.overlay').count()) === 0 && (await pM.locator('[data-testid=freeplay-back]').count()) === 0 && (await pM.locator('.in-game').count()) === 0 && (await pM.locator('#stage .scene-ghost').count()) === 0, 'Back to home leaves no overlay, back button or ghost behind');
    const sidHome = await sceneId(pM); await pM.waitForTimeout(1500);
    check((await sceneId(pM)) === sidHome && (await pM.locator('[data-testid=greeting]').count()) === 1, 'the abandoned game cannot redraw over the home screen afterwards');
    // 7. a partial Adventure keeps its place: leaving at the hello screen does not mark the day as done, and the sound introduced today stays saved
    await pM.click('[data-testid=play]'); await pM.waitForSelector('[data-testid=next]');
    const midAdv = await saved(pM);
    await gearMenu(pM); await pM.click('[data-testid=menu-home]'); await pM.waitForSelector('[data-testid=greeting]');
    const leftAdv = await saved(pM);
    check(leftAdv.adventureDays.length === 0 && leftAdv.lastIntroDay === midAdv.lastIntroDay && Object.keys(leftAdv.sounds).length === Object.keys(midAdv.sounds).length, 'leaving the Adventure part-way keeps today open (not marked done) and keeps what was already saved');
    // 8. Sound Play as a one-off from a Phonics-journey profile: the saved band does not change
    await pM.click('[data-testid=freeplay]'); await pM.waitForSelector('[data-testid=gamegrid]');
    await gearMenu(pM); await pM.click('[data-testid=menu-soundplay]'); await pM.waitForSelector('[data-testid=coplay]', { timeout: 8000 });
    const sp = await saved(pM);
    check(sp.band === 'C' && sp.adventureDays.length === 0, 'Sound Play from the menu is a one-off: the saved band (C) and today\'s Adventure are untouched');
    // 9. change world in the middle of a game: the backdrop and friend change, name and progress stay, and the game list is back
    await gearMenu(pM); await pM.click('[data-testid=menu-world]'); await pM.waitForSelector('[data-testid=world-pick]');
    check((await pM.locator('[data-testid=world-pick]').count()) === 12, 'Change world offers all 12 worlds');
    await pM.click('[data-testid=world-pick][data-id=ocean]');
    await pM.waitForSelector('[data-testid=greeting]', { timeout: 8000 });
    const w = await saved(pM);
    check(w.theme === 'ocean' && /^ocean-/.test(w.companion.kind) && w.companion.name === 'Dino' && (await pM.evaluate(() => document.body.dataset.pack)) === 'ocean', `changing world mid-game switches the world (${w.theme}), keeps the friend's slot and name (${w.companion.kind}, ${w.companion.name})`);
    // ...and a friend change inside Free Play
    await pM.click('[data-testid=freeplay]'); await pM.waitForSelector('[data-testid=gamegrid]'); await pM.click('[data-testid=fp-bridge]'); await pM.waitForSelector('[data-testid=word]');
    await gearMenu(pM); await pM.click('[data-testid=menu-friend]'); await pM.waitForSelector('[data-testid=friend-pick]');
    const kinds = await pM.locator('[data-testid=friend-pick]').evaluateAll((els) => els.map((e) => e.dataset.kind));
    await pM.locator('[data-testid=friend-pick]').nth(2).click();
    await pM.waitForSelector('[data-testid=gamegrid]', { timeout: 8000 });
    const w2 = await saved(pM);
    check(kinds.length === 4 && w2.companion.kind === kinds[2] && w2.companion.name === 'Dino' && w2.theme === 'ocean', `Change friend offers the four friends of the world and keeps the name (${w2.companion.kind}, ${w2.companion.name})`);
    // 10. the existing grown-ups area is still one gear press away on the island, and from the menu
    await pM.click('[data-testid=freeplay-back]'); await pM.waitForSelector('[data-testid=greeting]');
    await pM.click('[data-testid=parent-btn]'); await passGate(pM); await pM.waitForSelector('[data-testid=parent]');
    check((await pM.locator('[data-testid=game-menu]').count()) === 0, 'on the island the gear still opens the grown-ups area (not the game menu)');
    await pM.click('[data-testid=parent-close]');
    check(errM.length === 0, `no page errors using the grown-up menu${errM.length ? ': ' + errM[0] : ''}`);
    await cM.close();

    // a wrong answer at the gate changes nothing, and the gate then locks
    const { c: cW, pg: pW, errs: errW } = await open();
    await pW.click('[data-testid=freeplay]'); await pW.click('[data-testid=fp-feed]'); await pW.waitForSelector('[data-testid=tile]');
    const sidW = await sceneId(pW);
    await pW.click('[data-testid=parent-btn]'); await pW.waitForSelector('[data-testid=gate]');
    const qW = await pW.textContent('[data-testid=gate-q]'); const [, wa, wb] = qW.match(/(\d+) × (\d+)/);
    await pW.click(`[data-testid=gate-option]:not([data-n="${wa * wb}"])`);
    await pW.waitForTimeout(400);
    check((await pW.locator('[data-testid=game-menu]').count()) === 0 && (await sceneId(pW)) === sidW && (await pW.locator('[data-testid=tile]').count()) > 0, 'a wrong gate answer inside a game opens nothing and the game carries on');
    await pW.click('[data-testid=parent-btn]');
    await pW.waitForSelector('[data-testid=gate-locked]', { timeout: 4000 }).catch(() => {});
    check((await pW.locator('[data-testid=gate-locked]').count()) === 1 && (await pW.locator('[data-testid=gate-option]').count()) === 0, 'the gate is locked for a while after a wrong answer (no answers to guess)');
    check(errW.length === 0, 'no page errors after a wrong gate answer');
    await cW.close();

    // Reduce Motion: the menu works the same
    const { c: cR, pg: pR, errs: errR } = await open({ reducedMotion: 'reduce' });
    await pR.click('[data-testid=freeplay]'); await pR.click('[data-testid=fp-feed]'); await pR.waitForSelector('[data-testid=tile]');
    await gearMenu(pR); await pR.click('[data-testid=menu-keep]');
    check((await pR.locator('[data-testid=tile]').count()) > 0 && errR.length === 0, 'with Reduce Motion the grown-up menu opens and closes and the game carries on');
    await cR.close();
  }

  log('DRAG with a real MOUSE (and a finger): human-like variations, sloppy clicks, off-target drops, right-click, lost releases, page zoom');
  {
    const SEED = () => {
      try {
        const day = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
        const sounds = {}; for (const id of ['s', 'a', 't', 'p', 'i', 'n', 'm', 'd', 'g', 'o', 'c', 'k']) sounds[id] = { introducedOn: day(5), attempts: 6, correct: 6, correctDays: [day(3), day(2), day(1)], dayTally: {}, box: 3, due: day(-3), boxDay: null };
        localStorage.setItem('soundling.proto.v1', JSON.stringify({ nickname: 'Drag', band: 'C', accent: 'rp', tracing: false, musicOn: false, easyTap: false, soundButtons: 'always', theme: 'dino', companion: { kind: 'rexy', name: 'Dino' }, startSet: 2, sounds, words: {}, collection: [], adventureDays: [], lastIntroDay: null, dayOffset: 0, playMs: {}, dailyLimitMin: 30, version: 1 }));
      } catch { /* ignore */ }
    };
    const openFp = async (game, o = {}) => {
      const vp = o.vp || [VW, VH];
      const c = await browser.newContext({ viewport: { width: vp[0], height: vp[1] }, deviceScaleFactor: o.dsf || 1, hasTouch: !!o.touch });
      await c.addInitScript(TOOLS); await c.addInitScript(SEED);
      const pg = await c.newPage(); const errs = []; pg.on('pageerror', (e) => errs.push(String(e)));
      await pg.goto(url + '?fpRounds=9'); await pg.waitForSelector('[data-testid=freeplay]');
      await pg.click('[data-testid=freeplay]'); await pg.click(`[data-testid=fp-${game}]`);
      return { c, pg, errs };
    };
    const bx = async (pg, sel) => pg.locator(sel).first().boundingBox();
    const mid = (b) => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 });
    const lin = (a, b, n) => Array.from({ length: n }, (_, i) => ({ x: a.x + ((b.x - a.x) * (i + 1)) / n, y: a.y + ((b.y - a.y) * (i + 1)) / n }));
    const go = async (pg, pts, d = 0) => { for (const q of pts) { await pg.mouse.move(q.x, q.y); if (d) await pg.waitForTimeout(d); } };
    /** after a gesture that must NOT place anything: no tile is left carried, shifted, lit or following a hovering mouse */
    const clean = async (pg, tgt) => {
      await pg.waitForTimeout(700);
      const b = await bx(pg, tgt); await pg.mouse.move(b.x + 4, b.y + 4); await pg.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 4 }); await pg.waitForTimeout(100);
      return pg.evaluate(() => ({
        stuck: [...document.querySelectorAll('#stage .tile')].filter((e) => !e.hasAttribute('disabled') && !e.dataset.busy && (e.style.transform || e.classList.contains('dragging') || e.style.opacity)).length,
        hot: !!document.querySelector('.mouthzone.hot, .rocket.hot, .board.hot'), dim: document.querySelectorAll('#stage .tile.dim').length,
      }));
    };
    const advanced = async (pg, sid) => { await scenePast(pg, sid); return (await sceneId(pg)) !== sid; };
    const nextTile = async (pg, sel) => { await pg.waitForSelector(sel); await pg.waitForTimeout(800); return sel; };

    // ---- Feed the Creature (letter into the mouth) ----
    {
      const { c, pg, errs } = await openFp('feed');
      const R = '[data-testid=tile][data-answer="1"]', M = '[data-testid=mouth]';
      await nextTile(pg, R);
      let sid = await sceneId(pg), a = mid(await bx(pg, R)), mb = await bx(pg, M), t = mid(mb);
      // a drop just outside the forgiveness area springs back: nothing placed, nothing marked wrong, nothing stuck
      await pg.mouse.move(a.x, a.y); await pg.mouse.down(); await go(pg, lin(a, { x: mb.x + mb.width + 95, y: t.y }, 14), 12); await pg.mouse.up();
      let cl = await clean(pg, M);
      check((await sceneId(pg)) === sid && cl.stuck === 0 && !cl.hot && cl.dim === 0, 'mouse: a drop just outside the target springs back with no penalty and nothing left stuck');
      // right-click and a right-button drag never pick a tile up, and the tile does not follow the mouse afterwards
      await pg.mouse.move(a.x, a.y); await pg.mouse.down({ button: 'right' }); await go(pg, lin(a, t, 12), 12); await pg.mouse.up({ button: 'right' });
      cl = await clean(pg, M);
      check((await sceneId(pg)) === sid && cl.stuck === 0 && cl.dim === 0, 'mouse: right-click / right-button drag does nothing and no tile follows the cursor afterwards');
      // the release never reaches the page (menu, other window): a later hover must not keep dragging
      await pg.mouse.move(a.x, a.y); await pg.mouse.down(); await go(pg, lin(a, { x: a.x + 60, y: a.y - 70 }, 6), 10);
      await pg.evaluate(() => { document.querySelector('[data-testid=tile]').dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, pointerType: 'mouse', buttons: 0, clientX: 30, clientY: 30, bubbles: true })); });
      await pg.mouse.up(); cl = await clean(pg, M);
      check(cl.stuck === 0 && !cl.hot, 'mouse: a lost button release (hover move with no button) ends the drag instead of sticking the tile to the cursor');
      // released outside the window
      sid = await sceneId(pg);
      await pg.mouse.move(a.x, a.y); await pg.mouse.down(); await go(pg, lin(a, { x: a.x, y: a.y - 150 }, 5), 10); await pg.mouse.move(-40, -40, { steps: 3 }); await pg.mouse.up();
      cl = await clean(pg, M);
      check((await sceneId(pg)) === sid && cl.stuck === 0 && cl.dim === 0, 'mouse: a release outside the window sends the tile home (no stuck tile, no penalty)');
      // a clumsy CLICK that moves 14 px is a tap, not a failed drag: it places the letter at once (and is not a wrong answer)
      await pg.mouse.move(a.x, a.y); await pg.mouse.down(); await go(pg, [{ x: a.x + 8, y: a.y + 11 }], 30); await pg.waitForTimeout(40); await pg.mouse.up();
      check(await advanced(pg, sid) && (await pg.locator('#stage .tile.dim').count()) === 0, 'mouse: a sloppy click (14 px of movement) counts as a tap and places the letter');
      // fast flick: only two pointer-move events
      await nextTile(pg, R); sid = await sceneId(pg); a = mid(await bx(pg, R)); t = mid(await bx(pg, M));
      await pg.mouse.move(a.x, a.y); await pg.mouse.down(); await pg.mouse.move((a.x + t.x) / 2, (a.y + t.y) / 2); await pg.mouse.move(t.x, t.y); await pg.mouse.up();
      check(await advanced(pg, sid), 'mouse: a fast flick (two move events) onto the mouth is accepted');
      // re-grab while the tile is still springing back, then a slow jittery drop
      await nextTile(pg, R); sid = await sceneId(pg); a = mid(await bx(pg, R)); t = mid(await bx(pg, M));
      await pg.mouse.move(a.x, a.y); await pg.mouse.down(); await go(pg, lin(a, { x: a.x + 150, y: a.y + 150 }, 6), 8); await pg.mouse.up(); await pg.waitForTimeout(90);
      const a2 = mid(await bx(pg, R)); await pg.mouse.move(a2.x, a2.y); await pg.mouse.down(); await go(pg, lin(a2, t, 22).map((q, i) => ({ x: q.x + ((i * 7) % 9) - 4, y: q.y + ((i * 5) % 9) - 4 })), 14); await go(pg, [t], 10); await pg.mouse.up();
      check(await advanced(pg, sid), 'mouse: grabbing the tile again in the middle of its spring-back works (it follows the cursor at once)');
      // slow drag
      await nextTile(pg, R); sid = await sceneId(pg); a = mid(await bx(pg, R)); t = mid(await bx(pg, M));
      await pg.mouse.move(a.x, a.y); await pg.mouse.down(); await go(pg, lin(a, t, 30), 22); await pg.mouse.up();
      check(await advanced(pg, sid), 'mouse: a slow careful drag onto the mouth is accepted');
      // a wrong letter dragged in, then the right one: the second drag still works
      await nextTile(pg, R); sid = await sceneId(pg);
      const W = '[data-testid=tile][data-answer="0"]'; if (await pg.locator(W).count()) {
        const w = mid(await bx(pg, W)); t = mid(await bx(pg, M)); await pg.mouse.move(w.x, w.y); await pg.mouse.down(); await go(pg, lin(w, t, 12), 12); await pg.mouse.up(); await pg.waitForTimeout(900);
        a = mid(await bx(pg, R)); await pg.mouse.move(a.x, a.y); await pg.mouse.down(); await go(pg, lin(a, t, 12), 12); await pg.mouse.up();
        check(await advanced(pg, sid), 'mouse: after a wrong letter the right one can still be dragged in');
      }
      check(errs.length === 0, `Feed: no page errors during the mouse variations${errs.length ? ': ' + errs[0] : ''}`);
      await c.close();
    }
    // ---- Rhyme Rocket (picture into the rocket) ----
    {
      const { c, pg, errs } = await openFp('rhyme');
      const R = '[data-testid=pic][data-answer="1"]', K = '.rocket';
      await nextTile(pg, R);
      let sid = await sceneId(pg), a = mid(await bx(pg, R)), kb = await bx(pg, K), t = mid(kb);
      await pg.mouse.move(a.x, a.y); await pg.mouse.down(); await go(pg, lin(a, { x: kb.x + kb.width + 120, y: t.y }, 14), 12); await pg.mouse.up();
      let cl = await clean(pg, K);
      check((await sceneId(pg)) === sid && cl.stuck === 0 && !cl.hot && cl.dim === 0, 'Rhyme, mouse: a drop beside the rocket springs back cleanly');
      await pg.mouse.move(a.x, a.y); await pg.mouse.down(); await go(pg, [{ x: a.x + 10, y: a.y + 10 }], 30); await pg.waitForTimeout(40); await pg.mouse.up();
      check(await advanced(pg, sid), 'Rhyme, mouse: a sloppy click (14 px) places the picture in the rocket');
      await nextTile(pg, R); sid = await sceneId(pg); a = mid(await bx(pg, R)); t = mid(await bx(pg, K));
      await pg.mouse.move(a.x, a.y); await pg.mouse.down(); await pg.mouse.move(t.x, t.y); await pg.mouse.up();
      check(await advanced(pg, sid), 'Rhyme, mouse: a single-event flick into the rocket is accepted');
      check(errs.length === 0, 'Rhyme: no page errors');
      await c.close();
    }
    // ---- Word Kitchen (tile onto the board) ----
    {
      const { c, pg, errs } = await openFp('kitchen');
      const T = '[data-testid=ktile]', B = '[data-testid=board]';
      await nextTile(pg, T);
      let a = mid(await bx(pg, T)), bb = await bx(pg, B), t = mid(bb);
      const filled = () => pg.locator('.kslot.filled').count();
      await pg.mouse.move(a.x, a.y); await pg.mouse.down({ button: 'right' }); await go(pg, lin(a, t, 12), 12); await pg.mouse.up({ button: 'right' });
      check((await filled()) === 0 && (await clean(pg, B)).stuck === 0, 'Kitchen, mouse: a right-button drag places nothing and leaves nothing stuck');
      await pg.mouse.move(a.x, a.y); await pg.mouse.down(); await go(pg, lin(a, { x: bb.x + bb.width + 160, y: t.y }, 12), 12); await pg.mouse.up();
      check((await filled()) === 0 && (await clean(pg, B)).stuck === 0, 'Kitchen, mouse: a drop beside the board springs back');
      a = mid(await bx(pg, T)); await pg.mouse.move(a.x, a.y); await pg.mouse.down(); await go(pg, lin(a, { x: a.x + 160, y: a.y - 60 }, 5), 8); await pg.mouse.up(); await pg.waitForTimeout(50);
      const a3 = mid(await bx(pg, T)); await pg.mouse.move(a3.x, a3.y); await pg.mouse.down(); await go(pg, lin(a3, t, 14), 12); await pg.mouse.up(); await pg.waitForTimeout(500);
      check((await filled()) === 1, 'Kitchen, mouse: a quick re-grab right after a drop works and the tile lands in a slot');
      const T2 = `${T}:not(.used)`; const a4 = mid(await bx(pg, T2)); await pg.mouse.move(a4.x, a4.y); await pg.mouse.down(); await go(pg, [{ x: a4.x + 6, y: a4.y + 9 }], 30); await pg.waitForTimeout(40); await pg.mouse.up(); await pg.waitForTimeout(500);
      check((await filled()) === 2, 'Kitchen, mouse: a sloppy click (11 px) places the letter in the next free slot');
      check(errs.length === 0, 'Kitchen: no page errors');
      await c.close();
    }
    // ---- Bridge Builder (slide to blend) ----
    {
      const { c, pg, errs } = await openFp('bridge');
      await pg.waitForSelector('[data-testid=soundbutton]'); await pg.waitForTimeout(700);
      const n = await pg.locator('[data-testid=soundbutton]').count();
      for (let i = 0; i < n; i++) { await pg.locator('[data-testid=soundbutton]').nth(i).click({ force: true }); await pg.waitForTimeout(380); }
      await pg.waitForSelector('[data-testid=wordchoice]'); await pg.waitForTimeout(1500);
      await pg.evaluate(() => { window.__m = 0; new MutationObserver(() => { if (document.querySelector('.word.merge')) window.__m++; }).observe(document.querySelector('[data-testid=word]'), { attributes: true }); });
      const merged = () => pg.evaluate(() => window.__m > 0);
      const reset = async () => { await pg.waitForTimeout(1700); await pg.evaluate(() => { window.__m = 0; }); };
      const row = await bx(pg, '[data-testid=word]'); const y = row.y + row.height * 0.3;
      await pg.mouse.move(row.x + 4, y); await pg.mouse.down(); await pg.mouse.move(row.x + row.width - 4, y); await pg.mouse.up(); await pg.waitForTimeout(500);
      check(await merged(), 'Bridge, mouse: a one-event flick across the word blends it'); await reset();
      await pg.mouse.move(row.x + 4, y); await pg.mouse.down(); await go(pg, lin({ x: row.x + 4, y }, { x: row.x + row.width * 0.55, y }, 8), 15); await go(pg, lin({ x: row.x + row.width * 0.55, y }, { x: row.x + row.width * 0.25, y }, 5), 15); await go(pg, lin({ x: row.x + row.width * 0.25, y }, { x: row.x + row.width - 4, y }, 14), 15); await pg.mouse.up(); await pg.waitForTimeout(500);
      check(await merged(), 'Bridge, mouse: wandering back and forth while sliding still blends'); await reset();
      await pg.mouse.move(row.x - 30, y); await pg.mouse.down(); await go(pg, lin({ x: row.x - 30, y }, { x: row.x + row.width, y: y + 40 }, 24), 15); await pg.mouse.up(); await pg.waitForTimeout(500);
      check(await merged(), 'Bridge, mouse: a swipe that starts left of the word and drifts down blends it'); await reset();
      await pg.mouse.move(row.x + 4, y); await pg.mouse.down({ button: 'right' }); await go(pg, lin({ x: row.x + 4, y }, { x: row.x + row.width - 4, y }, 24), 15); await pg.mouse.up({ button: 'right' }); await pg.waitForTimeout(500);
      check(!(await merged()), 'Bridge, mouse: a right-button swipe does not blend');
      check(errs.length === 0, 'Bridge: no page errors');
      await c.close();
    }
    // ---- Trace Trail ----
    {
      const { c, pg, errs } = await openFp('trace');
      await pg.waitForSelector('[data-testid=trace-svg]'); await pg.waitForTimeout(1200);
      const pts = await pg.evaluate(() => { const g = document.querySelector('[data-testid=trace-guide]'); const m = document.querySelector('[data-testid=trace-svg]').getScreenCTM(); const n = g.getTotalLength(); return Array.from({ length: 61 }, (_, i) => { const p = g.getPointAtLength((n * i) / 60); const q = new DOMPoint(p.x, p.y).matrixTransform(m); return { x: q.x, y: q.y }; }); });
      const frac = () => pg.evaluate(() => { const i = document.querySelector('.ink'); const d = parseFloat(i.style.strokeDasharray), o = parseFloat(i.style.strokeDashoffset); return d ? 1 - o / d : 0; });
      await pg.mouse.move(pts[0].x, pts[0].y); await pg.mouse.down({ button: 'right' }); await go(pg, pts.slice(1), 10); await pg.mouse.up({ button: 'right' });
      check((await frac()) < 0.05, 'Trace, mouse: a right-button stroke does not draw');
      await pg.mouse.move(pts[0].x, pts[0].y); await pg.mouse.down(); await go(pg, pts.filter((_, i) => i % 15 === 0 || i === 60).slice(1)); await pg.mouse.up(); await pg.waitForTimeout(400);
      check((await frac()) > 0.95, 'Trace, mouse: a fast stroke with only a few move events still traces the whole trail');
      check(errs.length === 0, 'Trace: no page errors');
      await c.close();
    }
    // ---- page zoom 150% / a short window: the tiles AND the target must both be on screen, and a drag still works ----
    for (const [game, tile, tgt] of [['feed', '[data-testid=tile][data-answer="1"]', '[data-testid=mouth]'], ['rhyme', '[data-testid=pic][data-answer="1"]', '.rocket'], ['kitchen', '[data-testid=ktile]', '[data-testid=board]']]) {
      const { c, pg } = await openFp(game, { vp: [787, 547], dsf: 1.5 });
      await nextTile(pg, tile);
      const m = await pg.evaluate(([a, b]) => { const A = document.querySelector(a).getBoundingClientRect(), B = document.querySelector(b).getBoundingClientRect(); return { low: A.bottom, top: B.top, ih: innerHeight }; }, [tile, tgt]);
      check(m.low <= m.ih && m.top >= 0, `page zoom 150% (787x547): the ${game} tiles and the target are both on screen (tile bottom ${Math.round(m.low)} of ${m.ih})`);
      const sid = await sceneId(pg), a = mid(await bx(pg, tile)), t = mid(await bx(pg, tgt));
      await pg.mouse.move(a.x, a.y); await pg.mouse.down(); await go(pg, lin(a, t, 16), 12); await pg.mouse.up();
      check(game === 'kitchen' ? (await pg.locator('.kslot.filled').count()) === 1 : await advanced(pg, sid), `page zoom 150%: a mouse drag works in ${game}`);
      await c.close();
    }
    // ---- a finger (real touch events): slow drag and a flick ----
    {
      const { c, pg } = await openFp('feed', { touch: true });
      const cdp = await c.newCDPSession(pg);
      const touch = async (pts, d) => { const ev = (type, p) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: p ? [{ x: p.x, y: p.y }] : [] }); await ev('touchStart', pts[0]); for (const q of pts.slice(1)) { await ev('touchMove', q); if (d) await pg.waitForTimeout(d); } await ev('touchEnd'); };
      const R = '[data-testid=tile][data-answer="1"]', M = '[data-testid=mouth]';
      await nextTile(pg, R); let sid = await sceneId(pg); let a = mid(await bx(pg, R)), t = mid(await bx(pg, M));
      await touch([a, ...lin(a, t, 18)], 18);
      check(await advanced(pg, sid), 'touch: a finger drag onto the mouth is accepted');
      await nextTile(pg, R); sid = await sceneId(pg); a = mid(await bx(pg, R)); t = mid(await bx(pg, M));
      await touch([a, { x: (a.x + t.x) / 2, y: (a.y + t.y) / 2 }, t]);
      check(await advanced(pg, sid), 'touch: a quick flick of the finger is accepted');
      await c.close();
    }
  }

  log('REDUCE MOTION (spec: respect the OS setting)');
  const ctxRM = await browser.newContext({ viewport: { width: VW, height: VH }, reducedMotion: 'reduce' });
  const pageRM = await ctxRM.newPage();
  await pageRM.goto(url);
  await pageRM.waitForSelector('[data-testid=gate]');
  const rm = await pageRM.evaluate(() => ({
    cloud: getComputedStyle(document.querySelector('#scene-bg .cloud')).animationName,
    rays: getComputedStyle(document.querySelector('#scene-bg .rays')).animationName,
    scene: getComputedStyle(document.querySelector('#stage')).animationDuration,
  }));
  check(rm.cloud === 'none' && rm.rays === 'none', `backdrop animations are off under Reduce Motion (cloud=${rm.cloud}, rays=${rm.rays})`);

  log('BAND B (ages 2-3, Sound Play, co-play only)');
  const pageB = await newPageWithTools({ viewport: { width: VW, height: VH }, hasTouch: MOBILE, isMobile: MOBILE });
  await pageB.goto(url);
  await passGate(pageB);
  check((await pageB.locator('[data-testid=band-help]').count()) === 1, 'setup says which band to choose when unsure (a 3-year-old sits between Sound Play and the journey)');
  await pageB.fill('[data-testid=nick]', 'Wee');
  await pageB.click('[data-testid=band-B]');
  await pageB.click('[data-testid=setup-next]');
  await pageB.click('[data-testid=hatch]');
  await pageB.click('[data-testid=next]');
  await pageB.waitForSelector('[data-testid=play]');
  await pageB.click('[data-testid=play]');
  check(/grown-up/i.test(await pageB.textContent('[data-testid=coplay]')), 'Sound Play opens with "Find a grown-up to play with you"');
  await pageB.click('[data-testid=next]');
  let letters = 0, beats = 0, finds = 0;
  for (let step = 0; step < 40; step++) {
    await pageB.waitForTimeout(250);
    letters += await pageB.locator('[data-letter]').count();
    if (await pageB.locator('[data-testid=beat-drum]').count()) {
      beats++;
      const n = Number(await pageB.getAttribute('[data-testid=beat-drum]', 'data-n'));
      const sid = await sceneId(pageB);
      await pageB.waitForFunction(() => /your turn/i.test(document.querySelector('[data-testid=caption]')?.textContent || ''), null, { timeout: 15000 });
      for (let i = 0; i < n; i++) { await pageB.click('[data-testid=beat-drum]'); await pageB.waitForTimeout(150); }
      await scenePast(pageB, sid);
    } else if (await pageB.locator('[data-testid=pic]').count()) {
      finds++;
      const sid = await sceneId(pageB);
      await pageB.locator('[data-testid=pic][data-answer="0"]').first().click(); // a wrong tap only names that picture
      await pageB.locator('[data-testid=pic][data-answer="1"]').click();
      await scenePast(pageB, sid);
    } else if (await pageB.locator('[data-testid=next]').count()) {
      const caption = await pageB.textContent('[data-testid=caption]').catch(() => '');
      if (/goodnight|tomorrow/i.test(caption || '')) break;
      await pageB.click('[data-testid=next]');
    }
  }
  check(beats === 3 && finds === 4, `Sound Play for age 2-3: 3 "copy the beat" rounds and 4 "find the..." rounds (got ${beats} and ${finds}), both tap-only`);
  check(letters === 0, 'no letters shown in Sound Play (listening only)');
  const stB = await pageB.evaluate(() => JSON.parse(localStorage.getItem('soundling.proto.v1')));
  check(stB.band === 'B' && Object.keys(stB.sounds).length === 0, 'band B records no letter-sound mastery');
  check(stB.adventureDays.length === 1, 'Sound Play counts as a day played (so the grown-up sees it)');
  if (await pageB.locator('[data-testid=next]').count()) await pageB.click('[data-testid=next]'); // (the loop above may already have clicked through goodnight)
  await pageB.waitForSelector('[data-testid=greeting]');
  await pageB.click('[data-testid=parent-btn]'); await passGate(pageB);
  check(/Sound Play done today/.test(await pageB.textContent('[data-testid=today-sound]')), 'the grown-up Today tab says Sound Play was done (it used to say "No adventure played yet today")');
  await pageB.click('[data-testid=tab-week]');
  check(/Played on 1 day/.test(await pageB.textContent('[data-testid=week-lines]')), 'the This week tab counts the Sound Play day');

  check(errors.length === 0, `no console/page errors${errors.length ? ': ' + errors.join(' | ') : ''}`);
  check(externalRequests.length === 0, `no third-party network requests${externalRequests.length ? ': ' + externalRequests.join(', ') : ''}`);
  await browser.close();
  if (FUN_TIMELINE) require('fs').writeFileSync(FUN_TIMELINE, JSON.stringify(timelines, null, 1));
  log(failures ? `\n${failures} FAILED` : '\nALL PASSED');
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error(e); if (errors.length) console.error('PAGE ERRORS:', errors); process.exit(1); });
