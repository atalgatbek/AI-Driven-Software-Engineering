// Fictional room catalog. Every room owns its bookings. Deep-frozen (AC5).
(function (root) {
  "use strict";
  const SC = (root.SmartCampus = root.SmartCampus || {});
  const isNode = typeof require === "function" && typeof module === "object";
  const { deepFreeze } = isNode ? require("./config.js") : SC.config;

  const ROOMS = deepFreeze([
    {
      id: "A-101",
      name: "Lecture Hall A-101",
      capacity: 80,
      equipment: ["projector", "microphone", "whiteboard"],
      blocked: false,
      bookings: [
        { id: "A1", start: "09:00", end: "10:30", title: "Physics lecture" },
        { id: "A2", start: "13:00", end: "15:00", title: "Software Engineering lecture" },
      ],
    },
    {
      id: "B-204",
      name: "Seminar Room B-204", // the original Assignment #03 room, same bookings
      capacity: 24,
      equipment: ["projector", "whiteboard"],
      blocked: false,
      bookings: [
        { id: "B1", start: "10:00", end: "11:00", title: "Algorithms lab" },
        { id: "B2", start: "12:30", end: "14:00", title: "Student council" },
        { id: "B3", start: "15:00", end: "16:30", title: "Databases tutorial" },
      ],
    },
    {
      id: "C-310",
      name: "Computer Lab C-310",
      capacity: 30,
      equipment: ["computers", "projector", "whiteboard"],
      blocked: false,
      bookings: [
        { id: "C1", start: "10:00", end: "12:00", title: "Python workshop" },
        { id: "C2", start: "14:00", end: "16:00", title: "Networks lab" },
      ],
    },
    {
      id: "D-012",
      name: "Meeting Room D-012",
      capacity: 8,
      equipment: ["whiteboard", "video-conference"],
      blocked: false,
      bookings: [{ id: "D1", start: "11:00", end: "11:30", title: "Robotics club meeting" }],
    },
    {
      id: "E-115",
      name: "Media Studio E-115",
      capacity: 12,
      equipment: ["video-conference", "projector", "microphone"],
      blocked: true,
      blockedReason: "Closed for maintenance",
      bookings: [],
    },
  ]);

  const api = { ROOMS };
  SC.rooms = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
