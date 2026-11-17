import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { audit, STATIC_RULE_IDS, loadRuleIndex } from '../audit/lib/run.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CLI = path.join(ROOT, 'audit', 'cli.mjs');

/** Write a throwaway project and audit it. Returns the result plus `ids` (sorted unique rule IDs). */
function check(files, options = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ui-polish-'));
  try {
    for (const [rel, content] of Object.entries(files)) {
      const abs = path.join(dir, rel);
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, content);
    }
    const result = audit(dir, options);
    return { ...result, ids: [...new Set(result.findings.map((f) => f.ruleId))].sort() };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// A minimal project that passes every project-level rule, so a test can add one defect.
const CLEAN = {
  'design.md': '# Design\nSurface: app\nFonts: Figtree.\n',
  'tokens.css': `:root { color-scheme: light; --background: oklch(1 0 0); --foreground: oklch(0.2 0 0); --primary: oklch(0.4 0.1 195); --border: oklch(0.9 0 0); --ring: oklch(0.5 0.1 195); --font-sans: "Figtree", sans-serif; }
.dark { color-scheme: dark; --background: oklch(0.2 0 0); --foreground: oklch(0.95 0 0); }
:focus-visible { outline: 2px solid var(--ring); }
html { scrollbar-color: var(--border) transparent; accent-color: var(--primary); }
input:-webkit-autofill { box-shadow: inset 0 0 0 100vmax var(--background); }
@media (prefers-reduced-motion: reduce) { * { transition-duration: 0.01ms !important; } }`,
};
const clean = (extra, options) => check({ ...CLEAN, ...extra }, options);

// ---------------------------------------------------------------------------
// The example pair
// ---------------------------------------------------------------------------

test('examples/before fails with the expected findings', () => {
  const r = audit(path.join(ROOT, 'examples', 'before'));
  const ids = new Set(r.findings.map((f) => f.ruleId));
  const expected = [
    'NC-01', 'NC-02', 'NC-03', 'NC-04', 'NC-05', 'NC-06', 'NC-07', 'NC-08', 'NC-10',
    'TK-01', 'TK-02', 'TK-03', 'TK-04', 'TK-05', 'TK-06',
    'TY-01', 'TY-04',
    'SL-01', 'SL-02', 'SL-03', 'SL-04', 'SL-05', 'SL-06', 'SL-07',
    'FM-01', 'FM-02', 'RS-02', 'RS-03', 'DM-02',
    'AX-01', 'AX-02', 'AX-03', 'AX-04', 'AX-05', 'AX-06', 'AX-07', 'AX-08',
    'MO-01', 'MO-02', 'MO-03', 'MO-04',
    'FD-01', 'FD-02', 'FD-03', 'FD-04', 'FD-05',
    'CP-01', 'CP-02', 'CP-03', 'BR-01',
    'DT-01', 'NV-02', 'NV-05', 'IC-03',
    'UX-10',
  ];
  const missing = expected.filter((id) => !ids.has(id));
  assert.deepEqual(missing, [], `rules that should fire on examples/before but did not: ${missing.join(', ')}`);
  assert.equal(r.pass, false);
  assert.ok(r.counts.error >= 30, `expected many errors, got ${r.counts.error}`);
  assert.ok(r.score < 20, `expected a very low score, got ${r.score}`);
  for (const f of r.findings) {
    assert.match(f.ruleId, /^[A-Z]{2}-\d{2}$/);
    assert.ok(['error', 'warning', 'info'].includes(f.severity));
    if (f.file) assert.ok(f.line >= 1 && f.column >= 1, `${f.ruleId} needs a line and column`);
  }
});

test('examples/before: findings point at the right lines', () => {
  const r = audit(path.join(ROOT, 'examples', 'before'));
  const html = fs.readFileSync(path.join(ROOT, 'examples', 'before', 'index.html'), 'utf8').split('\n');
  const at = (ruleId) => r.findings.filter((f) => f.ruleId === ruleId && f.file === 'index.html').map((f) => html[f.line - 1]);
  assert.ok(at('NC-01').every((l) => l.includes('<select')));
  assert.ok(at('NC-02').every((l) => /type="(date|time)"/.test(l)));
  assert.ok(at('NC-03').every((l) => l.includes('type="file"')));
  assert.ok(at('AX-03').every((l) => l.includes('<img')));
  assert.equal(at('NC-01').length, 2);
});

test('examples/after passes with no findings at all', () => {
  const r = audit(path.join(ROOT, 'examples', 'after'));
  assert.deepEqual(r.findings.map((f) => `${f.ruleId} ${f.file}:${f.line}`), []);
  assert.equal(r.score, 100);
  assert.equal(r.pass, true);
});

test('the recipes pass their own checker', () => {
  // BR-01 is project-level (no design.md inside a recipes folder).
  const r = audit(path.join(ROOT, 'recipes'), { overrides: { rules: { 'BR-01': 'off' } } });
  assert.deepEqual(r.findings.map((f) => `${f.ruleId} ${f.file}:${f.line} ${f.message}`), []);
});

// ---------------------------------------------------------------------------
// Rules the example pair does not exercise
// ---------------------------------------------------------------------------

test('a clean minimal project has no findings', () => {
  assert.deepEqual(clean({ 'page.tsx': 'export const A = () => <button className="bg-primary">Save changes</button>;' }).ids, []);
});

test('NC-09 unstyled scrollbars, only when something scrolls', () => {
  const tokens = CLEAN['tokens.css'].replace('scrollbar-color: var(--border) transparent; ', '');
  assert.deepEqual(clean({ 'tokens.css': tokens, 'app.css': '.list { overflow-y: auto; }' }).ids, ['NC-09']);
  assert.deepEqual(clean({ 'tokens.css': tokens, 'app.css': '.list { display: grid; }' }).ids, []);
});

test('RS-01 missing viewport meta', () => {
  const head = '<meta name="description" content="x"><meta property="og:title" content="x"><meta property="og:description" content="x"><meta property="og:image" content="x"><link rel="icon" href="i.svg">';
  const r = clean({ 'index.html': `<!doctype html><html lang="en"><head><title>Invoices · Ledgerly</title>${head}</head><body><h1>Invoices</h1></body></html>`, '404.html': '' });
  assert.deepEqual(r.ids, ['RS-01']);
});

test('DM-01 tokens without a dark scope; darkMode:false opts out', () => {
  const tokens = CLEAN['tokens.css'].replace(/\.dark \{[^}]*\}\n/, '');
  assert.deepEqual(clean({ 'tokens.css': tokens }).ids, ['DM-01']);
  assert.deepEqual(clean({ 'tokens.css': tokens }, { overrides: { darkMode: false } }).ids, []);
});

