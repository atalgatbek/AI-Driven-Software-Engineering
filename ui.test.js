// UI behaviour / integration tests in a real headless browser (Playwright).
// Run: npm run test:ui   (needs: npm install && npx playwright install chromium)
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  chromium = null;
}
const SKIP = chromium ? false : "playwright not installed (run: npm install && npx playwright install chromium)";
const PAGE_URL = pathToFileURL(path.join(__dirname, "..", "..", "index.html")).href;

let browser;
test.before(async () => {
  if (chromium) browser = await chromium.launch();
});
test.after(async () => {
  if (browser) await browser.close();
});

async function openApp(viewport = { width: 1100, height: 900 }) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(PAGE_URL);
  return { page, errors };
}
const roomIds = (page) => page.$$eval("#room-list [data-room]", (cards) => cards.map((c) => c.dataset.room));
const resultCode = (page) => page.getAttribute("#result .msg", "data-code");

async function checkTime(page, start, end) {
  await page.fill("#start", start);
  await page.fill("#end", end);
  await page.click("#check-button");
}

test("UI: start-up shows all rooms, first room selected, no script errors", { skip: SKIP }, async () => {
  const { page, errors } = await openApp();
  assert.deepEqual(await roomIds(page), ["A-101", "B-204", "C-310", "D-012", "E-115"]);
  assert.equal(await page.textContent("#match-count"), "5 of 5 rooms match");
  assert.equal(await page.isChecked('input[name="room"][value="A-101"]'), true);
  assert.match(await page.textContent("#bookings-title"), /A-101/);
  assert.deepEqual(errors, []);
  await page.close();
});

test("UI: successful filtering by capacity and equipment (F1, F2)", { skip: SKIP }, async () => {
  const { page } = await openApp();
  await page.fill("#attendees", "25");
  assert.deepEqual(await roomIds(page), ["A-101", "C-310"]);
  await page.check('input[name="equipment"][value="computers"]');
  assert.deepEqual(await roomIds(page), ["C-310"]);
  assert.equal(await page.textContent("#match-count"), "1 of 5 rooms match");
  await page.close();
});

test("UI: unsuccessful filtering shows a clear empty state and disables the check (F4)", { skip: SKIP }, async () => {
  const { page } = await openApp();
  await checkTime(page, "17:00", "18:00");
  assert.equal(await resultCode(page), "AVAILABLE");
  await page.fill("#attendees", "100");
  assert.equal(await page.isVisible('[data-testid="empty-state"]'), true);
  assert.match(await page.textContent('[data-testid="empty-state"]'), /No rooms match/);
  assert.equal(await page.isDisabled("#check-button"), true);
  assert.equal(await page.$("#result .msg"), null, "old result is cleared, not left for a missing room");
  await page.fill("#attendees", "2.5"); // a number input cannot hold text, but it accepts decimals
  assert.match(await page.textContent('[data-testid="empty-state"]'), /whole number/);
  await page.close();
});

test("UI: switching room refreshes the availability result (F5, F3)", { skip: SKIP }, async () => {
  const { page } = await openApp();
  await page.check('input[name="room"][value="B-204"]');
  await checkTime(page, "11:00", "12:00");
  assert.equal(await resultCode(page), "AVAILABLE");
  assert.match(await page.textContent("#result"), /Seminar Room B-204/);

  await page.check('input[name="room"][value="C-310"]');
  assert.equal(await resultCode(page), "CONFLICT");
  assert.match(await page.textContent("#result"), /Python workshop/);
  assert.match(await page.textContent("#bookings-title"), /C-310/);

  await page.check('input[name="room"][value="E-115"]');
  assert.equal(await resultCode(page), "ROOM_BLOCKED");
  await page.close();
});

test("UI: when a filter removes the selected room, selection and result move to a matching room", { skip: SKIP }, async () => {
  const { page } = await openApp();
  await page.check('input[name="room"][value="D-012"]');
  await checkTime(page, "11:00", "12:00");
  assert.equal(await resultCode(page), "CONFLICT");
  await page.fill("#attendees", "20"); // D-012 has capacity 8
  assert.equal(await page.isChecked('input[name="room"][value="A-101"]'), true);
  assert.equal(await resultCode(page), "AVAILABLE");
  assert.match(await page.textContent("#result"), /A-101/);
  await page.close();
});

test("UI: original time rules still work in the page (AC1, AC2, AC4, AC6)", { skip: SKIP }, async () => {
  const { page } = await openApp();
  await page.check('input[name="room"][value="B-204"]');
  const cases = [
    ["07:00", "09:30", "IN_PAST"],
    ["16:30", "18:30", "AVAILABLE"],
    ["16:30", "18:31", "TOO_LONG"],
    ["11:00", "12:30", "AVAILABLE"],
    ["10:30", "11:30", "CONFLICT"],
  ];
  for (const [s, e, code] of cases) {
    await checkTime(page, s, e);
    assert.equal(await resultCode(page), code, s + "–" + e);
  }
  assert.equal(await page.getAttribute("#result", "aria-live"), "polite");
  await page.close();
});

test("UI: layout is responsive on a 375px phone screen (AC6)", { skip: SKIP }, async () => {
  const { page } = await openApp({ width: 375, height: 800 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.equal(overflow, 0, "no horizontal scrolling");
  const columns = await page.$eval(".layout", (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length);
  assert.equal(columns, 1);
  await page.close();
});
