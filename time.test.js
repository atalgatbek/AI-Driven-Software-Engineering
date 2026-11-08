const test = require("node:test");
const assert = require("node:assert/strict");
const { isValidTime, toMinutes, durationMinutes, intervalsOverlap } = require("../../src/domain/time.js");

test("time: HH:MM parsing and validation", () => {
  assert.equal(toMinutes("00:00"), 0);
  assert.equal(toMinutes("09:30"), 570);
  assert.equal(toMinutes("23:59"), 1439);
  for (const bad of ["9:30", "24:00", "12:60", "ab:cd", "", null, undefined]) {
    assert.equal(isValidTime(bad), false, String(bad));
  }
  assert.throws(() => toMinutes("25:00"), RangeError);
});

test("time: duration and half-open overlap", () => {
  assert.equal(durationMinutes("16:30", "18:30"), 120);
  assert.equal(intervalsOverlap(600, 660, 660, 720), false, "touching");
  assert.equal(intervalsOverlap(600, 661, 660, 720), true, "one minute overlap");
  assert.equal(intervalsOverlap(630, 640, 600, 720), true, "inside");
});
