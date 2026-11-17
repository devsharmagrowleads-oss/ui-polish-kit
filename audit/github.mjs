#!/usr/bin/env node
// Turns a checker result (`cli.mjs --json`) into GitHub Actions output:
// file:line annotations on the pull request and a job summary table.
//
//   node audit/github.mjs <result.json> [--report-name <artifact name>] [--max-annotations 50]
//
// Writes annotations to stdout as workflow commands, and the summary to
// $GITHUB_STEP_SUMMARY when it is set (otherwise to stdout). Exit code is
// always 0: the pass/fail decision belongs to cli.mjs.

import fs from 'node:fs';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const LEVEL = { error: 'error', warning: 'warning', info: 'notice' };

/** Escape a value for a workflow command (property or message). */
const escData = (s) => String(s).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
const escProp = (s) => escData(s).replace(/:/g, '%3A').replace(/,/g, '%2C');

export function annotations(result, { max = 50, base = '' } = {}) {
  const order = { error: 0, warning: 1, info: 2 };
  const sorted = [...result.findings].sort((a, b) => order[a.severity] - order[b.severity]);
  return sorted.slice(0, max).map((f) => {
    const props = [`title=${escProp(`${f.ruleId} ${f.title}`)}`];
    if (f.file) props.unshift(`file=${escProp(base + f.file)}`, `line=${f.line}`, `col=${f.column}`);
    return `::${LEVEL[f.severity]} ${props.join(',')}::${escData(f.message)}`;
  });
}

export function summary(result, { reportName } = {}) {
  const { error, warning, info } = result.counts;
  const lines = [
    `## ui-polish audit: ${result.pass ? '✅ pass' : '❌ fail'}`,
    '',
    `| Static score | Errors | Warnings | Info | Surface |`,
    `| --- | --- | --- | --- | --- |`,
    `| **${result.score}**/100 (minimum ${result.minScore}) | ${error} | ${warning} | ${info} | ${result.surface ? result.surface.value : 'n/a'} |`,
  ];
  if (result.polish) {
    lines.push('', `**Polish:** ${result.polish.score}/100 (${result.polish.band})${result.polish.meetsTarget ? '' : ', below target'}`);
  }
  const topics = Object.entries(result.byTopic).filter(([, t]) => t.error + t.warning + t.info > 0).sort((a, b) => b[1].deducted - a[1].deducted);
  if (topics.length) {
    lines.push('', '| Topic | Errors | Warnings | Info | Points lost |', '| --- | --- | --- | --- | --- |');
    for (const [prefix, t] of topics) lines.push(`| ${prefix} · ${t.topic} | ${t.error} | ${t.warning} | ${t.info} | ${t.deducted} |`);
  }
  if (reportName) lines.push('', `The full HTML report is attached to this run as the **${reportName}** artifact.`);
  return `${lines.join('\n')}\n`;
}

export function main(argv = process.argv.slice(2)) {
  const file = argv.find((a) => !a.startsWith('--'));
  const opt = (name) => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : undefined; };
  if (!file) { process.stderr.write('Usage: node audit/github.mjs <result.json> [--report-name name] [--max-annotations n] [--path-prefix dir/]\n'); return 2; }
  const result = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const line of annotations(result, { max: Number(opt('max-annotations') ?? 50), base: opt('path-prefix') ?? '' })) process.stdout.write(`${line}\n`);
  const md = summary(result, { reportName: opt('report-name') });
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
  else process.stdout.write(md);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main();
}
