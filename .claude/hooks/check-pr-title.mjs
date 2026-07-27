#!/usr/bin/env node
// PreToolUse guard: blocks non-Conventional-Commits PR titles (see commitlint.config.cjs)
// before they reach GitHub, catching what lint-pr-title.yml would otherwise only catch
// after the PR is already opened. Covers both `gh pr create/edit` (Bash) and the GitHub
// MCP create/update_pull_request tools. Fails open (exit 0) whenever it can't confidently
// find a title — a missed check is better than a false block.

const TYPES = [
  'build',
  'chore',
  'ci',
  'docs',
  'feat',
  'fix',
  'perf',
  'refactor',
  'revert',
  'style',
  'test',
];
const TITLE_RE = new RegExp(`^(${TYPES.join('|')})(\\([^)]+\\))?!?: .+`);

function fail(title, source) {
  process.stderr.write(
    `PR title check: "${title}" (from ${source}) doesn't follow Conventional Commits.\n` +
      `Use "type(scope): subject" with type one of: ${TYPES.join(', ')}.\n` +
      `Example: "feat(violin): add Erich Wolfgang Korngold to timeline"\n`,
  );
  process.exit(2);
}

// Scans only the substring around --title/-t rather than tokenizing the whole command,
// so it can't be desynced by quotes/apostrophes elsewhere (e.g. inside a --body heredoc
// like `--body "$(cat <<'EOF' ... Korngold's ... EOF)"`, which is how PR bodies are
// normally written in this repo).
function titleFromCommand(command) {
  const patterns = [
    /(?:^|\s)--title(?:=|\s+)"([^"]*)"/,
    /(?:^|\s)--title(?:=|\s+)'([^']*)'/,
    /(?:^|\s)--title=(\S+)/,
    /(?:^|\s)-t(?:=|\s+)"([^"]*)"/,
    /(?:^|\s)-t(?:=|\s+)'([^']*)'/,
  ];
  for (const re of patterns) {
    const m = command.match(re);
    if (m) return m[1];
  }
  return undefined;
}

let raw = '';
for await (const chunk of process.stdin) raw += chunk;

let input;
try {
  input = JSON.parse(raw);
} catch {
  process.exit(0);
}

const toolName = input.tool_name;
const toolInput = input.tool_input ?? {};

if (toolName === 'Bash') {
  const command = toolInput.command ?? '';
  if (/\bgh\s+pr\s+(create|edit)\b/.test(command)) {
    const title = titleFromCommand(command);
    // Skip anything that looks like unexpanded shell substitution ($(...), `...`) —
    // we only see the literal command text, not its expansion, so we can't judge it.
    if (title && !/[$`]/.test(title) && !TITLE_RE.test(title))
      fail(title, 'gh pr command');
  }
} else if (
  /^mcp__plugin_github_github__(create|update)_pull_request$/.test(
    toolName ?? '',
  )
) {
  const title = toolInput.title;
  if (title && !TITLE_RE.test(title))
    fail(title, 'MCP create/update_pull_request');
}

process.exit(0);
