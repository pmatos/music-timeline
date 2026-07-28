// Regression tests for check-pr-title.mjs: spawns the hook with PreToolUse-style JSON
// on stdin and asserts the exit code (0 = allow, 2 = block).
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

const HOOK = resolve(process.cwd(), '.claude/hooks/check-pr-title.mjs');

const bash = (command) =>
  spawnSync(process.execPath, [HOOK], {
    input: JSON.stringify({
      tool_name: 'Bash',
      tool_input: { command },
    }),
  }).status;

const heredocWithFakeTitle = `gh pr create --body "$(cat <<'EOF'
Documents \`gh pr create --title "bad example"\` as an anti-pattern; see Korngold's piece.
EOF
)" --title "docs: document hook"`;

describe('check-pr-title hook', () => {
  test.each([
    // Core allow/block behaviour.
    ['allows a conforming title', 'gh pr create --title "feat: add x"', 0],
    ['blocks a non-conforming title', 'gh pr create --title "Add x (#1)"', 2],
    ['fails open on --fill', 'gh pr create --fill', 0],
    // A --body documenting a bad title must not block the real invocation,
    // whether the body is a heredoc or a plain quoted string.
    ['ignores title-looking text in a heredoc body', heredocWithFakeTitle, 0],
    [
      'ignores title-looking text in a quoted body',
      `gh pr create --body 'example: --title "bad"' -t "feat: ok"`,
      0,
    ],
    // Every invocation in a chain is validated, not just the first match.
    [
      'blocks a bad title in a later chained command',
      'gh pr create --title "feat: ok" && gh pr edit 5 --title "bad"',
      2,
    ],
    // gh-looking words in another command's arguments are not an invocation.
    ['ignores gh-looking echo arguments', 'echo gh pr create --title "bad"', 0],
  ])('%s', (_name, command, want) => {
    expect(bash(command)).toBe(want);
  });

  test('blocks a non-conforming MCP title', () => {
    const status = spawnSync(process.execPath, [HOOK], {
      input: JSON.stringify({
        tool_name: 'mcp__plugin_github_github__create_pull_request',
        tool_input: { title: 'Add endpoint' },
      }),
    }).status;
    expect(status).toBe(2);
  });
});
