#!/usr/bin/env node
// Installs the kit into a project for one or more agents.
//
//   node scripts/install.mjs <agent...> [--target <dir>] [--dry-run]
//
// Every agent gets the shared kit folder `<target>/.ui-polish/` (rules, recipes,
// audit checker, design.md template) plus its own entry file:
//
//   codex     AGENTS.md                              (also read by Cursor, Copilot agent, Windsurf, and others)
//   claude    .claude/skills/ui-polish, ui-audit, ui-elevate (project skills; the plugin is the alternative)
//   cursor    .cursor/rules/ui-polish-*.mdc
//   windsurf  .windsurf/rules/ui-polish-*.md
//   devin     .devin/rules/ui-polish-*.md            (Devin Desktop, the current name and path for Windsurf rules)
//   copilot   .github/copilot-instructions.md
//   gemini    GEMINI.md
//   all       everything above

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const MARK_START = '<!-- ui-polish-kit:start';
export const MARK_END = '<!-- ui-polish-kit:end -->';
export const AGENTS = ['codex', 'claude', 'cursor', 'windsurf', 'devin', 'copilot', 'gemini'];
const ALIASES = { 'agents-md': 'codex', agents: 'codex', 'claude-code': 'claude', 'github-copilot': 'copilot', 'gemini-cli': 'gemini' };

const HELP = `Install ui-polish-kit into a project.

Usage
  node scripts/install.mjs <agent...> [--target <dir>] [--dry-run]

Agents
  ${AGENTS.join(', ')}, all

Options
  --target <dir>   Project to install into (default: current directory)
  --dry-run        Print what would be written without changing anything
`;

function copyDir(from, to, log, dry, filter = () => true) {
  let count = 0;
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, e.name);
    const dst = path.join(to, e.name);
    if (!filter(src)) continue;
    if (e.isDirectory()) count += copyDir(src, dst, log, dry, filter);
    else if (e.isFile()) {
      if (!dry) { fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.copyFileSync(src, dst); }
      count++;
    }
  }
  return count;
}

/** Insert or replace the generated block in a file that may hold the owner's own instructions. */
export function upsertBlock(existing, block) {
  const b = block.trimEnd();
  if (existing === null || !existing.trim()) return `${b}\n`;
  const start = existing.indexOf(MARK_START);
  const end = existing.indexOf(MARK_END);
  if (start >= 0 && end > start) return `${existing.slice(0, start)}${b}${existing.slice(end + MARK_END.length)}`;
  return `${existing.trimEnd()}\n\n${b}\n`;
}

