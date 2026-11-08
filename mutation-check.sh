#!/usr/bin/env bash
# Checks that the unit/regression tests really catch bugs: each "mutant"
# breaks one rule in a temporary copy of src/ and the suite MUST fail.
# Usage: bash scripts/mutation-check.sh
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

mutants=(
  "F1 capacity >= becomes >|src/domain/filters.js|s/room.capacity >= attendees/room.capacity > attendees/"
  "F2 ALL becomes ANY|src/domain/filters.js|s/required.every(/required.some(/"
  "AC2 120 limit off by one|src/domain/availability.js|s/e - s > cfg.maxDurationMinutes/e - s >= cfg.maxDurationMinutes/"
  "AC3/F3 blocked rule removed|src/domain/availability.js|s/if (room.blocked)/if (false)/"
  "AC4 touching treated as overlap|src/domain/time.js|s/aStart < bEnd \&\& aEnd > bStart/aStart <= bEnd \&\& aEnd >= bStart/"
)

killed=0
for m in "${mutants[@]}"; do
  IFS='|' read -r name file expr <<< "$m"
  rm -rf "$WORK/app" && mkdir -p "$WORK/app" && cp -r "$ROOT/src" "$ROOT/tests" "$WORK/app/"
  sed -i "$expr" "$WORK/app/$file"
  if cmp -s "$ROOT/$file" "$WORK/app/$file"; then echo "ERROR  $name: mutation not applied"; continue; fi
  if (cd "$WORK/app" && node --test "tests/unit/*.test.js" "tests/regression/*.test.js" > out.txt 2>&1); then
    echo "SURVIVED  $name  (tests did not notice!)"
  else
    failed=$(grep -E "^# fail|^ℹ fail" "$WORK/app/out.txt" | grep -oE "[0-9]+$")
    echo "KILLED    $name  ($failed failing tests)"
    killed=$((killed + 1))
  fi
done
echo "Result: $killed / ${#mutants[@]} mutants killed"
[ "$killed" -eq "${#mutants[@]}" ]
