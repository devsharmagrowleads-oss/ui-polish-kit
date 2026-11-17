// Shareable HTML report: one self-contained file with the static score, the
// Polish score, before/after deltas, findings by file and the screenshots.
// No dependencies; the page works offline (the web font is optional).

import fs from 'node:fs';
import path from 'node:path';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };
/** Embed screenshots up to this total size; above it, link to them next to the report instead. */
const EMBED_LIMIT = 12 * 1024 * 1024;

/**
 * Collect screenshots from `dir` (and `dir/before/` for the baseline captures).
 * Returns [{ name, src, before }] where src/before are data: URIs or paths relative to `outFile`.
 */
export function collectScreenshots(dir, outFile) {
  if (!dir || !fs.existsSync(dir)) return [];
  const list = (d) => (fs.existsSync(d) ? fs.readdirSync(d).filter((f) => MIME[path.extname(f).toLowerCase()]).sort() : []);
  const now = list(dir);
  const beforeDir = path.join(dir, 'before');
  const before = new Set(list(beforeDir));
  const files = [...now.map((f) => path.join(dir, f)), ...now.filter((f) => before.has(f)).map((f) => path.join(beforeDir, f))];
  const total = files.reduce((n, f) => n + fs.statSync(f).size, 0);
  const embed = total <= EMBED_LIMIT;
  const src = (file) => (embed
    ? `data:${MIME[path.extname(file).toLowerCase()]};base64,${fs.readFileSync(file).toString('base64')}`
    : path.relative(path.dirname(path.resolve(outFile)), path.resolve(file)).split(path.sep).join('/'));
  return now.map((f) => ({ name: f, src: src(path.join(dir, f)), before: before.has(f) ? src(path.join(beforeDir, f)) : null }));
}

function delta(now, then) {
  if (then === undefined || then === null || now === null || now === undefined) return '';
  const d = now - then;
  if (d === 0) return '<span class="delta">no change</span>';
  return `<span class="delta ${d > 0 ? 'up' : 'down'}">${d > 0 ? '+' : '−'}${Math.abs(d)} from ${then}</span>`;
}

function segments(score) {
  if (score === null) return '<span class="na">n/a</span>';
  const bar = [0, 1, 2, 3].map((i) => `<span class="seg${i < score ? ' on' : ''}"></span>`).join('');
  return `<span class="segs" aria-hidden="true">${bar}</span><span class="dim-score">${score} / 4</span>`;
}

