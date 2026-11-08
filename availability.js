// Booking rules (AC1–AC5). Pure functions: they read room data and never change it.
(function (root) {
  "use strict";
  const SC = (root.SmartCampus = root.SmartCampus || {});
  const isNode = typeof require === "function" && typeof module === "object";
  const time = isNode ? require("./time.js") : SC.time;
  const { CONFIG } = isNode ? require("../data/config.js") : SC.config;

  function result(ok, code, message, extra) {
    return Object.freeze(Object.assign({ ok, code, message }, extra));
  }

  // AC1 + AC2: the single validation path used by both the UI and the tests.
  function validateRequest(start, end, config) {
    const cfg = config || CONFIG;
    if (!start || !end) {
      return result(false, "MISSING_TIME", "Please fill in both start and end time.");
    }
    if (!time.isValidTime(start) || !time.isValidTime(end)) {
      return result(false, "INVALID_FORMAT", "Please enter start and end time as HH:MM.");
    }
    const s = time.toMinutes(start);
    const e = time.toMinutes(end);
    if (e <= s) {
      return result(false, "END_BEFORE_START", "End time must be after start time.");
    }
    if (s < time.toMinutes(cfg.now)) {
      return result(false, "IN_PAST", "Start time is in the past (current time is " + cfg.now + ").");
    }
    const { open, close } = cfg.openingHours;
    if (s < time.toMinutes(open) || e > time.toMinutes(close)) {
      return result(false, "OUTSIDE_HOURS", "The building is open from " + open + " to " + close + ".");
    }
    if (e - s > cfg.maxDurationMinutes) {
      return result(false, "TOO_LONG", "A booking can be at most " + cfg.maxDurationMinutes + " minutes.");
    }
    return result(true, "VALID", "Time is valid.");
  }

  // AC4: first booking that really overlaps [start, end), or null.
  function findConflict(bookings, start, end) {
    const s = time.toMinutes(start);
    const e = time.toMinutes(end);
    return (
      bookings.find((b) => time.intervalsOverlap(s, e, time.toMinutes(b.start), time.toMinutes(b.end))) || null
    );
  }

  // AC1–AC5 for ONE room, using that room's own bookings.
  function checkAvailability(room, start, end, config) {
    const extra = { roomId: room.id, start, end };
    const valid = validateRequest(start, end, config);
    if (!valid.ok) return result(false, valid.code, valid.message, extra);

    if (room.blocked) {
      return result(false, "ROOM_BLOCKED", room.name + " is blocked and cannot be booked.", extra);
    }
    const conflict = findConflict(room.bookings, start, end);
    if (conflict) {
      return result(
        false,
        "CONFLICT",
        'Conflict with "' + conflict.title + '" (' + conflict.start + "–" + conflict.end + ").",
        extra
      );
    }
    return result(true, "AVAILABLE", room.name + " is free from " + start + " to " + end + ".", extra);
  }

  const api = { validateRequest, findConflict, checkAvailability };
  SC.availability = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
