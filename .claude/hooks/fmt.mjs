#!/usr/bin/env node
// PostToolUse hook: prettier-format *.ts/*.tsx files right after Claude edits or
// writes them, so files land pre-formatted instead of tripping format:check in CI.
// Node instead of jq for payload parsing: jq is an undeclared dependency absent
// from default macOS installs, while Node is already required by the repo.

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

try {
  process.chdir(process.env.CLAUDE_PROJECT_DIR ?? '.');
} catch {
  process.exit(0);
}

// Nothing to check until dependencies are installed.
if (!existsSync('node_modules')) process.exit(0);

let raw = '';
for await (const chunk of process.stdin) raw += chunk;

let input;
try {
  input = JSON.parse(raw);
} catch {
  process.exit(0);
}

const filePath = input?.tool_input?.file_path;
if (typeof filePath !== 'string' || !/\.tsx?$/.test(filePath)) process.exit(0);
if (!existsSync(filePath)) process.exit(0);

const result = spawnSync('npx', ['prettier', '--write', filePath], {
  encoding: 'utf8',
});

if (result.error ?? result.status !== 0) {
  const detail = (
    result.stderr ||
    result.stdout ||
    result.error?.message ||
    'unknown error'
  ).trim();
  console.error(`fmt hook: prettier failed on ${filePath}:\n${detail}`);
  process.exit(2);
}
