// Orchestrates one audit run: load project, run detectors, apply ignores and
// config, score.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig, loadProject } from './project.mjs';
import { runFileDetectors } from './detect-file.mjs';
import { runProjectDetectors } from './detect-project.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

export const WEIGHTS = { error: 5, warning: 2, info: 0.5 };
/** One rule can cost at most this many times its weight, so a single repeated mistake cannot zero the score. */
export const RULE_CAP = 3;
const SEVERITIES = ['error', 'warning', 'info'];

/** Rule IDs the static checker can emit. Kept in sync with rules/ by tests/build.test.mjs. */
export const STATIC_RULE_IDS = [
  'NC-01', 'NC-02', 'NC-03', 'NC-04', 'NC-05', 'NC-06', 'NC-07', 'NC-08', 'NC-09', 'NC-10',
  'TK-01', 'TK-02', 'TK-03', 'TK-04', 'TK-05', 'TK-06',
  'TY-01', 'TY-02', 'TY-03', 'TY-04',
  'SL-01', 'SL-02', 'SL-03', 'SL-04', 'SL-05', 'SL-06', 'SL-07',
  'FM-01', 'FM-02',
  'RS-01', 'RS-02', 'RS-03',
  'DM-01', 'DM-02', 'DM-03', 'DM-04',
  'AX-01', 'AX-02', 'AX-03', 'AX-04', 'AX-05', 'AX-06', 'AX-07', 'AX-08',
  'MO-01', 'MO-02', 'MO-03', 'MO-04',
  'FD-01', 'FD-02', 'FD-03', 'FD-04', 'FD-05',
  'CP-01', 'CP-02', 'CP-03',
  'BR-01',
];

export function loadRuleIndex() {
  const file = path.join(here, '..', 'rules-index.json');
  if (!fs.existsSync(file)) throw new Error(`Missing ${file}. Run \`npm run build\` in the ui-polish-kit repo to generate it.`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/**
 * @param {string} root project directory
 * @param {{config?:string, minScore?:number, failOn?:string, only?:string[], overrides?:object}} options
 */
export function audit(root, options = {}) {
  root = path.resolve(root);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) throw new Error(`Not a directory: ${root}`);
  const index = loadRuleIndex();
  const config = { ...loadConfig(root, options.config), ...(options.overrides || {}) };
  if (options.minScore !== undefined) config.minScore = options.minScore;
  if (options.failOn) config.failOn = options.failOn;
  for (const [id, level] of Object.entries(config.rules)) {
    if (!index.rules[id]) throw new Error(`Config "rules" names an unknown rule: ${id}`);
    if (level !== 'off' && !SEVERITIES.includes(level)) throw new Error(`Config "rules".${id} must be off, error, warning or info (got ${JSON.stringify(level)})`);
  }
  if (!['error', 'warning', 'never'].includes(config.failOn)) throw new Error(`failOn must be error, warning or never (got ${JSON.stringify(config.failOn)})`);

  const project = loadProject(root, config);
  const findings = [];
  const seen = new Set();

  const severityOf = (ruleId) => {
    const meta = index.rules[ruleId];
    if (!meta) throw new Error(`Detector reported unknown rule ${ruleId}; rules-index.json is out of date (run the build).`);
    const level = config.rules[ruleId] ?? meta.severity;
    if (level === 'off') return null;
    if (options.only && !options.only.includes(ruleId)) return null;
    return level;
  };

  const add = (ruleId, f, pos, message) => {
    const severity = severityOf(ruleId);
    if (!severity) return;
    let file = null;
    let line = 0;
    let column = 0;
    if (f) {
      ({ line, column } = f.at(pos));
      if (f.ignored(ruleId, line)) return;
      file = f.rel;
    }
    const key = `${ruleId}|${file}|${line}`;
    if (seen.has(key)) return;
    seen.add(key);
    const meta = index.rules[ruleId];
    findings.push({ ruleId, severity, title: meta.title, file, line, column, message, doc: `rules/${meta.file}#${ruleId.toLowerCase()}` });
  };

  for (const f of project.files) {
    const grouped = new Map(); // ruleId -> { pos, sample, count, fn }
    const report = (ruleId, pos, message) => add(ruleId, f, pos, message);
    const once = (ruleId, pos, sample, fn) => {
      if (f.ignored(ruleId, f.at(pos).line)) return;
      const g = grouped.get(ruleId);
      if (g) g.count++;
      else grouped.set(ruleId, { pos, sample, count: 1, fn });
    };
    runFileDetectors(f, project.facts, report, once);
    for (const [ruleId, g] of grouped) add(ruleId, f, g.pos, g.fn(g.count, g.sample));
  }

  const byRel = new Map(project.files.map((f) => [f.rel, f]));
  runProjectDetectors(project, (ruleId, where, message) => {
    const f = where ? byRel.get(where.rel) : null;
    add(ruleId, f || null, where ? where.pos : 0, message);
  });

  const order = { error: 0, warning: 1, info: 2 };
  findings.sort((a, b) => (a.file === b.file ? a.line - b.line || order[a.severity] - order[b.severity] : a.file === null ? -1 : b.file === null ? 1 : a.file.localeCompare(b.file)));

  return { ...score(findings, config, index), root, configFile: config.configFile, designDoc: project.facts.designDoc, filesScanned: project.files.length, findings };
}

export function score(findings, config, index) {
  const counts = { error: 0, warning: 0, info: 0 };
  const perRule = new Map();
  for (const f of findings) {
    counts[f.severity]++;
    const r = perRule.get(f.ruleId) || { severity: f.severity, count: 0 };
    r.count++;
    perRule.set(f.ruleId, r);
  }
  let deducted = 0;
  const byTopic = {};
  for (const t of index.topics) byTopic[t.prefix] = { topic: t.title, error: 0, warning: 0, info: 0, deducted: 0 };
  for (const [ruleId, r] of perRule) {
    const cost = Math.min(r.count, RULE_CAP) * WEIGHTS[r.severity];
    deducted += cost;
    const t = byTopic[ruleId.slice(0, 2)];
    if (t) { t[r.severity] += r.count; t.deducted += cost; }
  }
  const value = Math.max(0, Math.round(100 - deducted));
  let pass = value >= config.minScore && counts.error === 0;
  if (config.failOn === 'warning') pass = pass && counts.warning === 0;
  if (config.failOn === 'never') pass = true;
  return { score: value, minScore: config.minScore, failOn: config.failOn, pass, counts, byTopic };
}
