// Captures demo screenshots for the report (successful / unsuccessful filtering,
// room switching, availability checks, mobile layout).
// Usage: npm run screenshots   -> evidence/screenshots/*.png
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

const ROOT = path.join(__dirname, "..");
const URL = pathToFileURL(path.join(ROOT, "index.html")).href;
const OUT = (name) => path.join(ROOT, "evidence", "screenshots", name);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1100, height: 760 } });
  const shot = async (name) => {
    await page.screenshot({ path: OUT(name), fullPage: true });
    console.log("saved", name);
  };
  const check = async (s, e) => {
    await page.fill("#start", s);
    await page.fill("#end", e);
    await page.click("#check-button");
  };

  await page.goto(URL);
  await shot("01-start-all-rooms.png");

  await page.fill("#attendees", "25");
  await page.check('input[name="equipment"][value="computers"]');
  await check("16:00", "17:30");
  await shot("02-filter-success-C310-available.png");

  await page.fill("#attendees", "100");
  await shot("03-filter-empty-state.png");

  await page.fill("#attendees", "1");
  await page.uncheck('input[name="equipment"][value="computers"]');
  await page.check('input[name="room"][value="B-204"]');
  await check("11:00", "12:00");
  await shot("04-B204-available.png");

  await page.check('input[name="room"][value="C-310"]');
  await shot("05-switch-to-C310-conflict.png");

  await page.check('input[name="room"][value="E-115"]');
  await shot("06-switch-to-E115-blocked.png");

  await page.check('input[name="room"][value="B-204"]');
  await check("16:30", "18:31");
  await shot("07-B204-121-minutes-rejected.png");

  const phone = await browser.newPage({ viewport: { width: 375, height: 760 } });
  await phone.goto(URL);
  await phone.check('input[name="room"][value="C-310"]');
  await phone.fill("#start", "11:00");
  await phone.fill("#end", "12:00");
  await phone.click("#check-button");
  await phone.screenshot({ path: OUT("08-mobile-375px.png"), fullPage: true });
  console.log("saved 08-mobile-375px.png");

  await browser.close();
})();
