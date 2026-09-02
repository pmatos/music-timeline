#!/usr/bin/env bash
# PostToolUse hook: prettier-format *.ts/*.tsx files right after Claude edits or
# writes them, so files land pre-formatted instead of tripping format:check in CI.
set -uo pipefail

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

# Nothing to check until dependencies are installed.
[ -d node_modules ] || exit 0

input=$(cat)
file_path=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')

[ -n "$file_path" ] || exit 0

case "$file_path" in
  *.ts | *.tsx) ;;
  *) exit 0 ;;
esac

[ -f "$file_path" ] || exit 0

if ! out=$(npx prettier --write "$file_path" 2>&1); then
  printf 'fmt hook: prettier failed on %s:\n%s\n' "$file_path" "$out" >&2
  exit 2
fi

exit 0