test('DM-03 inverted dark mode and DM-04 missing color-scheme', () => {
  assert.deepEqual(clean({ 'app.css': 'html.dark { filter: invert(1) hue-rotate(180deg); }' }).ids, ['DM-03']);
  assert.deepEqual(clean({ 'tokens.css': CLEAN['tokens.css'].replace(/color-scheme: (light|dark); /g, '') }).ids, ['DM-04']);
});

test('TY-02 default-prone font needs a recorded decision', () => {
  const layout = 'import { Inter } from "next/font/google";\nexport const font = Inter({ subsets: ["latin"] });';
  const tokens = CLEAN['tokens.css'].replace('--font-sans: "Figtree", sans-serif; ', '');
  assert.deepEqual(clean({ 'tokens.css': tokens, 'src/fonts.ts': layout }).ids, ['TY-02']);
  assert.deepEqual(clean({ 'tokens.css': tokens, 'src/fonts.ts': layout, 'design.md': '# Design\nSurface: app\nTypeface: Inter, the brand font since 2021.\n' }).ids, []);
  assert.deepEqual(clean({ 'tokens.css': tokens, 'src/fonts.ts': layout.replaceAll('Inter', 'Figtree') }).ids, []);
});

test('TY-01 system-only stack; allowSystemFonts opts out', () => {
  const tokens = CLEAN['tokens.css'].replace('"Figtree", sans-serif', 'system-ui, -apple-system, sans-serif');
  assert.deepEqual(clean({ 'tokens.css': tokens }).ids, ['TY-01']);
  assert.deepEqual(clean({ 'tokens.css': tokens }, { overrides: { allowSystemFonts: true } }).ids, []);
});

