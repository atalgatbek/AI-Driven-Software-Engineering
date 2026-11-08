# Task 1 - Codebase analysis and improvement plan

Written **before** any code change, on baseline tag `v1-baseline`.
Baseline result: `npm test` -> **10 / 10 passed** (`evidence/baseline-test-results.txt`).

## Maintainability risks (with file/function references)

| # | Risk | Evidence (baseline `app.js`) | Impact |
|---|---|---|---|
| R1 | **Time parsing copied 9 times.** The same `parseInt(x.split(":")[0]) * 60 + ...` expression is written by hand. | lines 22-24 (`checkAvailability`), 43-44 (overlap loop), 64-65 (`renderBookings`), 82-83 (`onCheckClick`) | A fix in one copy (e.g. invalid input) is easy to forget in the others. |
| R2 | **Validation duplicated in UI and domain, with different order.** `onCheckClick()` repeats the 120-minute rule (line 84) before calling `checkAvailability()` (line 35). | Reproduced: input `07:00-09:30` -> domain returns `IN_PAST`, UI shows "at most 120 minutes". | Two sources of truth -> inconsistent feedback (AC6) and rules that can drift apart. |
| R3 | **Data, rules and DOM in one file; one hard-coded room.** `ROOM` and `BOOKINGS` are global constants (lines 9-15); `onCheckClick()` always passes them (line 89). | `app.js` mixes 4 responsibilities in 108 lines. | Cannot add a room catalog without touching every function; UI cannot be tested apart from rules. |
| R4 | **Magic numbers next to unused constants.** `OPEN`/`CLOSE` are declared (lines 6-7) but the check uses `8 * 60` and `20 * 60` (line 32). | `grep OPEN app.js` -> only declaration and export. | Changing opening hours in the constant silently has no effect. |
| R5 | **HTML built by string concatenation.** 5 `innerHTML` writes (lines 68, 79, 85, 91, 93) insert booking titles without escaping. | `renderBookings()`, `onCheckClick()` | Duplicated markup for each message; unsafe if data ever comes from users. |

## Prioritized plan (small steps, tests after each)

1. **Time module** (fixes R1, R4): `toMinutes()`, `isValidTime()`, `durationMinutes()`, opening hours from config. Baseline tests must stay green.
2. **One validation path** (fixes R2): `validateRequest()` in the domain; UI only displays its result. Add a test for the `07:00-09:30` case.
3. **Room catalog** (R3): rooms with `capacity`, `equipment`, `blocked`, own `bookings`, deep-frozen (AC5).
4. **Filtering module** (F1, F2): pure `filterRooms(rooms, criteria)`.
5. **UI split** (R3, R5): `render.js` builds DOM nodes with `textContent`; `app.js` is a small controller with state (selected room) for F4/F5.
6. **Tests**: AC1-AC5 regression on the new API, F1-F5, boundary cases, one browser UI test.

## AI suggestions rejected or modified

- **Rejected - "migrate to ES modules + Vite".** `<script type="module">` is blocked by browsers when `index.html` is opened from disk (`file://`, CORS), and Vite adds a build step. This breaks the constraint "opens without a build step". **Instead:** classic scripts that register in one `SmartCampus` namespace and also `module.exports` for Node tests.
- **Modified - "remove blocked rooms inside `filterRooms()`".** That would put the blocked rule in two places (filter + availability) - the same problem as R2. **Instead:** the filter checks only capacity and equipment; blocked rooms stay visible with a *Blocked* badge, and `checkAvailability()` is the single place that refuses them (AC3/F3).
