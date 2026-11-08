// Baseline regression tests for the Assignment #03 single-room prototype.
// Run: node --test tests/
const test = require("node:test");
const assert = require("node:assert/strict");
const { checkAvailability, ROOM, BOOKINGS } = require("../app.js");

const check = (s, e, room = ROOM) => checkAvailability(s, e, BOOKINGS, room);

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
test("AC2: exactly 120 minutes is accepted", () => {
  assert.equal(check("16:30", "18:30").ok, true);
});
test("AC2: 121 minutes is rejected", () => {
  assert.equal(check("16:30", "18:31").code, "TOO_LONG");
});
test("AC3: blocked room is never available", () => {
  assert.equal(check("17:00", "18:00", { ...ROOM, blocked: true }).code, "ROOM_BLOCKED");
});
test("AC4: touching interval (ends when a booking starts) is accepted", () => {
  assert.equal(check("11:00", "12:30").ok, true);
});
test("AC4: overlapping interval is rejected", () => {
  assert.equal(check("10:30", "11:30").code, "CONFLICT");
});
test("AC5: checking does not change booking data", () => {
  const before = JSON.stringify(BOOKINGS);
  check("10:30", "11:30");
  check("17:00", "18:00");
  assert.equal(JSON.stringify(BOOKINGS), before);
  assert.ok(Object.isFrozen(BOOKINGS) && BOOKINGS.every(Object.isFrozen));
});