test('TY-03 font loading without swap', () => {
  assert.deepEqual(clean({ 'app.css': '@import url("https://fonts.googleapis.com/css2?family=Figtree:wght@400;600");' }).ids, ['TY-03']);
  assert.deepEqual(clean({ 'app.css': '@font-face { font-family: "Figtree"; src: url(f.woff2); }' }).ids, ['TY-03']);
  assert.deepEqual(clean({ 'app.css': '@font-face { font-family: "Figtree"; src: url(f.woff2); font-display: swap; }' }).ids, []);
});

test('SL-01 catches CSS gradients by hue, not only Tailwind class names', () => {
  assert.deepEqual(clean({ 'tokens.css': `${CLEAN['tokens.css']}\n:root { --hero: linear-gradient(90deg, #7c3aed, #2563eb); }` }).ids, ['SL-01']);
  assert.deepEqual(clean({ 'tokens.css': `${CLEAN['tokens.css']}\n:root { --hero: linear-gradient(90deg, #0f766e, #115e59); }` }).ids, []);
});

// ---------------------------------------------------------------------------
// False-positive guards
// ---------------------------------------------------------------------------

test('does not flag correct or unrelated code', () => {
  const ok = {
    'comments.ts': '// alert("x") and confirm("y") are banned\n/* <select> */\nexport const x = 1;',
    'local.tsx': 'import { useConfirm } from "./confirm";\nexport function A() { const confirm = useConfirm(); return <button onClick={() => confirm({ title: "Delete project?" })}>Delete project</button>; }',
    'method.ts': 'export class Dialog { confirm() { return true; } prompt(): string { return ""; } }\nexport const text = "Please confirm (optional)";',
    'props.tsx': 'export const B = () => <><Card title="Billing" /><iframe title="Map of the office" src="/map" /><abbr title="Value added tax">VAT</abbr></>;',
    'tokens-use.css': '.a { color: hsl(var(--foreground)); background: rgb(var(--bg) / 0.5); --local: #fff; border-color: color-mix(in oklch, var(--primary) 20%, transparent); padding: 12px 16px 0 2px; z-index: 2; width: 320px; }',
    'svg.tsx': 'export const Logo = () => <svg viewBox="0 0 10 10" aria-hidden="true"><path fill="#ff5500" d="M0 0h10v10z" /></svg>;',
    'tw.tsx': 'export const C = () => <div className="w-[calc(100%-2rem)] max-w-[65ch] grid-cols-[1fr_auto] z-(--z-modal) p-4 text-sm rounded-md bg-primary/10 h-[var(--header)]"><input aria-label="Search invoices" className="outline-none focus-visible:ring-2 focus-visible:ring-ring" /></div>;',
    'select.tsx': 'export const S = (props) => <select className="appearance-none border border-input" {...props} />;',
    'spread.tsx': 'export const I = (props) => <input {...props} />;',
    'labelled.tsx': 'export const L = () => <><label htmlFor="email">Work email</label><input id="email" type="email" autoComplete="email" /><label>Name <input type="text" /></label></>;',
    'img.tsx': 'export const P = () => <><img src="/a.png" alt="" width={40} height={40} /><img src="/b.png" alt="Dana Okafor" className="size-10 rounded-full" /></>;',
    'overlay.tsx': 'export const O = ({ close }) => <div className="fixed inset-0 bg-overlay" onClick={close} />;',
    'icon.tsx': 'import { X } from "lucide-react";\nexport const Close = () => <button type="button" aria-label="Close dialog"><X aria-hidden /></button>;',
    'generic.ts': 'export function pick<T>(a: Array<T>, i: number): T { return a[i]; }\nexport const cmp = (a: number, select: number) => a <select;',
    'motion.css': '.b { transition: opacity 180ms ease-out, transform 180ms ease-out; animation: spin 1s linear infinite; }',
    'meta.ts': 'export const viewport = { themeColor: "#0f5e63" };',
  };
  assert.deepEqual(clean(ok).findings.map((f) => `${f.ruleId} ${f.file}:${f.line}`), []);
});