export function install({ agents, target, dry = false, log = console.log }) {
  target = path.resolve(target);
  if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) throw new Error(`Target is not a directory: ${target}`);
  if (target === ROOT) throw new Error('Target is the ui-polish-kit repository itself. Pass --target <your project>.');
  for (const need of ['audit/rules-index.json', 'dist/agents-md/AGENTS.md']) {
    if (!fs.existsSync(path.join(ROOT, need))) throw new Error(`Missing ${need}. Run \`npm run build\` in ui-polish-kit first.`);
  }
  const rel = (p) => path.relative(target, p).replace(/\\/g, '/');
  const written = [];

  // --- shared kit
  const kit = path.join(target, '.ui-polish');
  if (!dry) {
    for (const sub of ['rules', 'recipes', 'audit', 'templates']) fs.rmSync(path.join(kit, sub), { recursive: true, force: true });
    fs.mkdirSync(kit, { recursive: true });
  }
  let n = 0;
  n += copyDir(path.join(ROOT, 'rules'), path.join(kit, 'rules'), log, dry, (p) => !path.basename(p).startsWith('_'));
  n += copyDir(path.join(ROOT, 'recipes'), path.join(kit, 'recipes'), log, dry);
  n += copyDir(path.join(ROOT, 'audit'), path.join(kit, 'audit'), log, dry);
  n += copyDir(path.join(ROOT, 'templates'), path.join(kit, 'templates'), log, dry);
  const version = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;
  const readme = `# .ui-polish\n\nInstalled by ui-polish-kit ${version}. Rules, recipes and the audit checker that this project's AI agent follows when it builds UI.\n\nDo not edit: re-run the installer to update. Project decisions belong in \`design.md\` (template: \`templates/design.md\`) and \`ui-polish.config.json\` at the project root.\n\n- Static check: \`node .ui-polish/audit/cli.mjs .\`\n- Audit procedure: \`audit/PROCEDURE.md\`\n- Premium pass and Polish score: \`audit/ELEVATE.md\`, \`audit/POLISH.md\`\n`;
  if (!dry) fs.writeFileSync(path.join(kit, 'README.md'), readme);
  written.push(`.ui-polish/ (${n + 1} files: rules, recipes, audit, templates)`);

  const copyTree = (fromRel, toRel) => {
    const count = copyDir(path.join(ROOT, fromRel), path.join(target, toRel), log, dry);
    written.push(`${toRel}/ (${count} files)`);
  };
  const upsert = (fromRel, toRel) => {
    const dst = path.join(target, toRel);
    const existing = fs.existsSync(dst) ? fs.readFileSync(dst, 'utf8') : null;
    const next = upsertBlock(existing, fs.readFileSync(path.join(ROOT, fromRel), 'utf8'));
    if (!dry) { fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.writeFileSync(dst, next); }
    written.push(`${rel(dst)} (${existing === null ? 'created' : existing.includes(MARK_START) ? 'block updated' : 'block appended, your content kept'})`);
  };

  for (const agent of agents) {
    switch (agent) {
      case 'codex': upsert('dist/agents-md/AGENTS.md', 'AGENTS.md'); break;
      case 'gemini': upsert('dist/gemini/GEMINI.md', 'GEMINI.md'); break;
      case 'copilot': upsert('dist/copilot/.github/copilot-instructions.md', '.github/copilot-instructions.md'); break;
      case 'cursor': copyTree('dist/cursor/.cursor/rules', '.cursor/rules'); break;
      case 'windsurf': copyTree('dist/windsurf/.windsurf/rules', '.windsurf/rules'); break;
      case 'devin': copyTree('dist/windsurf/.windsurf/rules', '.devin/rules'); break;
      case 'claude': copyTree('dist/claude-project/.claude/skills', '.claude/skills'); break;
      default: throw new Error(`Unknown agent: ${agent}`);
    }
  }

  log(`${dry ? 'Would install' : 'Installed'} ui-polish-kit ${version} into ${target}`);
  for (const w of written) log(`  ${w}`);
  if (!dry) {
    log('\nNext');
    log('  1. Ask your agent to do the brand intake: it writes design.md from .ui-polish/templates/design.md.');
    log('  2. Check an existing UI:  node .ui-polish/audit/cli.mjs .');
    log('  3. To raise a working UI to premium, ask your agent to run the UI elevate (.ui-polish/audit/ELEVATE.md).');
    log('  4. Commit .ui-polish/ and the agent files so the whole team (and CI) gets them.');
    log('  5. The rules look up Modern Web Guidance with npx (needs Node and internet). To also install it');
    log('     as a skill for your agent: npx modern-web-guidance@latest install');
  }
  return written;
}

export function parseArgs(argv) {
  const opts = { agents: [], target: process.cwd(), dry: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--target') {
      if (!argv[i + 1]) throw new Error('--target needs a directory');
      opts.target = argv[++i];
    } else if (a === '--dry-run') opts.dry = true;
    else if (a === '-h' || a === '--help') opts.help = true;
    else if (a === '--agent') continue;
    else if (a.startsWith('-')) throw new Error(`Unknown option ${a}`);
    else {
      for (const name of a.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)) {
        if (name === 'all') opts.agents.push(...AGENTS);
        else if (AGENTS.includes(ALIASES[name] || name)) opts.agents.push(ALIASES[name] || name);
        else throw new Error(`Unknown agent "${name}". Choose from: ${AGENTS.join(', ')}, all`);
      }
    }
  }
  opts.agents = [...new Set(opts.agents)];
  return opts;
}

export function main(argv = process.argv.slice(2)) {
  try {
    const opts = parseArgs(argv);
    if (opts.help || !opts.agents.length) {
      console.log(HELP);
      return opts.help ? 0 : 2;
    }
    install(opts);
    return 0;
  } catch (err) {
    console.error(`install: ${err.message}`);
    return 2;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main();
}
