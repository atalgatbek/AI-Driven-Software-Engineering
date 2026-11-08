// UI presentation only: turns data into DOM nodes. No booking rules here.
// Uses textContent everywhere (no innerHTML), so data is never parsed as HTML.
(function (root) {
  "use strict";
  const SC = (root.SmartCampus = root.SmartCampus || {});
  const { CONFIG } = SC.config;
  const time = SC.time;

  function el(tag, props, children) {
    const node = document.createElement(tag);
    Object.entries(props || {}).forEach(([key, value]) => {
      if (value === undefined || value === null || value === false) return;
      if (key === "className") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key.startsWith("on")) node.addEventListener(key.slice(2).toLowerCase(), value);
      else node.setAttribute(key, value === true ? "" : value);
    });
    (children || []).forEach((child) => child && node.append(child));
    return node;
  }

  function equipmentLabel(id) {
    const item = CONFIG.equipment.find((e) => e.id === id);
    return item ? item.label : id;
  }

  function renderEquipmentOptions(container) {
    container.replaceChildren(
      ...CONFIG.equipment.map((item) =>
        el("label", { className: "chip" }, [
          el("input", { type: "checkbox", name: "equipment", value: item.id }),
          el("span", { text: item.label }),
        ])
      )
    );
  }

  function describeCriteria(criteria) {
    const parts = [criteria.attendees + (criteria.attendees === 1 ? " attendee" : " attendees")];
    if (criteria.equipment.length) parts.push(criteria.equipment.map(equipmentLabel).join(", "));
    return parts.join(" with ");
  }

  // F4: clear empty state instead of an empty list.
  function renderEmptyState(container, criteria, criteriaError) {
    const title = criteriaError ? "Check the attendees field" : "No rooms match your requirements";
    const hint = criteriaError
      ? criteriaError.message
      : "Nothing fits " + describeCriteria(criteria) + ". Try fewer attendees or fewer equipment items.";
    container.replaceChildren(
      el("div", { className: "empty-state", role: "status", "data-testid": "empty-state" }, [
        el("strong", { text: title }),
        el("p", { text: hint }),
      ])
    );
  }

  function renderRoomList(container, rooms, selectedId, onSelect) {
    container.replaceChildren(
      ...rooms.map((room) => {
        const input = el("input", {
          type: "radio",
          name: "room",
          value: room.id,
          checked: room.id === selectedId,
          onChange: () => onSelect(room.id),
        });
        const meta = "Up to " + room.capacity + " people · " + room.equipment.map(equipmentLabel).join(", ");
        return el("label", { className: "room-card" + (room.blocked ? " is-blocked" : ""), "data-room": room.id }, [
          input,
          el("span", { className: "room-body" }, [
            el("span", { className: "room-name" }, [
              el("span", { text: room.name }),
              room.blocked ? el("span", { className: "badge", text: "Blocked" }) : null,
            ]),
            el("span", { className: "room-meta", text: meta }),
          ]),
        ]);
      })
    );
  }

  function renderMatchCount(node, shown, total) {
    node.textContent = shown + " of " + total + " rooms match";
  }

  function renderBookings(titleNode, listNode, room) {
    if (!room) {
      titleNode.textContent = "Bookings";
      listNode.replaceChildren(el("li", { className: "muted", text: "Select a room to see its bookings." }));
      return;
    }
    titleNode.textContent = "Today's bookings · " + room.name;
    if (room.blocked) {
      listNode.replaceChildren(el("li", { className: "muted", text: room.blockedReason || "This room is blocked." }));
      return;
    }
    if (room.bookings.length === 0) {
      listNode.replaceChildren(el("li", { className: "muted", text: "No bookings today." }));
      return;
    }
    const sorted = [...room.bookings].sort((a, b) => time.toMinutes(a.start) - time.toMinutes(b.start));
    listNode.replaceChildren(
      ...sorted.map((b) =>
        el("li", {}, [
          el("strong", { text: b.start + "–" + b.end }),
          document.createTextNode(" " + b.title + " "),
          el("span", { className: "muted", text: "(" + time.durationMinutes(b.start, b.end) + " min)" }),
        ])
      )
    );
  }

  // AC6: one place that renders every success / error message.
  function renderResult(container, result, room) {
    if (!result) {
      container.replaceChildren();
      return;
    }
    const heading = room ? room.name + (result.start && result.end ? " · " + result.start + "–" + result.end : "") : "";
    container.replaceChildren(
      el("div", { className: "msg " + (result.ok ? "success" : "error"), "data-code": result.code }, [
        heading ? el("div", { className: "msg-title", text: heading }) : null,
        el("div", { text: (result.ok ? "✔ " : "✖ ") + result.message }),
      ])
    );
  }

  SC.render = {
    renderEquipmentOptions,
    renderEmptyState,
    renderRoomList,
    renderMatchCount,
    renderBookings,
    renderResult,
  };
})(typeof window !== "undefined" ? window : globalThis);