test('flags the incorrect twin of each guarded pattern', () => {
  const cases = {
    'NC-07': { 'a.ts': 'export function go() { alert("Saved"); }' },
    'NC-08': { 'a.tsx': 'export const A = () => <span title="More info">Billing</span>;' },
    'TK-01': { 'a.css': '.a { color: #333333; }' },
    'TK-02': { 'a.tsx': 'export const A = () => <p className="p-[13px]">Billing</p>;' },
    'TK-04': { 'a.css': '.a { padding: 13px; }' },
    'TK-06': { 'a.css': '.a { z-index: 9999; }' },
    'AX-02': { 'a.tsx': 'export const A = () => <input aria-label="Search invoices" className="outline-none" />;' },
    'AX-03': { 'a.tsx': 'export const A = () => <img src="/a.png" width={40} height={40} />;' },
    'AX-04': { 'a.tsx': 'export const A = ({ open }) => <div className="card" onClick={open}>Northwind Studio</div>;' },
    'AX-07': { 'a.tsx': 'import { X } from "lucide-react";\nexport const A = () => <button type="button"><X /></button>;' },
    'FM-01': { 'a.tsx': 'export const A = () => <input type="text" placeholder="Name" />;' },
    'FD-04': { 'a.tsx': 'export const A = () => <img src="/a.png" alt="Dana Okafor" />;' },
    'RS-02': { 'a.css': '.a { width: 640px; }' },
    'MO-02': { 'a.css': '.a { transition: opacity 800ms ease-out; }' },
  };
  for (const [id, files] of Object.entries(cases)) {
    assert.deepEqual(clean(files).ids, [id], `expected exactly ${id}`);
  }
});

// ---------------------------------------------------------------------------
// Ignore comments and config
// ---------------------------------------------------------------------------

test('DT-01 tables need header cells', () => {
  assert.deepEqual(clean({ 'p.html': '<table><tr><td>INV-1</td><td>98.00</td></tr></table>' }).ids, ['DT-01']);
  assert.deepEqual(clean({ 'p.html': '<table><caption>Invoices</caption><thead><tr><th scope="col">Invoice</th></tr></thead><tbody><tr><td>INV-1</td></tr></tbody></table>' }).ids, []);
  assert.deepEqual(clean({ 'p.tsx': 'export const T = () => <table><thead><tr>{cols.map((c) => <th key={c}>{c}</th>)}</tr></thead></table>;' }).ids, []);
});

test('NV-05 links that go nowhere', () => {
  assert.deepEqual(clean({ 'p.html': '<a href="#" onclick="archive()">Archive</a>' }).ids, ['NV-05']);
  assert.deepEqual(clean({ 'p.tsx': 'export const L = () => <a href="javascript:void(0)">Open</a>;' }).ids, ['NV-05']);
  assert.deepEqual(clean({ 'p.html': '<a href="#main">Skip to content</a> <a href="/settings">Settings</a>' }).ids, []);
});

test('NV-02 pages need a <main>, app shells are skipped', () => {
  const page = (body) => `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Invoices · Ledgerly</title><meta name="description" content="Invoices."><meta property="og:title" content="x"><meta property="og:description" content="x"><meta property="og:image" content="/og.png"><link rel="icon" href="/favicon.svg"></head><body>${body}</body></html>`;
  const has = (body) => clean({ 'index.html': page(body), 'favicon.svg': '<svg xmlns="http://www.w3.org/2000/svg"/>', '404.html': page('<main><h1>Page not found</h1></main>') }).ids.includes('NV-02');
  assert.equal(has('<div class="content"><h1>Invoices</h1><p>Every invoice sent from this workspace in March.</p></div>'), true);
  assert.equal(has('<main id="main"><h1>Invoices</h1><p>Every invoice sent from this workspace in March.</p></main>'), false);
  assert.equal(has('<div id="root"></div><script type="module" src="/src/main.tsx"></script>'), false);
});

