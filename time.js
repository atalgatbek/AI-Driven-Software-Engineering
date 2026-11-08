// Time helpers: the ONLY place that parses "HH:MM" strings.
(function (root) {
  "use strict";
  const SC = (root.SmartCampus = root.SmartCampus || {});

  const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

  function isValidTime(value) {
    return typeof value === "string" && TIME_PATTERN.test(value);
  }

  function toMinutes(value) {
    if (!isValidTime(value)) throw new RangeError('Invalid time "' + value + '", expected HH:MM');
    const [hours, minutes] = value.split(":").map(Number);
    return hours * 60 + minutes;
  }

  function durationMinutes(start, end) {
    return toMinutes(end) - toMinutes(start);
  }

  // Half-open intervals [start, end): touching intervals do NOT overlap (AC4).
  function intervalsOverlap(aStart, aEnd, bStart, bEnd) {
    return aStart < bEnd && aEnd > bStart;
  }

  const api = { isValidTime, toMinutes, durationMinutes, intervalsOverlap };
  SC.time = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
