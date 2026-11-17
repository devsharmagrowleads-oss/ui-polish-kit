#!/usr/bin/env node
// ui-polish static checker. Zero dependencies; Node 20+.
//
//   node audit/cli.mjs [path] [--json] [--min-score N] [--fail-on error|warning|never]
//                      [--rules ID,ID] [--config file] [--surface S] [--max-per-file N] [--list-rules]

import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { audit, loadRuleIndex, STATIC_RULE_IDS } from './lib/run.mjs';
import { formatText } from './lib/report.mjs';

const HELP = `ui-polish audit: static UI checks with file:line, rule ID, severity and a score.

Usage
  node audit/cli.mjs [path] [options]         (path defaults to the current directory)

Options
  --json                 Machine-readable output (findings, counts, score, pass)
  --min-score <n>        Score required to pass (default 85, or config "minScore")
  --fail-on <level>      error (default) | warning | never
  --rules <ids>          Only report these rule IDs (comma separated)
  --config <file>        Config file (default: ui-polish.config.json in the project root)
  --surface <kind>       marketing | app | both | auto (default: config, then design.md, then detected)
  --max-per-file <n>     Limit findings printed per file in text output
  --list-rules           List every rule and whether the static checker covers it
  --no-color             Disable ANSI colours
  -h, --help             Show this help

Exit codes: 0 pass, 1 fail, 2 usage or configuration error.

Ignore comments (any comment syntax)
  ui-polish-ignore-next-line [IDs]    ui-polish-ignore-line [IDs]
  ui-polish-disable [IDs] … ui-polish-enable     ui-polish-ignore-file [IDs]

Config (ui-polish.config.json)
  { "include": [], "exclude": ["legacy/**"], "tokenFiles": ["src/styles/brand.css"],
    "rules": { "TK-03": "off", "MO-01": "warning" }, "minScore": 85, "failOn": "error",
    "allowSystemFonts": false, "darkMode": true, "designDoc": "docs/design.md",
    "surface": "app" }
`;

export function parseArgs(argv) {
  const opts = { path: '.', json: false, color: undefined, listRules: false, help: false, maxPerFile: 0 };
  const need = (i, flag) => {
    if (argv[i + 1] === undefined || argv[i + 1].startsWith('--')) throw new Error(`${flag} needs a value`);
    return argv[i + 1];
  };
  let pathSet = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') opts.json = true;
    else if (a === '--no-color') opts.color = false;
    else if (a === '--list-rules') opts.listRules = true;
    else if (a === '-h' || a === '--help') opts.help = true;
    else if (a === '--min-score') {
      opts.minScore = Number(need(i++, a));
      if (!Number.isFinite(opts.minScore) || opts.minScore < 0 || opts.minScore > 100) throw new Error('--min-score must be a number from 0 to 100');
    } else if (a === '--fail-on') opts.failOn = need(i++, a);
    else if (a === '--rules') opts.only = need(i++, a).split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
    else if (a === '--config') opts.config = need(i++, a);
    else if (a === '--surface') opts.overrides = { ...opts.overrides, surface: need(i++, a) };
    else if (a === '--max-per-file') opts.maxPerFile = Number(need(i++, a)) || 0;
    else if (a.startsWith('-')) throw new Error(`Unknown option ${a}`);
    else if (!pathSet) { opts.path = a; pathSet = true; } else throw new Error(`Unexpected argument ${a}`);
  }
  return opts;
}

export function main(argv = process.argv.slice(2)) {
  let opts;
  try {
    opts = parseArgs(argv);
  } catch (err) {
    process.stderr.write(`${err.message}\n\n${HELP}`);
    return 2;
  }
  if (opts.help) { process.stdout.write(HELP); return 0; }

  try {
    if (opts.listRules) {
      const index = loadRuleIndex();
      const rows = Object.entries(index.rules).map(([id, r]) => `${id}  ${r.severity.padEnd(7)}  ${STATIC_RULE_IDS.includes(id) ? 'static' : 'visual'}  ${r.title}${r.surface && r.surface !== 'all' ? `  (${r.surface} only)` : ''}`);
      process.stdout.write(`${rows.join('\n')}\n`);
      return 0;
    }
    if (opts.only) {
      const index = loadRuleIndex();
      const bad = opts.only.filter((id) => !index.rules[id]);
      if (bad.length) throw new Error(`Unknown rule ID(s): ${bad.join(', ')}`);
    }
    const result = audit(opts.path, opts);
    if (opts.json) process.stdout.write(`${JSON.stringify({ version: 1, ...result }, null, 2)}\n`);
    else {
      const color = opts.color ?? (process.stdout.isTTY && !process.env.NO_COLOR);
      process.stdout.write(`${formatText(result, { color, maxPerFile: opts.maxPerFile })}\n`);
    }
    return result.pass ? 0 : 1;
  } catch (err) {
    process.stderr.write(`ui-polish: ${err.message}\n`);
    return 2;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main();
}