test('IC-03 inline SVG must be hidden or named', () => {
  assert.deepEqual(clean({ 'p.html': '<button type="button"><svg viewBox="0 0 24 24"><path d="M0 0"/></svg> Delete</button>' }).ids, ['IC-03']);
  assert.deepEqual(clean({ 'p.html': '<button type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M0 0"/></svg> Delete</button>' }).ids, []);
  assert.deepEqual(clean({ 'p.html': '<svg role="img" aria-label="Overdue" viewBox="0 0 24 24"><path d="M0 0"/></svg>' }).ids, []);
  assert.deepEqual(clean({ 'p.html': '<svg viewBox="0 0 24 24"><title>Overdue</title><path d="M0 0"/></svg>' }).ids, []);
  assert.deepEqual(clean({ 'p.tsx': 'export const I = (props) => <svg {...props} viewBox="0 0 24 24" />;' }).ids, []);
});

test('IN-01 physical left/right only in localised projects', () => {
  const css = { 'app.css': '.alert-icon { margin-left: 0.5rem; text-align: right; }' };
  assert.deepEqual(clean(css).ids, []);
  assert.deepEqual(clean({ ...css, 'package.json': '{"dependencies":{"next-intl":"^4.0.0"}}' }).ids, ['IN-01']);
  assert.deepEqual(clean({ ...css, 'locales/de.json': '{}' }).ids, ['IN-01']);
  assert.deepEqual(clean({ 'p.tsx': 'export const A = () => <p className="ml-2 text-left">Hi</p>;', 'messages/ar.json': '{}' }).ids, ['IN-01']);
  assert.deepEqual(clean({ 'app.css': '.alert-icon { margin-inline-start: 0.5rem; text-align: start; }', 'locales/de.json': '{}' }).ids, []);
});

test('inline ignore comments', () => {
  const css = (comment) => ({ 'a.css': `.a {\n  ${comment}\n  color: #333333;\n}\n.b { color: #444444; }` });
  assert.equal(clean(css('')).findings.length, 2);
  assert.equal(clean(css('/* ui-polish-ignore-next-line TK-01: trademark colour */')).findings.length, 1);
  assert.equal(clean(css('/* ui-polish-ignore-next-line */')).findings.length, 1);
  assert.equal(clean(css('/* ui-polish-ignore-next-line AX-02 */')).findings.length, 2, 'a different ID must not suppress');
  assert.equal(clean(css('/* ui-polish-ignore-file TK-01 */')).findings.length, 0);
  assert.equal(clean({ 'a.css': '.a { color: #333333; /* ui-polish-ignore-line TK-01 */ }' }).findings.length, 0);
  assert.equal(clean({ 'a.css': '/* ui-polish-disable TK-01 */\n.a { color: #333333; }\n/* ui-polish-enable */\n.b { color: #444444; }' }).findings.length, 1);
  assert.equal(clean({ 'a.tsx': 'export const A = () => (\n  <div>\n    {/* ui-polish-ignore-next-line NC-08 */}\n    <span title="x">Billing</span>\n  </div>\n);' }).findings.length, 0);
  assert.equal(clean({ 'a.html': '<!-- ui-polish-ignore-next-line NC-08 -->\n<span title="x">Billing</span>' }).findings.length, 0);
});

test('config file: rules off, severity override, exclude, tokenFiles', () => {
  const files = { 'a.css': '.a { color: #333333; }', 'legacy/b.css': '.b { color: #444444; }', 'brand.css': '.c { color: #555555; }' };
  const cfg = (c) => ({ ...files, 'ui-polish.config.json': JSON.stringify(c) });
  assert.equal(clean(files).findings.length, 3);
  assert.equal(clean(cfg({ rules: { 'TK-01': 'off' } })).findings.length, 0);
  assert.equal(clean(cfg({ rules: { 'TK-01': 'info' } })).findings[0].severity, 'info');
  assert.equal(clean(cfg({ exclude: ['legacy/**'] })).findings.length, 2);
  assert.equal(clean(cfg({ exclude: ['legacy/**'], tokenFiles: ['brand.css'] })).findings.length, 1);
  assert.throws(() => clean(cfg({ rulez: {} })), /Unknown config key/);
  assert.throws(() => clean(cfg({ rules: { 'ZZ-99': 'off' } })), /unknown rule/);
  assert.throws(() => clean(cfg({ rules: { 'TK-01': 'loud' } })), /must be off, error, warning or info/);
});

