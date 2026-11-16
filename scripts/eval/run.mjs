#!/usr/bin/env node
// Before/after evaluation: the same prompts, given to Claude Code with and
// without ui-polish-kit, scored by the kit's static checker.
//
//   node scripts/eval/run.mjs [--out <dir>] [--only dashboard,signup] [--model <alias>] [--parallel 3]
//
// For each prompt it creates two empty projects:
//   baseline  nothing installed
//   kit       `ui-polish install claude` (project skills + .ui-polish/), nothing else
// and runs `claude -p <prompt>` in each with the same tools: Read, Write, Edit,
// Glob, Grep and `node` only (no npx, no network lookups), so the only
// difference is the kit. User-level settings and plugins are not loaded
// (--setting-sources project,local). The generated projects stay in --out for
// inspection; results go to docs/eval/results.json and docs/eval/README.md.
//
// Needs the `claude` CLI, logged in. Each run takes several minutes.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { audit } from '../../audit/lib/run.mjs';
import { install } from '../install.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};

const prompts = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts', 'eval', 'prompts.json'), 'utf8'));
const only = opt('only', '').split(',').filter(Boolean);
const outDir = path.resolve(opt('out', fs.mkdtempSync(path.join(os.tmpdir(), 'ui-polish-eval-'))));
const model = opt('model', '');
const parallel = Number(opt('parallel', '3'));
const TOOLS = ['Read', 'Write', 'Edit', 'Glob', 'Grep', 'Bash(node:*)'];

/** The claude executable. npm installs a shell shim on Windows, which cannot be spawned without a shell (and a shell would split the prompt), so use the binary it wraps. */
function claudeBin() {
  if (process.env.CLAUDE_BIN) return process.env.CLAUDE_BIN;
  if (process.platform === 'win32') {
    for (const dir of (process.env.PATH || '').split(path.delimiter)) {
      const exe = path.join(dir, 'node_modules', '@anthropic-ai', 'claude-code', 'bin', 'claude.exe');
      if (fs.existsSync(exe)) return exe;
      if (fs.existsSync(path.join(dir, 'claude.exe'))) return path.join(dir, 'claude.exe');
    }
  }
  return 'claude';
}
const CLAUDE = claudeBin();

function runClaude(cwd, prompt) {
  const argv = ['-p', prompt, '--setting-sources', 'project,local', '--allowedTools', ...TOOLS, '--max-turns', '60', '--output-format', 'json'];
  if (model) argv.push('--model', model);
  return new Promise((resolve) => {
    const started = Date.now();
    const child = spawn(CLAUDE, argv, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d));
    child.stderr.on('data', (d) => (stderr += d));
    child.on('close', (code) => {
      let meta = {};
      try {
        const j = JSON.parse(stdout);
        meta = { turns: j.num_turns, costUsd: j.total_cost_usd, isError: j.is_error };
      } catch {
        meta = { parseError: true, tail: (stdout + stderr).slice(-400) };
      }
      resolve({ code, seconds: Math.round((Date.now() - started) / 1000), ...meta });
    });
  });
}

function score(dir) {
  const r = audit(dir);
  const byRule = {};
  for (const f of r.findings) byRule[f.ruleId] = (byRule[f.ruleId] || 0) + 1;
  const files = fs.readdirSync(dir).filter((f) => /\.(html|css|js)$/.test(f));
  return { score: r.score, pass: r.pass, errors: r.counts.error, warnings: r.counts.warning, info: r.counts.info, rules: Object.keys(byRule).sort(), byRule, files };
}

async function job(p, arm) {
  const dir = path.join(outDir, p.id, arm);
  fs.mkdirSync(dir, { recursive: true });
  if (arm === 'kit') install({ agents: ['claude'], target: dir, log: () => {} });
  console.log(`start  ${p.id}/${arm}`);
  const run = await runClaude(dir, p.prompt);
  const result = { prompt: p.id, arm, dir, run, ...score(dir) };
  console.log(`done   ${p.id}/${arm}: score ${result.score}, ${result.errors} errors, ${result.warnings} warnings (${run.seconds}s)`);
  return result;
}

const jobs = prompts.filter((p) => !only.length || only.includes(p.id)).flatMap((p) => [() => job(p, 'baseline'), () => job(p, 'kit')]);
const results = [];
const queue = [...jobs];
await Promise.all(Array.from({ length: Math.max(1, parallel) }, async () => {
  while (queue.length) results.push(await queue.shift()());
}));
results.sort((a, b) => a.prompt.localeCompare(b.prompt) || a.arm.localeCompare(b.arm));

const docs = path.join(ROOT, 'docs', 'eval');
fs.mkdirSync(docs, { recursive: true });
const date = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(docs, 'results.json'), `${JSON.stringify({ date, model: model || 'default', tools: TOOLS, results }, null, 2)}\n`);

const rows = [];
for (const p of [...new Set(results.map((r) => r.prompt))]) {
  const b = results.find((r) => r.prompt === p && r.arm === 'baseline');
  const k = results.find((r) => r.prompt === p && r.arm === 'kit');
  if (!b || !k) continue;
  rows.push(`| ${p} | ${b.score} | ${k.score} | ${b.errors} → ${k.errors} | ${b.warnings} → ${k.warnings} | ${b.rules.length} → ${k.rules.length} |`);
}
const fixed = (b, k) => b.rules.filter((id) => !k.rules.includes(id));
const detail = results.filter((r) => r.arm === 'baseline').map((b) => {
  const k = results.find((r) => r.prompt === b.prompt && r.arm === 'kit');
  return `- **${b.prompt}**: without the kit: ${b.rules.join(', ') || 'none'}. With the kit: ${k?.rules.join(', ') || 'none'}. Fixed by the kit: ${k ? fixed(b, k).join(', ') || 'none' : 'n/a'}.`;
});
fs.writeFileSync(path.join(docs, 'README.md'), `# Before and after: Claude Code with and without ui-polish-kit

Run on ${date} with \`node scripts/eval/run.mjs\`${model ? ` (model: ${model})` : ''}. Each prompt was given to Claude Code twice in an empty folder: once as is, once after \`ui-polish install claude\`. Both runs had the same tools (read, write, edit, search, and \`node\`; no \`npx\` or network lookups) and no user-level settings or plugins. Each result was scored by the kit's static checker (\`audit/cli.mjs\`, 0–100; 85 passes).

| Prompt | Score without | Score with kit | Errors | Warnings | Rules broken |
| --- | ---: | ---: | --- | --- | --- |
${rows.join('\n')}

Rule IDs broken:

${detail.join('\n')}

Prompts: [\`scripts/eval/prompts.json\`](../../scripts/eval/prompts.json). Raw numbers: [\`results.json\`](results.json).

**Limits.** One run per prompt, so individual numbers move between runs. The static checker sees code, not pixels: it cannot judge spacing rhythm or whether a page looks generic, which the kit's visual audit covers. The kit's own checker is the judge here, so the scores measure how well each result follows the kit's rules; the rule IDs above show what that means in practice.
`);
console.log(`\nWrote docs/eval/README.md and results.json. Generated projects: ${outDir}`);
