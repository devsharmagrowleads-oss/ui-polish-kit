#!/usr/bin/env node
// Capture each URL at several widths in light and dark, and report horizontal
// overflow and console errors. Uses `playwright` or `playwright-core` from the
// project you run it in; falls back to an installed Chrome or Edge when no
// Playwright browser has been downloaded.
//
//   node audit/screenshot.mjs <url|file> [...more] [--out dir] [--widths 375,768,1440]
//        [--themes light,dark] [--height 900] [--wait 400] [--viewport-only]

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { POLISH_DIMENSIONS } from './lib/polish.mjs';

const HELP = `Usage: node audit/screenshot.mjs <url|file> [...] [options]

  --out <dir>          Output directory (default .ui-polish-audit)
  --widths <list>      Viewport widths (default 375,768,1440)
  --themes <list>      light,dark (default both)
  --height <px>        Viewport height (default 900)
  --wait <ms>          Extra wait after load (default 400)
  --viewport-only      Capture only the visible viewport instead of the full page

Dark theme is applied three ways so it works with most apps: prefers-color-scheme
is emulated, and class "dark" plus data-theme="dark" are set on <html>.
Requires: npm i -D playwright-core   (or playwright)`;

function parse(argv) {
  const o = { targets: [], out: '.ui-polish-audit', widths: [375, 768, 1440], themes: ['light', 'dark'], height: 900, wait: 400, fullPage: true };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const val = () => { if (argv[i + 1] === undefined) throw new Error(`${a} needs a value`); return argv[++i]; };
    if (a === '--out') o.out = val();
    else if (a === '--widths') o.widths = val().split(',').map(Number).filter((n) => n >= 200);
    else if (a === '--themes') o.themes = val().split(',').filter((t) => t === 'light' || t === 'dark');
    else if (a === '--height') o.height = Number(val()) || 900;
    else if (a === '--wait') o.wait = Number(val()) || 0;
    else if (a === '--viewport-only') o.fullPage = false;
    else if (a === '-h' || a === '--help') o.help = true;
    else if (a.startsWith('--')) throw new Error(`Unknown option ${a}`);
    else o.targets.push(a);
  }
  return o;
}

function toUrl(target) {
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(target)) return target;
  const abs = path.resolve(target);
  if (!fs.existsSync(abs)) throw new Error(`Not a URL and not a file: ${target}`);
  return pathToFileURL(abs).href;
}

function slug(url) {
  const u = new URL(url);
  const base = u.protocol === 'file:' ? path.basename(path.dirname(u.pathname)) + '-' + path.basename(u.pathname) : `${u.hostname}${u.pathname}`;
  // Keep the query in the name: ?view=app and ?view=settings are different screens and must not overwrite each other.
  const query = u.search ? `-${u.search.slice(1)}` : '';
  return (base.replace(/\.html?$/i, '') + query).replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'page';
}

function loadPlaywright() {
  const require = createRequire(path.join(process.cwd(), 'noop.js'));
  for (const name of ['playwright', 'playwright-core']) {
    try { return require(name); } catch { /* try the next package */ }
  }
  throw new Error('Playwright is not installed in this project. Run: npm i -D playwright-core');
}

async function launch(chromium) {
  const errors = [];
  for (const options of [{}, { channel: 'chrome' }, { channel: 'msedge' }]) {
    try { return await chromium.launch(options); } catch (err) { errors.push(`${options.channel || 'bundled chromium'}: ${String(err.message).split('\n')[0]}`); }
  }
  throw new Error(`Could not start a browser.\n  ${errors.join('\n  ')}\nInstall one with: npx playwright install chromium`);
}

async function main() {
  const o = parse(process.argv.slice(2));
  if (o.help || !o.targets.length) { console.log(HELP); return o.help ? 0 : 2; }
  const urls = o.targets.map(toUrl);
  const { chromium } = loadPlaywright();
  const browser = await launch(chromium);
  fs.mkdirSync(o.out, { recursive: true });
  const report = [];
  let problems = 0;

  try {
    for (const url of urls) {
      for (const theme of o.themes) {
        for (const width of o.widths) {
          const context = await browser.newContext({ viewport: { width, height: o.height }, colorScheme: theme, deviceScaleFactor: 1 });
          const page = await context.newPage();
          const consoleErrors = [];
          page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 300)); });
          page.on('pageerror', (err) => consoleErrors.push(String(err.message).slice(0, 300)));
          await page.addInitScript((t) => {
            try { localStorage.setItem('theme', t); } catch { /* storage may be blocked on file: URLs */ }
            const apply = () => {
              const el = document.documentElement;
              if (!el) return;
              el.classList.toggle('dark', t === 'dark');
              el.classList.toggle('light', t === 'light');
              el.setAttribute('data-theme', t);
            };
            apply();
            document.addEventListener('DOMContentLoaded', apply);
          }, theme);
          await page.goto(url, { waitUntil: 'load', timeout: 45000 });
          await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
          if (o.wait) await page.waitForTimeout(o.wait);
          const metrics = await page.evaluate(() => ({
            title: document.title,
            scrollWidth: document.documentElement.scrollWidth,
            innerWidth: window.innerWidth,
            fonts: [...new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/["']/g, '')))],
          }));
          const file = path.join(o.out, `${slug(url)}-${width}-${theme}.png`);
          await page.screenshot({ path: file, fullPage: o.fullPage });
          const overflow = metrics.scrollWidth > metrics.innerWidth + 1;
          if (overflow || consoleErrors.length) problems++;
          report.push({ url, theme, width, file, title: metrics.title, horizontalOverflow: overflow, scrollWidth: metrics.scrollWidth, loadedFonts: metrics.fonts, consoleErrors });
          console.log(`${overflow ? 'OVERFLOW' : 'ok      '}  ${String(width).padStart(4)}px ${theme.padEnd(5)}  ${file}${overflow ? `  (content is ${metrics.scrollWidth}px wide: RS-03)` : ''}${consoleErrors.length ? `  ${consoleErrors.length} console error(s)${url.startsWith('file:') && consoleErrors.some((e) => /ERR_FILE_NOT_FOUND/.test(e)) ? ' (a root-relative path such as /favicon.svg cannot load from a file: URL; serve the folder to check it)' : ''}` : ''}`);
          await context.close();
        }
      }
    }
  } finally {
    await browser.close();
  }
  fs.writeFileSync(path.join(o.out, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  // An empty Polish scorecard listing every dimension and the screenshots just taken. Never overwrites a filled one.
  const template = path.join(o.out, 'polish.template.json');
  const shots = report.map((r) => path.basename(r.file));
  fs.writeFileSync(template, `${JSON.stringify({
    assessedAt: new Date().toISOString().slice(0, 10),
    pages: urls,
    screenshots: shots,
    dimensions: Object.fromEntries(POLISH_DIMENSIONS.map((d) => [d.id, { score: null, note: '', evidence: [] }])),
  }, null, 2)}\n`);
  console.log(`\n${report.length} screenshots in ${o.out}/ (details in report.json). Open each image and walk audit/PROCEDURE.md step 3.`);
  console.log(`To score Polish: copy ${path.join(o.out, 'polish.template.json')} to polish.json, give every dimension a score from 0 to 4 (audit/POLISH.md) with a note and evidence, then pass it with --polish.`);
  return problems ? 1 : 0;
}

main().then((code) => { process.exitCode = code; }).catch((err) => { console.error(`screenshot: ${err.message}`); process.exitCode = 2; });
