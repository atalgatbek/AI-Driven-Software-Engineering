#!/usr/bin/env bash
# Measures code-structure metrics for one version of the app.
# Usage: bash scripts/metrics.sh <project-dir>
# Only application source is measured (tests, scripts, docs excluded).
set -u
DIR="${1:-.}"
cd "$DIR" || exit 1
FILES=$(find . -name "*.js" -not -path "./node_modules/*" -not -path "./tests/*" -not -path "./scripts/*" | sort)

count() { # count matching lines across all source files
  # shellcheck disable=SC2086
  grep -E -h -- "$1" $FILES 2>/dev/null | wc -l | tr -d ' '
}

echo "== Source files (non-blank lines) =="
for f in $FILES; do printf "  %-32s %4s\n" "$f" "$(grep -cv '^\s*$' "$f")"; done
echo "  files: $(echo "$FILES" | wc -w | tr -d ' ')"
echo
echo "== Duplicated logic (lines that implement the same rule) =="
echo "  HH:MM -> minutes parsing      : $(count 'split\(":"\)')"
echo "  max-duration (120) checks     : $(count '(e - s|duration)[^;]*>=? *(120|cfg\.maxDurationMinutes)')"
echo "  result-message markup builds  : $(count "class(Name)?[=:] ?[\"']msg[ \"']")"
echo "  innerHTML writes              : $(count 'innerHTML *=')"
echo "  opening-hours magic numbers   : $(count '(8|20) \* 60')"
