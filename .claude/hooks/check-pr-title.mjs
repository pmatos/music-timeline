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

// Blanks heredoc bodies (<<'EOF' ... EOF) to spaces, keeping newlines and indices, so
// prose inside a --body (e.g. `--body "$(cat <<'EOF' ... Korngold's ... EOF)"`, the
// normal PR-body style in this repo) can't be mistaken for flags or gh invocations.
function stripHeredocs(command) {
  const re = /<<-?\s*['"]?([A-Za-z_][A-Za-z0-9_]*)['"]?/g;
  const spans = [];
  for (const m of command.matchAll(re)) {
    const bodyStart = command.indexOf('\n', m.index);
    if (bodyStart === -1) continue;
    const close = new RegExp(`^\\s*${m[1]}\\s*$`, 'm').exec(
      command.slice(bodyStart + 1),
    );
    spans.push([
      bodyStart,
      close ? bodyStart + 1 + close.index + close[0].length : command.length,
    ]);
  }
  if (!spans.length) return command;
  const chars = [...command];
  for (const [start, end] of spans)
    for (let i = start; i < end; i++) if (chars[i] !== '\n') chars[i] = ' ';
  return chars.join('');
}

// Blanks unquoted shell comments (# at the start of a word, through end of line) to
// spaces, so comment prose can't be mistaken for flags, separators, or commands.
// Newlines are kept: they still terminate the command for the segment splitter.
function stripComments(command) {
  const chars = [...command];
  let quote = null;
  let atWordStart = true;
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (c === '\\' && quote !== "'" && i + 1 < chars.length) {
      i++;
      atWordStart = false;
      continue;
    }
    if (quote) {
      if (c === quote) quote = null;
      continue;
    }
    if (c === "'" || c === '"') {
      quote = c;
      atWordStart = false;
      continue;
    }
    if (c === '#' && atWordStart) {
      while (i < chars.length && chars[i] !== '\n') chars[i++] = ' ';
      atWordStart = true;
      continue;
    }
    atWordStart = /[\s;&|]/.test(c);
  }
  return chars.join('');
}

// Splits on command separators outside quotes, so each segment holds at most one simple
// command and a --title can't leak across chained invocations.
function splitSegments(command) {
  const segments = [];
  let current = '';
  let quote = null;
  for (let i = 0; i < command.length; i++) {
    const c = command[i];
    // Outside single quotes a backslash escapes the next character, so an escaped quote
    // (\" inside a double-quoted --body) is not a quote boundary and what follows it
    // can't be a real separator.
    if (c === '\\' && quote !== "'" && i + 1 < command.length) {
      current += c + command[++i];
      continue;
    }
    if (quote) {
      if (c === quote) quote = null;
    } else if (c === "'" || c === '"') {
      quote = c;
    } else if (c === '\n' || c === ';' || c === '&' || c === '|') {
      segments.push(current);
      current = '';
      if ((c === '&' || c === '|') && command[i + 1] === c) i++;
      continue;
    }
    current += c;
  }
  segments.push(current);
  return segments;
}

