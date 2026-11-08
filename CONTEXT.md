# Project context for the AI assistant

This is the structured context given to the AI assistant before any code change
(Assignment #04, step 2 of the suggested AI workflow).

## Repository map (baseline, tag `v1-baseline`)

| Path | Role |
|---|---|
| `index.html` | Single page: time form, result area (`#result`, `aria-live`), booking list |
| `styles.css` | Card layout, success/error messages, one mobile breakpoint (480px) |
| `app.js` | **Everything else**: fixed time `NOW`, one `ROOM`, `BOOKINGS`, `checkAvailability()`, `renderBookings()`, `onCheckClick()` |
| `tests/baseline.test.js` | 10 `node:test` regression tests for AC1-AC5 |
| `package.json` | `npm test` -> Node built-in test runner (no dependencies) |

## Acceptance criteria that must keep working

- **AC1** Valid time: `HH:MM` format, end after start, start not before the fixed current time (09:30), inside opening hours 08:00-20:00.
- **AC2** Maximum duration 120 minutes (120 accepted, 121 rejected).
- **AC3** A blocked room is never reported as available.
- **AC4** Overlap: a request that only *touches* a booking (end = booking start, or start = booking end) is allowed; any real overlap is rejected.
- **AC5** Booking data is immutable: a check never changes stored bookings.
- **AC6** Clear, responsive feedback: success/error message in a live region; layout works on a phone.

## New requirements (Assignment #04)

- Catalog of ≥ 4 fictional rooms: `id`, `name`, `capacity`, `equipment[]`, `blocked`, own `bookings[]`.
- F1 capacity ≥ attendees, F2 room has ALL selected equipment, F3 blocked room never available,
  F4 clear empty state, F5 changing the selected room refreshes the result.
- The availability check must use the **selected room's** bookings.

## Constraints

- No login, payments, live APIs or database. Fictional data only.
- Plain HTML/CSS/JavaScript that opens from `index.html` without a build step.
- Tests must run with `npm test`. Small steps, one change at a time - **no full rewrite / no framework migration**.
- Do not share credentials or private data with the assistant.
