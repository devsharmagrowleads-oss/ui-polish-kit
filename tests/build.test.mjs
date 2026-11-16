import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { buildOutputs, parseTopic, validateOutputs, loadTopics, ROOT, MARK_START, MARK_END, LIMITS } from '../scripts/build.mjs';
import { install, upsertBlock, parseArgs, AGENTS } from '../scripts/install.mjs';

const { topics, outputs } = buildOutputs();
const out = (rel) => outputs.get(rel);

test('generated files on disk are up to date (run `npm run build` if this fails)', () => {
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'build.mjs'), '--check'], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr || r.stdout);
});

test('twenty-one topics, each rule complete', () => {
  assert.equal(topics.length, 21);
  assert.deepEqual(topics.map((t) => t.prefix), ['NC', 'TK', 'TY', 'SP', 'SL', 'ST', 'FM', 'RS', 'DM', 'AX', 'MO', 'CO', 'FD', 'CP', 'BR', 'SA', 'DT', 'CH', 'NV', 'IC', 'IN']);
  for (const t of topics) {
    assert.ok(t.rules.length >= 5, `${t.file} has only ${t.rules.length} rules`);
    for (const r of t.rules) {
      for (const part of ['Rule', 'Why', 'Bad', 'Good', 'Check']) assert.ok(r.parts[part].length > 12, `${r.id} ${part} is too thin`);
    }
  }
});

test('an output exists for every agent', () => {
  const required = [
    'audit/rules-index.json', 'audit/CHECKLIST.md',
    'skills/ui-polish/SKILL.md', 'skills/ui-audit/SKILL.md',
    '.claude-plugin/plugin.json', '.claude-plugin/marketplace.json',
    'dist/claude-project/.claude/skills/ui-polish/SKILL.md', 'dist/claude-project/.claude/skills/ui-audit/SKILL.md',
    'dist/agents-md/AGENTS.md', 'dist/gemini/GEMINI.md', 'dist/copilot/.github/copilot-instructions.md',
    'dist/cursor/.cursor/rules/ui-polish-kit.mdc', 'dist/cursor/.cursor/rules/ui-polish-audit.mdc',
    'dist/windsurf/.windsurf/rules/ui-polish-kit.md', 'dist/windsurf/.windsurf/rules/ui-polish-audit.md',
  ];
  for (const rel of required) assert.ok(outputs.has(rel), `missing output ${rel}`);
  for (const t of topics) {
    assert.ok(outputs.has(`dist/cursor/.cursor/rules/ui-polish-${t.file.replace('.md', '')}.mdc`));
    assert.ok(outputs.has(`dist/windsurf/.windsurf/rules/ui-polish-${t.file}`));
  }
});