// Characters that can follow $ to start a shell expansion: $(…), ${…}, $VAR, $5,
// $@/*/#/?/!/-, and the $'…'/"$…" quoting forms.
const EXPANSION_NEXT = /[({A-Za-z0-9_@*#?!'"$-]/;

// Minimal shell-word lexer: splits on unquoted whitespace and keeps quoted content
// inside its token, so flag-looking text inside a quoted --body stays payload, never an
// argv entry. Each token records whether it contains a real substitution ($(…), `…`, or
// a $-expansion outside single quotes) — the value we see then differs from what the
// shell will pass, which the caller fails open on. Literal $/backticks (single-quoted or
// escaped) do not count.
function lexShellWords(input) {
  const tokens = [];
  let current = '';
  let started = false;
  let expansion = false;
  let quote = null;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (quote === "'") {
      if (c === "'") quote = null;
      else current += c;
      continue;
    }
    if (quote === '"') {
      if (c === '"') quote = null;
      else if (c === '\\' && '"\\$`'.includes(input[i + 1]))
        current += input[++i];
      else {
        if (c === '`' || (c === '$' && EXPANSION_NEXT.test(input[i + 1] ?? '')))
          expansion = true;
        current += c;
      }
      continue;
    }
    if (c === "'" || c === '"') {
      quote = c;
      started = true;
    } else if (c === '\\' && i + 1 < input.length) {
      current += input[++i];
      started = true;
    } else if (/\s/.test(c)) {
      if (started) {
        tokens.push({ text: current, expansion });
        current = '';
        started = false;
        expansion = false;
      }
    } else {
      if (c === '`' || (c === '$' && EXPANSION_NEXT.test(input[i + 1] ?? '')))
        expansion = true;
      current += c;
      started = true;
    }
  }
  if (started) tokens.push({ text: current, expansion });
  return tokens;
}

// Index of the `gh` binary when it heads the simple command — after any leading
// NAME=value assignments and command/env wrappers — else -1, so another command's
// arguments (e.g. `echo gh pr create ...`) are never mistaken for an invocation.
function ghInvocationIndex(tokens) {
  const ASSIGN = /^[A-Za-z_][A-Za-z0-9_]*=/;
  const text = (i) => tokens[i]?.text;
  let i = 0;
  while (i < tokens.length && ASSIGN.test(text(i))) i++;
  while (text(i) === 'command' || text(i) === 'env') {
    i++;
    while (i < tokens.length && ASSIGN.test(text(i))) i++;
  }
  return text(i) === 'gh' ? i : -1;
}

// Yields the --title/-t value of every actual `gh pr create`/`edit` invocation in the
// command: heredoc bodies are blanked, the rest is split into simple commands, and only
// argv tokens following each `gh pr create`/`edit` are inspected — title-looking text in
// quoted bodies or neighbouring commands in a chain is never matched.
function titlesFromCommand(command) {
  const titles = [];
  for (const segment of splitSegments(stripComments(stripHeredocs(command)))) {
    const tokens = lexShellWords(segment);
    const gh = ghInvocationIndex(tokens);
    if (gh === -1) continue;
    // gh accepts inherited flags between the binary and the subcommand:
    // -R/--repo with a separate value or joined with =.
    let pr = gh + 1;
    for (;;) {
      const t = tokens[pr]?.text;
      if (t === '-R' || t === '--repo') pr += 2;
      else if (/^(?:-R=|--repo=)/.test(t ?? '')) pr += 1;
      else break;
    }
    if (tokens[pr]?.text !== 'pr') continue;
    if (tokens[pr + 1]?.text !== 'create' && tokens[pr + 1]?.text !== 'edit')
      continue;
    for (let i = pr + 2; i < tokens.length; i++) {
      const token = tokens[i];
      const inline = /^(?:--title|-t)=(.*)$/.exec(token.text);
      if (inline) titles.push({ value: inline[1], expansion: token.expansion });
      else if (
        (token.text === '--title' || token.text === '-t') &&
        i + 1 < tokens.length
      ) {
        const next = tokens[++i];
        titles.push({ value: next.text, expansion: next.expansion });
      }
    }
  }
  return titles;
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
  // Cheap prefilter only: inherited flags (-R/--repo) may sit between gh and pr, and
  // body prose may mention gh, so the precise invocation check lives in the lexer.
  if (/\bgh\b/.test(command)) {
    for (const title of titlesFromCommand(command)) {
      // Fails open only when the title contains a real shell substitution ($(…), `…`,
      // or a $-expansion outside single quotes): we then see the source text, not the
      // value the shell will pass. A literal $ or backtick is still validated.
      if (!title.expansion && !TITLE_RE.test(title.value))
        fail(title.value, 'gh pr command');
    }
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