const CSS = `
:root {
  color-scheme: light dark;
  --bg: oklch(0.985 0.004 195); --surface: oklch(1 0 0); --sunken: oklch(0.96 0.006 195);
  --fg: oklch(0.22 0.02 195); --muted: oklch(0.48 0.02 195); --border: oklch(0.9 0.008 195);
  --primary: oklch(0.43 0.08 195); --primary-soft: oklch(0.94 0.03 195);
  --error: oklch(0.52 0.19 27); --warning: oklch(0.55 0.13 70); --info: oklch(0.5 0.1 250); --success: oklch(0.5 0.12 155);
  --radius: 10px; --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px; --space-6: 24px; --space-8: 32px; --space-12: 48px;
  --font: "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif; --mono: "IBM Plex Mono", ui-monospace, monospace;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: oklch(0.17 0.01 195); --surface: oklch(0.21 0.012 195); --sunken: oklch(0.19 0.01 195);
    --fg: oklch(0.94 0.01 195); --muted: oklch(0.72 0.02 195); --border: oklch(0.32 0.015 195);
    --primary: oklch(0.8 0.09 195); --primary-soft: oklch(0.3 0.04 195);
    --error: oklch(0.72 0.15 27); --warning: oklch(0.8 0.12 75); --info: oklch(0.75 0.1 250); --success: oklch(0.75 0.12 155);
  }
}
* { box-sizing: border-box; }
html { background: var(--bg); color: var(--fg); font: 400 16px/1.55 var(--font); scrollbar-color: var(--border) transparent; }
body { margin: 0; }
a { color: var(--primary); }
:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; border-radius: 4px; }
.wrap { max-width: 1120px; margin: 0 auto; padding: var(--space-12) var(--space-4); }
header.top { display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between; gap: var(--space-4); margin-bottom: var(--space-8); }
.eyebrow { margin: 0 0 var(--space-1); color: var(--muted); font-size: 14px; }
h1 { margin: 0; font-size: 32px; line-height: 1.2; font-weight: 600; letter-spacing: -0.01em; }
h2 { margin: var(--space-12) 0 var(--space-4); font-size: 20px; line-height: 1.3; font-weight: 600; }
.meta { color: var(--muted); font-size: 14px; margin: var(--space-1) 0 0; overflow-wrap: anywhere; }
.verdict { display: inline-flex; align-items: center; gap: var(--space-2); padding: var(--space-1) var(--space-3); border-radius: 999px; font-weight: 600; font-size: 14px; border: 1px solid currentColor; }
.verdict.pass { color: var(--success); } .verdict.fail { color: var(--error); }
.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-4); }
.card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: var(--space-6); }
.card .label { margin: 0; color: var(--muted); font-size: 14px; }
.card .value { margin: var(--space-1) 0; font-size: 44px; line-height: 1.1; font-weight: 600; font-variant-numeric: tabular-nums; }
.card .value small { font-size: 18px; font-weight: 400; color: var(--muted); }
.card p { margin: 0; font-size: 14px; color: var(--muted); }
.delta { font-size: 14px; color: var(--muted); } .delta.up { color: var(--success); } .delta.down { color: var(--error); }
.band { display: inline-block; } .band::first-letter { text-transform: uppercase; }
.dims { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--space-2); }
.dims li { display: grid; grid-template-columns: minmax(0, 1fr) auto; min-inline-size: 0; gap: var(--space-1) var(--space-4); align-items: center; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: var(--space-3) var(--space-4); }
.dims .name { font-weight: 500; }
.dims .note { grid-column: 1 / -1; margin: 0; color: var(--muted); font-size: 14px; overflow-wrap: anywhere; }
.segs { display: inline-flex; gap: 3px; margin-inline-end: var(--space-2); vertical-align: middle; }
.seg { inline-size: 22px; block-size: 8px; border-radius: 2px; background: var(--sunken); border: 1px solid var(--border); }
.seg.on { background: var(--primary); border-color: var(--primary); }
.dim-score, .na { font-variant-numeric: tabular-nums; font-size: 14px; color: var(--muted); }
table { inline-size: 100%; border-collapse: collapse; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; font-size: 14px; }
caption { text-align: start; color: var(--muted); padding-block-end: var(--space-2); caption-side: top; }
th, td { padding: var(--space-2) var(--space-4); border-block-end: 1px solid var(--border); text-align: start; }
th { font-weight: 600; color: var(--muted); background: var(--sunken); }
tbody th { font-weight: 500; color: var(--fg); background: none; }
td.num, th.num { text-align: end; font-variant-numeric: tabular-nums; }
.table-scroll { overflow-x: auto; }
details { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); margin-block-end: var(--space-2); }
summary { cursor: pointer; padding: var(--space-3) var(--space-4); font-family: var(--mono); font-size: 14px; display: flex; gap: var(--space-3); justify-content: space-between; }
summary .counts { font-family: var(--font); color: var(--muted); }
.findings { list-style: none; margin: 0; padding: 0 var(--space-4) var(--space-3); }
.findings li { overflow-wrap: anywhere; display: grid; grid-template-columns: 76px 64px minmax(0, 1fr); gap: var(--space-3); padding: var(--space-2) 0; border-block-start: 1px solid var(--border); font-size: 14px; }
.sev { font-weight: 600; } .sev.error { color: var(--error); } .sev.warning { color: var(--warning); } .sev.info { color: var(--info); }
.rule { font-family: var(--mono); } .where { color: var(--muted); font-family: var(--mono); }
.gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr)); gap: var(--space-4); }
figure { margin: 0; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: var(--space-3); }
figure.pair { grid-column: 1 / -1; }
.pair-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: var(--space-3); }
figure img { display: block; inline-size: 100%; block-size: auto; border-radius: 6px; border: 1px solid var(--border); background: var(--sunken); }
figcaption { margin-block-start: var(--space-2); font-family: var(--mono); font-size: 13px; color: var(--muted); overflow-wrap: anywhere; }
.empty { color: var(--muted); }
footer { margin-block-start: var(--space-12); color: var(--muted); font-size: 14px; }
@media (max-width: 560px) { .findings li { grid-template-columns: 1fr; gap: 0; } h1 { font-size: 26px; } }
@media print { .wrap { padding: 0; } details { break-inside: avoid; } }
`;

/**
 * @param {object} result  audit() result, optionally with .polish (scorePolish output)
 * @param {{ before?: object, screenshots?: Array, generatedAt?: string }} options
 *   before: a previous `--json` result (may include .polish)
 */
