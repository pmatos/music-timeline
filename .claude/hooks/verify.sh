#!/usr/bin/env bash
# Stop hook: keep the working tree green. Runs lint, typecheck, and tests, and
# blocks the stop (exit 2) if any fail so agent-authored changes stay green.
# Disable by removing the Stop hook from .claude/settings.json.
set -uo pipefail

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

# Nothing to check until dependencies are installed.
[ -d node_modules ] || exit 0

run() {
  local name="$1"
  shift
  local out
  if ! out=$("$@" 2>&1); then
    printf 'verify hook: %s failed — fix before finishing:\n%s\n' "$name" "$out" >&2
    exit 2
  fi
}

run lint npm run lint --silent
run typecheck npx tsc -b
run tests npm run test --silent

exit 0
