# Smart Campus Room Availability Checker - Assignment #04

**Student:** Talgatbek Abilkhaiyr (ID 24B032048), Software Engineering

Extends the Assignment #03 single-room prototype to a **catalog of 5 fictional rooms**
with **capacity and equipment filters**, refactors it into data / rules / filtering / UI
modules, and adds automated regression, feature and browser tests.

No login, payments, live APIs or database. All data is fictional. The fixed current
time is **Mon 2 Nov 2026, 09:30**.

## Versions

| Version | Git reference | Folder in the zip |
|---|---|---|
| Initial (Assignment #03 baseline) | tag `v1-baseline` | `initial-version/` |
| Final (Assignment #04) | tag `v2-final` | project root |

`git log --oneline` shows each step (baseline -> analysis -> refactor step 1 -> feature + refactor -> report).

## Setup

Requirements: **Node.js 20+** (tested with v22.23.4). The app itself has no dependencies.

```bash
npm install                      # only needed for the browser (UI) tests: installs Playwright
npx playwright install chromium  # downloads the headless browser once
```

## Run the app

Open `index.html` in any modern browser (double-click works - no server, no build step).

## Test commands

| Command | What it runs | Needs Playwright |
|---|---|---|
| `npm test` | 27 unit + AC regression tests (Node built-in test runner) | no |
| `npm run test:ui` | 7 UI tests in headless Chromium | yes |
| `npm run test:all` | all 34 tests | yes |
| `npm run mutation` | breaks 5 rules on purpose; the tests must catch each one | no |
| `npm run metrics` | file sizes and duplicated-logic counts (`scripts/metrics.sh`) | no |
| `npm run screenshots` | regenerates `evidence/screenshots/*.png` | yes |

Recorded outputs are in `evidence/` (`baseline-test-results.txt`, `step1-test-results.txt`,
`final-test-results.txt`, `mutation-results.txt`, `metrics.txt`).

## Project structure

```
index.html, styles.css      page and responsive layout
src/data/config.js          fixed time, opening hours, 120-min limit, equipment list, deepFreeze
src/data/rooms.js           5 fictional rooms, each with its own bookings (deep-frozen)
src/domain/time.js          the only HH:MM parser; half-open interval overlap
src/domain/availability.js  validateRequest (AC1, AC2), findConflict (AC4), checkAvailability (AC3/F3)
src/domain/filters.js       parseAttendees, hasCapacity (F1), hasAllEquipment (F2), filterRooms
src/ui/render.js            DOM rendering only (textContent, no innerHTML)
src/ui/app.js               controller: state, events, empty state (F4), room switch refresh (F5)
tests/regression/           AC1-AC5 regression (same cases as the baseline suite + boundaries)
tests/unit/                 F1-F5, catalog, attendees input, time helpers
tests/ui/                   Playwright browser tests
scripts/                    metrics, mutation check, screenshots
docs/                       analysis/plan, diagrams;  CONTEXT.md = context given to the AI
REPORT.docx / REPORT.pdf    the report (Times New Roman 14); REPORT.md is the same text in Markdown
```

## Acceptance criteria and features

- **AC1** valid time (HH:MM, end after start, not before 09:30, within 08:00-20:00), **AC2** max 120 min,
  **AC3** blocked room never available, **AC4** touching allowed, overlap rejected,
  **AC5** booking data immutable, **AC6** clear, responsive feedback.
- **F1** capacity ≥ attendees, **F2** room has ALL selected equipment, **F3** blocked room never available,
  **F4** clear empty state, **F5** changing the room refreshes the result.
