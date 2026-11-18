#!/usr/bin/env node
// Builds docs/images/ticker-dark.svg and ticker-light.svg: the animated stats line under the README banner.
// Numbers come from audit/rules-index.json and the README badges, so the ticker never drifts from the kit.
//   node scripts/build-ticker.mjs          write both files
//   node scripts/build-ticker.mjs --check  exit 1 if either file is out of date
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const index = JSON.parse(readFileSync(join(root, 'audit/rules-index.json'), 'utf8'));
const readme = readFileSync(join(root, 'README.md'), 'utf8');

const rules = Object.values(index.rules);
const staticChecks = rules.filter((r) => r.check === 'static').length;
const badge = (label) => {
  const m = readme.match(new RegExp(`alt="(\\d+) ${label}"`));
  if (!m) throw new Error(`README badge "N ${label}" not found`);
  return m[1];
};

// Each line is a list of [text, highlighted?] segments.
const LINES = [
  [['LATEST VERSION [ '], [index.version, true], [' ]']],
  [['[ '], [String(rules.length), true], [' ] RULES ACROSS [ '], [String(index.topics.length), true], [' ] TOPICS']],
  [['[ '], [String(staticChecks), true], [' ] STATIC CHECKS IN THE AUDIT']],
  [['[ '], [badge('React recipes'), true], [' ] REACT RECIPES · [ '], [badge('HTML and CSS recipes'), true], [' ] HTML/CSS']],
  [['INSTALL NOW! '], ['npx github:devsharmagrowleads-oss/ui-polish-kit install', true]],
  [['WORKS WITH '], ['Claude Code · Codex · Cursor', true]],
  [['AND '], ['Windsurf · Copilot · Gemini CLI', true]],
  [['[ '], ['0', true], [' ] DEPENDENCIES · MIT LICENSED']],
];

const THEMES = {
  dark: { text: '#9fb0b2', accent: '#5fd0c5' },
  light: { text: '#57656a', accent: '#0f7a72' },
};

const W = 640;
const H = 48;
const STEP = 2; // seconds each line is on screen
const CYCLE = STEP * LINES.length;
const pct = (s) => `${+((s / CYCLE) * 100).toFixed(3)}%`;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function svg({ text, accent }) {
  const plain = LINES.map((segs) => segs.map(([t]) => t).join(''));
  const lines = LINES.map((segs, i) => {
    const spans = segs.map(([t, hi]) => (hi ? `<tspan class="hi">${esc(t)}</tspan>` : esc(t))).join('');
    return `  <g class="line" style="animation-delay:${i * STEP}s"><text x="${W / 2}" y="29">${spans}</text></g>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="t">
  <title id="t">${esc(plain.join('. '))}</title>
  <style>
    text { font: 500 13px ui-monospace, SFMono-Regular, 'Cascadia Mono', Menlo, Consolas, monospace; letter-spacing: 0.6px; fill: ${text}; text-anchor: middle; }
    .hi { fill: ${accent}; }
    /* Static by default: only the first line shows. Motion is opted into below. */
    .line:not(:first-of-type) { opacity: 0; }
    @media (prefers-reduced-motion: no-preference) {
      .line, .line:not(:first-of-type) {
        opacity: 0;
        animation: tick ${CYCLE}s cubic-bezier(0.2, 0.7, 0.2, 1) infinite backwards;
      }
    }
    @keyframes tick {
      0% { opacity: 0; transform: translateY(${H / 2}px); }
      ${pct(0.35)} { opacity: 1; transform: translateY(0); }
      ${pct(STEP - 0.3)} { opacity: 1; transform: translateY(0); }
      ${pct(STEP)} { opacity: 0; transform: translateY(-${H / 2}px); }
      100% { opacity: 0; transform: translateY(-${H / 2}px); }
    }
  </style>
${lines.join('\n')}
</svg>
`;
}

const check = process.argv.includes('--check');
let stale = 0;
for (const [name, theme] of Object.entries(THEMES)) {
  const file = join(root, 'docs/images', `ticker-${name}.svg`);
  const out = svg(theme);
  if (check) {
    if (!existsSync(file) || readFileSync(file, 'utf8') !== out) {
      console.error(`${file} is out of date; run npm run build`);
      stale++;
    }
  } else {
    writeFileSync(file, out);
  }
}
if (stale) process.exit(1);
if (!check) console.log(`Built ticker (${LINES.length} lines, ${CYCLE}s cycle) for ${Object.keys(THEMES).join(' and ')} themes.`);