test('scoring: weights, per-rule cap, thresholds', () => {
  const one = clean({ 'a.css': '.a { color: #333333; }' });
  assert.equal(one.score, 95);
  assert.equal(one.pass, false, 'any error fails by default');
  const many = clean({ 'a.css': Array.from({ length: 20 }, (_, i) => `.a${i} { color: #333333; }`).join('\n') });
  assert.equal(many.counts.error, 20);
  assert.equal(many.score, 85, 'one rule costs at most 3 × its weight');
  const warn = clean({ 'a.css': '.a { padding: 13px; }' });
  assert.equal(warn.score, 98);
  assert.equal(warn.pass, true);
  assert.equal(clean({ 'a.css': '.a { padding: 13px; }' }, { failOn: 'warning' }).pass, false);
  assert.equal(clean({ 'a.css': '.a { padding: 13px; }' }, { minScore: 99 }).pass, false);
  assert.equal(clean({ 'a.css': '.a { color: #333333; }' }, { failOn: 'never' }).pass, true);
});

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const cli = (...args) => spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8' });

test('CLI exit codes and --json shape', () => {
  const before = cli(path.join(ROOT, 'examples', 'before'), '--json');
  assert.equal(before.status, 1);
  const json = JSON.parse(before.stdout);
  assert.equal(json.version, 1);
  assert.equal(json.pass, false);
  assert.ok(Array.isArray(json.findings) && json.findings.length > 50);
  assert.deepEqual(Object.keys(json.findings[0]).sort(), ['column', 'doc', 'file', 'line', 'message', 'ruleId', 'severity', 'title']);
  assert.deepEqual(Object.keys(json.counts).sort(), ['error', 'info', 'warning']);
  assert.equal(typeof json.score, 'number');

  const after = cli(path.join(ROOT, 'examples', 'after'), '--no-color');
  assert.equal(after.status, 0);
  assert.match(after.stdout, /Score 100\/100/);
  assert.match(after.stdout, /PASS/);

  const text = cli(path.join(ROOT, 'examples', 'before'), '--no-color');
  assert.match(text.stdout, /index\.html\n\s+\d+:\d+\s+(error|warning|info)\s+[A-Z]{2}-\d{2}/);
  assert.match(text.stdout, /FAIL/);

  assert.equal(cli('--nope').status, 2);
  assert.equal(cli(path.join(ROOT, 'does-not-exist')).status, 2);
  assert.equal(cli('--rules', 'ZZ-99', ROOT).status, 2);
  assert.equal(cli('--help').status, 0);

  const only = JSON.parse(cli(path.join(ROOT, 'examples', 'before'), '--json', '--rules', 'NC-01').stdout);
  assert.deepEqual([...new Set(only.findings.map((f) => f.ruleId))], ['NC-01']);
});

test('every static rule ID exists in the generated index with a severity', () => {
  const index = loadRuleIndex();
  for (const id of STATIC_RULE_IDS) {
    assert.ok(index.rules[id], `${id} missing from rules-index.json`);
    assert.equal(index.rules[id].check, 'static');
  }
  assert.equal(new Set(STATIC_RULE_IDS).size, STATIC_RULE_IDS.length);
});

// ---------------------------------------------------------------------------
// UX laws, visual hierarchy, surface
// ---------------------------------------------------------------------------

test('UX-02 navigation with too many top-level links', () => {
  const links = (n) => Array.from({ length: n }, (_, i) => `<a href="/p${i}">Page ${i}</a>`).join('');
  assert.deepEqual(clean({ 'p.html': `<nav aria-label="Primary">${links(10)}</nav>` }).ids, ['UX-02']);
  assert.deepEqual(clean({ 'p.html': `<nav aria-label="Primary">${links(6)}</nav>` }).ids, []);
  assert.deepEqual(clean({ 'p.html': `<footer><nav aria-label="Sitemap">${links(14)}</nav></footer>` }).ids, []);
  assert.deepEqual(clean({ 'p.html': `<nav aria-label="Pagination">${links(12)}</nav>` }).ids, []);
  // submenu links nested in a second list level do not count as top-level
  assert.deepEqual(clean({ 'p.html': `<nav aria-label="Primary"><ul><li>${links(4)}<ul><li>${links(10)}</li></ul></li></ul></nav>` }).ids, []);
});

