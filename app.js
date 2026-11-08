// Controller: holds UI state and connects events -> domain -> render.
(function (root) {
  "use strict";
  const SC = root.SmartCampus;
  const { CONFIG } = SC.config;
  const { ROOMS } = SC.rooms;
  const { filterRooms, parseAttendees } = SC.filters;
  const { checkAvailability } = SC.availability;
  const render = SC.render;

  const state = {
    criteria: { attendees: 1, equipment: [] },
    criteriaError: null,
    selectedRoomId: null,
    lastRequest: null, // { start, end } of the last submitted check
  };

  const $ = (id) => document.getElementById(id);

  function matchingRooms() {
    return state.criteriaError ? [] : filterRooms(ROOMS, state.criteria);
  }

  function selectedRoom() {
    return ROOMS.find((room) => room.id === state.selectedRoomId) || null;
  }

  function readCriteria() {
    const attendees = parseAttendees($("attendees").value);
    state.criteriaError = attendees.ok ? null : attendees;
    state.criteria = {
      attendees: attendees.ok ? attendees.value : state.criteria.attendees,
      equipment: [...document.querySelectorAll('input[name="equipment"]:checked')].map((box) => box.value),
    };
  }

  // Keep the selection valid: if the selected room no longer matches, pick the first match.
  function syncSelection(matches) {
    if (!matches.some((room) => room.id === state.selectedRoomId)) {
      state.selectedRoomId = matches.length ? matches[0].id : null;
    }
  }

  // F5: the result always belongs to the currently selected room.
  function refreshResult() {
    const room = selectedRoom();
    if (!room || !state.lastRequest) {
      render.renderResult($("result"), null);
      return;
    }
    const result = checkAvailability(room, state.lastRequest.start, state.lastRequest.end);
    render.renderResult($("result"), result, room);
  }

  function renderAll() {
    const matches = matchingRooms();
    syncSelection(matches);
    render.renderMatchCount($("match-count"), matches.length, ROOMS.length);
    if (matches.length === 0) {
      render.renderEmptyState($("room-list"), state.criteria, state.criteriaError);
    } else {
      render.renderRoomList($("room-list"), matches, state.selectedRoomId, onRoomSelect);
    }
    render.renderBookings($("bookings-title"), $("bookings"), selectedRoom());
    $("check-button").disabled = !selectedRoom();
    refreshResult();
  }

  function onCriteriaChange() {
    readCriteria();
    renderAll();
  }

  function onRoomSelect(roomId) {
    state.selectedRoomId = roomId;
    renderAll();
  }

  function onSubmit(event) {
    event.preventDefault();
    state.lastRequest = { start: $("start").value, end: $("end").value };
    refreshResult();
  }

  function init() {
    $("today").textContent = CONFIG.todayLabel;
    $("now").textContent = CONFIG.now;
    render.renderEquipmentOptions($("equipment"));
    $("filters").addEventListener("input", onCriteriaChange);
    $("filters").addEventListener("submit", (event) => event.preventDefault());
    $("check-form").addEventListener("submit", onSubmit);
    readCriteria();
    renderAll();
  }

  document.addEventListener("DOMContentLoaded", init);
})(window);
