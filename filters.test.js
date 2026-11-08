// F1–F5 unit tests for the room catalog, filtering and per-room availability.
const test = require("node:test");
const assert = require("node:assert/strict");
const { ROOMS } = require("../../src/data/rooms.js");
const { filterRooms, parseAttendees, hasCapacity, hasAllEquipment } = require("../../src/domain/filters.js");
const { checkAvailability } = require("../../src/domain/availability.js");

const ids = (rooms) => rooms.map((r) => r.id);
const room = (id) => ROOMS.find((r) => r.id === id);

test("Catalog: at least four rooms, each with id, name, capacity, equipment, blocked, bookings", () => {
  assert.ok(ROOMS.length >= 4);
  for (const r of ROOMS) {
    assert.equal(typeof r.id, "string");
    assert.equal(typeof r.name, "string");
    assert.ok(Number.isInteger(r.capacity) && r.capacity > 0);
    assert.ok(Array.isArray(r.equipment));
    assert.equal(typeof r.blocked, "boolean");
    assert.ok(Array.isArray(r.bookings));
  }
  assert.equal(new Set(ids(ROOMS)).size, ROOMS.length, "room ids are unique");
});

test("F1 boundary: exact capacity is included (24 attendees -> B-204 cap 24)", () => {
  assert.equal(hasCapacity(room("B-204"), 24), true);
  assert.ok(ids(filterRooms(ROOMS, { attendees: 24, equipment: [] })).includes("B-204"));
});

test("F1 boundary: insufficient capacity is excluded (25 attendees -> no B-204)", () => {
  assert.equal(hasCapacity(room("B-204"), 25), false);
  assert.deepEqual(ids(filterRooms(ROOMS, { attendees: 25, equipment: [] })), ["A-101", "C-310"]);
});

test("F2: room must contain ALL selected items, not just one", () => {
  assert.equal(hasAllEquipment(room("B-204"), ["projector", "computers"]), false);
  assert.deepEqual(ids(filterRooms(ROOMS, { attendees: 1, equipment: ["projector", "computers"] })), ["C-310"]);
});

test("F2: no equipment selected means no equipment restriction", () => {
  assert.equal(filterRooms(ROOMS, { attendees: 1, equipment: [] }).length, ROOMS.length);
});

test("F1+F2 combined: 10 people with video conference -> only E-115 (blocked)", () => {
  assert.deepEqual(ids(filterRooms(ROOMS, { attendees: 10, equipment: ["video-conference"] })), ["E-115"]);
});

test("F3: blocked room may match filters but is never reported as available", () => {
  const studio = room("E-115");
  assert.equal(studio.blocked, true);
  assert.equal(studio.bookings.length, 0, "no bookings, so only the blocked rule can refuse it");
  const r = checkAvailability(studio, "17:00", "18:00");
  assert.equal(r.ok, false);
  assert.equal(r.code, "ROOM_BLOCKED");
});

test("F4: impossible requirements give an empty list (UI shows empty state)", () => {
  assert.deepEqual(filterRooms(ROOMS, { attendees: 100, equipment: [] }), []);
  assert.deepEqual(filterRooms(ROOMS, { attendees: 1, equipment: ["computers", "microphone"] }), []);
});

test("F5: the check uses the selected room's own bookings (same time, different rooms)", () => {
  const results = Object.fromEntries(ROOMS.map((r) => [r.id, checkAvailability(r, "11:00", "12:00").code]));
  assert.deepEqual(results, {
    "A-101": "AVAILABLE",
    "B-204": "AVAILABLE", // touches "Algorithms lab" 10:00–11:00
    "C-310": "CONFLICT", // "Python workshop" 10:00–12:00
    "D-012": "CONFLICT", // "Robotics club meeting" 11:00–11:30
    "E-115": "ROOM_BLOCKED",
  });
  assert.equal(checkAvailability(room("C-310"), "11:00", "12:00").roomId, "C-310");
});

test("Attendees input validation", () => {
  assert.deepEqual(parseAttendees("12"), { ok: true, value: 12 });
  assert.equal(parseAttendees("").code, "ATTENDEES_MISSING");
  assert.equal(parseAttendees("2.5").code, "ATTENDEES_INVALID");
  assert.equal(parseAttendees("-3").code, "ATTENDEES_INVALID");
  assert.equal(parseAttendees("0").code, "ATTENDEES_RANGE");
  assert.equal(parseAttendees("501").code, "ATTENDEES_RANGE");
});

test("Filtering does not change the catalog (AC5)", () => {
  const before = JSON.stringify(ROOMS);
  const out = filterRooms(ROOMS, { attendees: 25, equipment: ["projector"] });
  assert.notEqual(out, ROOMS);
  assert.equal(JSON.stringify(ROOMS), before);
});