test('entry files are short, carry the core checklist, and point at every topic', () => {
  for (const rel of ['dist/agents-md/AGENTS.md', 'dist/gemini/GEMINI.md', 'dist/copilot/.github/copilot-instructions.md', 'dist/cursor/.cursor/rules/ui-polish-kit.mdc', 'skills/ui-polish/SKILL.md']) {
    const text = out(rel);
    assert.ok(text.length < LIMITS.alwaysOn, `${rel} is ${text.length} characters`);
    assert.match(text, /Non-negotiables/);
    assert.match(text, /audit\/cli\.mjs/);
    for (const t of topics) assert.ok(text.includes(`rules/${t.file}`), `${rel} does not point at ${t.file}`);
    assert.doesNotMatch(text, /\{\{/);
  }
  assert.ok(out('skills/ui-polish/SKILL.md').includes('${CLAUDE_PLUGIN_ROOT}/rules/01-native-controls.md'));
  assert.ok(out('dist/agents-md/AGENTS.md').includes('.ui-polish/rules/01-native-controls.md'));
});

test('per-agent frontmatter is well-formed', () => {
  const fm = (rel) => /^---\n([\s\S]*?)\n---\n/.exec(out(rel))[1];
  assert.match(fm('dist/cursor/.cursor/rules/ui-polish-kit.mdc'), /^alwaysApply: true$/m);
  assert.match(fm('dist/cursor/.cursor/rules/ui-polish-03-typography.mdc'), /^alwaysApply: false$/m);
  assert.match(fm('dist/cursor/.cursor/rules/ui-polish-03-typography.mdc'), /^description: "Typography rules/m);
  assert.match(fm('dist/windsurf/.windsurf/rules/ui-polish-kit.md'), /^trigger: always_on$/m);
  assert.match(fm('dist/windsurf/.windsurf/rules/ui-polish-03-typography.md'), /^trigger: model_decision$/m);
  assert.match(fm('skills/ui-polish/SKILL.md'), /^name: "ui-polish"$/m);
  assert.match(fm('skills/ui-audit/SKILL.md'), /^name: "ui-audit"$/m);
  for (const [rel, text] of outputs) {
    if (rel.includes('.windsurf/')) assert.ok(text.length <= LIMITS.windsurfFile, `${rel} is ${text.length} characters`);
  }
  for (const rel of ['dist/agents-md/AGENTS.md', 'dist/gemini/GEMINI.md', 'dist/copilot/.github/copilot-instructions.md']) {
    assert.ok(out(rel).startsWith(MARK_START) && out(rel).trimEnd().endsWith(MARK_END));
    assert.doesNotMatch(out(rel), /^---\n/, `${rel} must be plain Markdown without frontmatter`);
  }
});

test('topic digests carry every rule of the topic', () => {
  for (const t of topics) {
    const digest = out(`dist/cursor/.cursor/rules/ui-polish-${t.file.replace('.md', '')}.mdc`);
    for (const r of t.rules) assert.ok(digest.includes(`**${r.id} `), `${t.file} digest lacks ${r.id}`);
    assert.ok(digest.includes(`.ui-polish/rules/${t.file}`));
  }
});

test('Claude Code plugin and marketplace manifests', () => {
  const plugin = JSON.parse(out('.claude-plugin/plugin.json'));
  const market = JSON.parse(out('.claude-plugin/marketplace.json'));
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  assert.equal(plugin.name, 'ui-polish-kit');
  assert.equal(plugin.version, pkg.version);
  assert.equal(plugin.license, 'MIT');
  assert.ok(market.owner.name && Array.isArray(market.plugins));
  assert.equal(market.plugins[0].name, plugin.name, 'marketplace entry name must equal the plugin name');
  assert.equal(market.plugins[0].source, './');
  assert.ok(!fs.existsSync(path.join(ROOT, 'bin')), 'a top-level bin/ stops claude.ai from installing the plugin');
});

test('rules-index.json and CHECKLIST.md cover every rule', () => {
  const index = JSON.parse(out('audit/rules-index.json'));
  const all = topics.flatMap((t) => t.rules);
  assert.equal(Object.keys(index.rules).length, all.length);
  for (const r of all) {
    assert.equal(index.rules[r.id].severity, r.severity);
    assert.ok(out('audit/CHECKLIST.md').includes(`**${r.id}**`));
  }
});

test('parser rejects malformed rule files with a message that says what to fix', () => {
  const head = '---\ntopic: demo\nprefix: DE\ntitle: Demo\nwhen: testing\n---\n\n# Demo\n\nIntro.\n\n';
  const rule = (id = 'DE-01', extra = {}) => {
    const p = { Rule: 'Do the thing every time.', Why: 'Because it matters a lot.', Bad: '```css\na{}\n```', Good: '```css\nb{}\n```', Check: 'Look at the thing.', ...extra };
    return `## ${id} · A rule\nSeverity: ${extra.severity || 'error'} · Check: ${extra.check || 'visual'}\n\n${['Rule', 'Why', 'Bad', 'Good', 'Check'].filter((k) => p[k] !== null).map((k) => `**${k}.** ${p[k]}`).join('\n\n')}\n\n`;
  };
  assert.equal(parseTopic(head + rule(), 'x.md').rules.length, 1);
  assert.throws(() => parseTopic(head + rule('DE-01', { Why: null }), 'x.md'), /missing \*\*Why\.\*\*/);
  assert.throws(() => parseTopic(head + rule('DE-01', { Good: 'no code here' }), 'x.md'), /needs a fenced code example/);
  assert.throws(() => parseTopic(head + rule('DE-01', { severity: 'fatal' }), 'x.md'), /unknown severity/);
  assert.throws(() => parseTopic(head + rule('XX-01'), 'x.md'), /does not match topic prefix/);
  assert.throws(() => parseTopic(head + rule('DE-01') + rule('DE-03'), 'x.md'), /numbered in order/);
  assert.throws(() => parseTopic(head + rule('DE-01') + '## Not a rule\n\ntext\n', 'x.md'), /heading must be/);
  assert.throws(() => parseTopic(head.replace('prefix: DE\n', '') + rule(), 'x.md'), /frontmatter needs "prefix"/);
});

test('output validation catches malformed generated files', () => {
  assert.throws(() => validateOutputs(new Map([['dist/cursor/.cursor/rules/x.mdc', '# no frontmatter\n']])), /missing frontmatter/);
  assert.throws(() => validateOutputs(new Map([['dist/windsurf/.windsurf/rules/x.md', '---\ntrigger: sometimes\n---\n']])), /valid trigger/);
  assert.throws(() => validateOutputs(new Map([['a.json', '{ nope']])), /invalid JSON/);
  assert.throws(() => validateOutputs(new Map([['dist/agents-md/AGENTS.md', 'no markers {{KIT}}']])), /unreplaced|markers/);
});

test('rules and checker agree on what is static', () => {
  assert.doesNotThrow(() => loadTopics());
});

// ---------------------------------------------------------------------------
// Installer
// ---------------------------------------------------------------------------

test('install: every agent gets its files, existing instructions are kept, re-install is idempotent', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ui-polish-install-'));
  try {
    fs.writeFileSync(path.join(dir, 'AGENTS.md'), '# Team rules\n\nUse pnpm.\n');
    install({ agents: AGENTS, target: dir, log: () => {} });
    const has = (rel) => fs.existsSync(path.join(dir, rel));
    for (const rel of [
      '.ui-polish/rules/01-native-controls.md', '.ui-polish/rules/16-self-audit.md', '.ui-polish/audit/cli.mjs', '.ui-polish/audit/lib/run.mjs',
      '.ui-polish/audit/rules-index.json', '.ui-polish/audit/PROCEDURE.md', '.ui-polish/audit/CHECKLIST.md', '.ui-polish/audit/screenshot.mjs',
      '.ui-polish/templates/design.md', '.ui-polish/recipes/react-tailwind-shadcn/tokens/tokens.css', '.ui-polish/recipes/react-tailwind-shadcn/components/select.tsx',
      'AGENTS.md', 'GEMINI.md', '.github/copilot-instructions.md', '.cursor/rules/ui-polish-kit.mdc', '.windsurf/rules/ui-polish-kit.md',
      '.devin/rules/ui-polish-kit.md', '.claude/skills/ui-polish/SKILL.md', '.claude/skills/ui-audit/SKILL.md',
    ]) assert.ok(has(rel), `not installed: ${rel}`);
    assert.ok(!has('.ui-polish/rules/_core.md'));

    const agents = fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8');
    assert.ok(agents.startsWith('# Team rules\n\nUse pnpm.'));
    assert.ok(agents.includes('Non-negotiables'));

    install({ agents: ['codex'], target: dir, log: () => {} });
    const again = fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8');
    assert.equal(again, agents, 're-install must not duplicate the block');

    // Every path the entry file points to exists in the installed project.
    for (const m of agents.matchAll(/`(\.ui-polish\/[\w./-]+\.\w+)`/g)) assert.ok(has(m[1]), `AGENTS.md points to missing ${m[1]}`);

    // The installed checker runs from the project and ignores the kit folder itself.
    fs.writeFileSync(path.join(dir, 'page.html'), '<select><option>One</option></select>');
    const r = spawnSync(process.execPath, [path.join(dir, '.ui-polish', 'audit', 'cli.mjs'), dir, '--json'], { encoding: 'utf8' });
    assert.equal(r.status, 1);
    const json = JSON.parse(r.stdout);
    assert.ok(json.findings.some((f) => f.ruleId === 'NC-01' && f.file === 'page.html'));
    assert.ok(json.findings.every((f) => !f.file || !f.file.startsWith('.')), 'agent and kit folders must not be scanned');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('install: argument parsing and block upsert', () => {
  assert.deepEqual(parseArgs(['cursor,claude', '--target', 'x']).agents, ['cursor', 'claude']);
  assert.deepEqual(parseArgs(['all']).agents, AGENTS);
  assert.deepEqual(parseArgs(['agents-md']).agents, ['codex']);
  assert.throws(() => parseArgs(['emacs']), /Unknown agent/);
  assert.throws(() => install({ agents: ['codex'], target: ROOT, log: () => {} }), /repository itself/);

  const block = `${MARK_START}\nnew\n${MARK_END}\n`;
  assert.equal(upsertBlock(null, block), block);
  assert.equal(upsertBlock('mine\n', block), `mine\n\n${block}`);
  assert.equal(upsertBlock(`mine\n\n${MARK_START}\nold\n${MARK_END}\nafter\n`, block), `mine\n\n${MARK_START}\nnew\n${MARK_END}\nafter\n`);
});
