// App configuration: fixed demo clock and booking rules.
// Classic script (works from file://) that also exports for Node tests.
(function (root) {
  "use strict";
  const SC = (root.SmartCampus = root.SmartCampus || {});

  function deepFreeze(value) {
    if (value && typeof value === "object" && !Object.isFrozen(value)) {
      Object.values(value).forEach(deepFreeze);
      Object.freeze(value);
    }
    return value;
  }

  const CONFIG = deepFreeze({
    todayLabel: "Mon 2 Nov 2026",
    now: "09:30", // fixed current time (AC1)
    openingHours: { open: "08:00", close: "20:00" },
    maxDurationMinutes: 120, // AC2
    maxAttendees: 500,
    equipment: [
      { id: "projector", label: "Projector" },
      { id: "whiteboard", label: "Whiteboard" },
      { id: "computers", label: "Computers" },
      { id: "video-conference", label: "Video conference" },
      { id: "microphone", label: "Microphone" },
    ],
  });

  const api = { CONFIG, deepFreeze };
  SC.config = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
