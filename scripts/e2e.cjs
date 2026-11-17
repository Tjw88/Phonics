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