test('UX-10 patterns that reject spaces in phone and card fields', () => {
  assert.deepEqual(clean({ 'p.html': '<label>Phone <input type="tel" name="phone" autocomplete="tel" pattern="[0-9]{10}"></label>' }).ids, ['UX-10']);
  assert.deepEqual(clean({ 'p.html': '<label>Card <input name="card" autocomplete="cc-number" pattern="\d{16}"></label>' }).ids, ['UX-10']);
  assert.deepEqual(clean({ 'p.html': '<label>Card <input name="card" autocomplete="cc-number" inputmode="numeric" pattern="[\d ]{13,19}"></label>' }).ids, []);
  assert.deepEqual(clean({ 'p.html': '<label>Security code <input name="cvc" autocomplete="cc-csc" inputmode="numeric" pattern="[0-9]{3,4}"></label>' }).ids, []);
  assert.deepEqual(clean({ 'p.html': '<label>Username <input name="username" autocomplete="username" pattern="[a-z0-9]+"></label>' }).ids, []);
});

test('VH-07 more than four font weights', () => {
  assert.deepEqual(clean({ 'p.tsx': 'export const A = () => <div><h2 className="font-extrabold">A</h2><p className="font-light">B</p><b className="font-black">C</b><i className="font-medium">D</i><u className="font-bold">E</u></div>;' }).ids, ['VH-07']);
  assert.deepEqual(clean({ 'p.tsx': 'export const A = () => <div><h2 className="font-semibold">A</h2><p className="font-normal">B</p><i className="font-medium">D</i></div>;' }).ids, []);
  // @font-face weight ranges and weight tokens are not uses
  assert.deepEqual(clean({ 'f.css': '@font-face { font-family: "Figtree"; font-weight: 300; src: url(/f.woff2); font-display: swap; } :root { --font-weight-black: 900; } h1 { font-weight: 600; }' }).ids, []);
});

test('surface: design.md, config and detection decide which topics apply', async () => {
  const { detectSurface, surfaceFromDesignDoc, surfaceApplies } = await import('../audit/lib/project.mjs');
  assert.equal(surfaceFromDesignDoc('# Design\n- Surface: marketing\n'), 'marketing');
  assert.equal(surfaceFromDesignDoc('| **Surface** | both |'), 'both');
  assert.equal(surfaceFromDesignDoc('# Design\n'), null);
  const files = (texts) => texts.map((text, i) => ({ rel: `f${i}.html`, hasMarkup: true, text }));
  assert.equal(detectSurface(['src/pages/pricing.tsx', 'src/pages/about.tsx'], []).value, 'marketing');
  assert.equal(detectSurface(['app/dashboard/page.tsx', 'app/settings/page.tsx'], []).value, 'app');
  assert.equal(detectSurface(['index.html'], files(['<section class="hero">…</section><section id="faq">…</section>'])).value, 'marketing');
  assert.equal(detectSurface(['app/dashboard/page.tsx', 'app/settings/page.tsx', 'app/pricing/page.tsx', 'app/about/page.tsx'], []).value, 'both');
  assert.equal(detectSurface(['index.html'], files(['<main><h1>Hi</h1></main>'])).value, 'unknown');
  assert.equal(surfaceApplies('all', 'unknown'), true);
  assert.equal(surfaceApplies('marketing', 'app'), false);
  assert.equal(surfaceApplies('marketing', 'both'), true);
  assert.equal(surfaceApplies('app', 'app'), true);
  assert.equal(surfaceApplies('app', 'unknown'), false);

  const doc = (surface) => ({ 'design.md': `# Design\n${surface ? `Surface: ${surface}\n` : ''}Fonts: Figtree.\n` });
  assert.deepEqual(clean(doc('marketing')).surface, { value: 'marketing', source: 'design.md' });
  assert.deepEqual(clean(doc('marketing'), { overrides: { surface: 'app' } }).surface, { value: 'app', source: 'config' });
  // unknown surface with a design.md: BR-06 asks for the line
  assert.deepEqual(clean(doc(null)).ids, ['BR-06']);
  assert.throws(() => clean({}, { overrides: { surface: 'website' } }), /surface must be one of/);
});
