// AC1–AC5 regression tests. Same inputs and expected codes as the original
// baseline suite (tag v1-baseline, tests/baseline.test.js), now run against the
// refactored API. Room B-204 has exactly the original Assignment #03 bookings.
const test = require("node:test");
const assert = require("node:assert/strict");
const { ROOMS } = require("../../src/data/rooms.js");
const { checkAvailability, validateRequest } = require("../../src/domain/availability.js");

const B204 = ROOMS.find((r) => r.id === "B-204");
const check = (s, e, room = B204) => checkAvailability(room, s, e);

test("AC1: invalid format is rejected", () => {
  assert.equal(check("9:00", "10:00").code, "INVALID_FORMAT");
});
test("AC1: end before start is rejected", () => {
  assert.equal(check("11:00", "10:00").code, "END_BEFORE_START");
});
test("AC1: start before fixed current time (09:30) is rejected", () => {
  assert.equal(check("09:00", "09:45").code, "IN_PAST");
});
test("AC1: outside opening hours is rejected", () => {
  assert.equal(check("19:00", "20:30").code, "OUTSIDE_HOURS");
});
test("AC1: empty start or end gives a clear message (moved from UI to domain)", () => {
  const r = check("", "10:00");
  assert.equal(r.code, "MISSING_TIME");
  assert.match(r.message, /fill in both/);
});
test("AC1/AC6: UI and domain use one validation order (07:00–09:30 is IN_PAST, not TOO_LONG)", () => {
  // Baseline bug R2: the UI's duplicated 120-minute check answered first.
  assert.equal(validateRequest("07:00", "09:30").code, "IN_PAST");
});
test("AC2 boundary: exactly 120 minutes is accepted", () => {
  assert.equal(check("16:30", "18:30").ok, true);
});
test("AC2 boundary: 121 minutes is rejected", () => {
  assert.equal(check("16:30", "18:31").code, "TOO_LONG");
});
test("AC3: blocked room is never available", () => {
  assert.equal(check("17:00", "18:00", { ...B204, blocked: true }).code, "ROOM_BLOCKED");
});
test("AC4 boundary: touching interval (ends when a booking starts) is accepted", () => {
  assert.equal(check("11:00", "12:30").ok, true);
});
test("AC4 boundary: touching interval (starts when a booking ends) is accepted", () => {
  assert.equal(check("16:30", "17:00").ok, true);
});
test("AC4 boundary: overlapping interval is rejected", () => {
  assert.equal(check("10:30", "11:30").code, "CONFLICT");
});
test("AC4 boundary: overlap by one minute is rejected", () => {
  assert.equal(check("10:59", "12:00").code, "CONFLICT");
});
test("AC5: checking does not change booking data, catalog is deep-frozen", () => {
  const before = JSON.stringify(ROOMS);
  for (const room of ROOMS) {
    check("10:30", "11:30", room);
    check("17:00", "18:00", room);
  }
  assert.equal(JSON.stringify(ROOMS), before);
  assert.ok(Object.isFrozen(ROOMS));
  assert.ok(ROOMS.every((r) => Object.isFrozen(r) && Object.isFrozen(r.bookings) && r.bookings.every(Object.isFrozen)));
  assert.throws(() => {
    "use strict";
    B204.bookings.push({ start: "18:00", end: "19:00" });
  }, TypeError);
});
