// Room filtering (F1, F2). Pure functions; they never change the catalog.
// Note: blocked rooms are NOT removed here. The blocked rule lives in one
// place only — availability.checkAvailability() (AC3/F3).
(function (root) {
  "use strict";
  const SC = (root.SmartCampus = root.SmartCampus || {});
  const isNode = typeof require === "function" && typeof module === "object";
  const { CONFIG } = isNode ? require("../data/config.js") : SC.config;

  function parseAttendees(raw, config) {
    const max = (config || CONFIG).maxAttendees;
    const text = String(raw == null ? "" : raw).trim();
    if (text === "") {
      return { ok: false, code: "ATTENDEES_MISSING", message: "Enter the number of attendees." };
    }
    if (!/^\d+$/.test(text)) {
      return { ok: false, code: "ATTENDEES_INVALID", message: "Attendees must be a whole number." };
    }
    const value = Number(text);
    if (value < 1 || value > max) {
      return { ok: false, code: "ATTENDEES_RANGE", message: "Attendees must be between 1 and " + max + "." };
    }
    return { ok: true, value };
  }

  // F1: capacity must be >= requested attendees.
  function hasCapacity(room, attendees) {
    return room.capacity >= attendees;
  }

  // F2: room must contain ALL selected items.
  function hasAllEquipment(room, required) {
    return required.every((item) => room.equipment.includes(item));
  }

  function filterRooms(rooms, criteria) {
    const attendees = (criteria && criteria.attendees) || 1;
    const equipment = (criteria && criteria.equipment) || [];
    return rooms.filter((room) => hasCapacity(room, attendees) && hasAllEquipment(room, equipment));
  }

  const api = { parseAttendees, hasCapacity, hasAllEquipment, filterRooms };
  SC.filters = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