export function renderHtml(result, { before = null, screenshots = [], generatedAt = new Date().toISOString().slice(0, 10) } = {}) {
  const name = path.basename(result.root);
  const polish = result.polish || null;
  const pass = result.pass && (!polish || polish.meetsTarget);
  const { error, warning, info } = result.counts;
  const surface = result.surface ? `${result.surface.value}${result.surface.source ? ` (${result.surface.source})` : ''}` : 'unknown';

  const cards = [
    `<div class="card"><p class="label">Static score</p><p class="value">${result.score}<small> / 100</small></p>
      <p>${error} errors · ${warning} warnings · ${info} info</p><p>${delta(result.score, before?.score)}</p></div>`,
    polish
      ? `<div class="card"><p class="label">Polish score</p><p class="value">${polish.score}<small> / 100</small></p>
      <p><span class="band">${esc(polish.band)}</span>${polish.meetsTarget ? '' : ` · target ${polish.target.score}, no dimension below ${polish.target.dimension}`}</p><p>${delta(polish.score, before?.polish?.score)}</p></div>`
      : '<div class="card"><p class="label">Polish score</p><p class="value"><small>not assessed</small></p><p>Score the screenshots with audit/POLISH.md and pass <code>--polish polish.json</code>.</p></div>',
    `<div class="card"><p class="label">Scope</p><p class="value"><small>${result.filesScanned} files</small></p><p>Surface: ${esc(surface)}</p>${polish?.pages?.length ? `<p>Pages: ${esc(polish.pages.join(', '))}</p>` : ''}</div>`,
  ].join('\n');

  const beforeDims = new Map((before?.polish?.dimensions || []).map((d) => [d.id, d.score]));
  const dims = polish ? `<h2 id="polish">Polish, by dimension</h2>
<ul class="dims">${polish.dimensions.map((d) => `
  <li><span class="name">${esc(d.title)}</span><span>${segments(d.score)}${beforeDims.has(d.id) && beforeDims.get(d.id) !== d.score ? ` <span class="delta">(was ${beforeDims.get(d.id) ?? 'n/a'})</span>` : ''}</span>${d.note || d.evidence.length ? `<p class="note">${esc(d.note)}${d.evidence.length ? ` <span class="where">${esc(d.evidence.join(', '))}</span>` : ''}</p>` : ''}</li>`).join('')}
</ul>` : '';

  const topics = Object.entries(result.byTopic).filter(([, t]) => t.error + t.warning + t.info > 0);
  const topicTable = `<h2 id="topics">Static findings, by topic</h2>${topics.length ? `<div class="table-scroll"><table>
<caption>Points lost per topic. One rule costs at most three times its weight.</caption>
<thead><tr><th scope="col">Topic</th><th scope="col" class="num">Errors</th><th scope="col" class="num">Warnings</th><th scope="col" class="num">Info</th><th scope="col" class="num">Points lost</th></tr></thead>
<tbody>${topics.map(([prefix, t]) => `<tr><th scope="row">${esc(prefix)} · ${esc(t.topic)}</th><td class="num">${t.error}</td><td class="num">${t.warning}</td><td class="num">${t.info}</td><td class="num">${t.deducted}</td></tr>`).join('')}</tbody>
</table></div>` : '<p class="empty">No static findings.</p>'}`;

  const groups = new Map();
  for (const f of result.findings) {
    const key = f.file ?? '(project)';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(f);
  }
  const findings = groups.size ? `<h2 id="findings">Findings</h2>${[...groups].map(([file, list]) => {
    const c = (s) => list.filter((f) => f.severity === s).length;
    return `<details${c('error') ? ' open' : ''}><summary><span>${esc(file)}</span><span class="counts">${c('error')} errors · ${c('warning')} warnings · ${c('info')} info</span></summary>
<ul class="findings">${list.map((f) => `<li><span class="sev ${f.severity}">${f.severity}</span><span class="rule">${esc(f.ruleId)}</span><span>${f.file ? `<span class="where">${f.line}:${f.column}</span> ` : ''}${esc(f.message)}</span></li>`).join('')}</ul></details>`;
  }).join('\n')}` : '';

  const shots = screenshots.length ? `<h2 id="screenshots">Screenshots</h2><div class="gallery">${screenshots.map((s, i) => {
    const img = (src, alt, lazy) => `<img src="${esc(src)}" alt="${esc(alt)}"${lazy ? ' loading="lazy"' : ''} decoding="async">`;
    return s.before
      ? `<figure class="pair"><div class="pair-grid">${img(s.before, `Before: ${s.name}`, i > 1)}${img(s.src, `After: ${s.name}`, i > 1)}</div><figcaption>${esc(s.name)} · before, after</figcaption></figure>`
      : `<figure>${img(s.src, `Screenshot ${s.name}`, i > 2)}<figcaption>${esc(s.name)}</figcaption></figure>`;
  }).join('')}</div>` : '';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>UI audit · ${esc(name)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400&family=IBM+Plex+Sans:wght@400;500;600&display=swap">
<style>${CSS}</style>
</head>
<body>
<main class="wrap">
<header class="top">
  <div><p class="eyebrow">ui-polish-kit audit · ${esc(generatedAt)}</p><h1>${esc(name)}</h1>
  <p class="meta">${esc(result.root)}</p></div>
  <span class="verdict ${pass ? 'pass' : 'fail'}">${pass ? 'Pass' : 'Not yet'}</span>
</header>
<section class="cards" aria-label="Scores">
${cards}
</section>
${dims}
${topicTable}
${findings}
${shots}
<footer>Static checks read the code; the Polish score is a judgement from screenshots against audit/POLISH.md. Each rule ID is explained in the kit's rules/ folder.</footer>
</main>
</body>
</html>
`;
}
