// False positives found by running the checker on four real open-source frontends
// (shadcn-ui/taxonomy, vercel/commerce, steven-tey/precedent, mxkaske/mxkaske.dev).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
import { audit } from '../audit/lib/run.mjs';
function check(files) { const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'uip-')); try { for (const [rel, c] of Object.entries(files)) { const a = path.join(dir, rel); fs.mkdirSync(path.dirname(a), { recursive: true }); fs.writeFileSync(a, c); } const r = audit(dir); return { ...r, ids: [...new Set(r.findings.map((f) => f.ruleId))].sort() }; } finally { fs.rmSync(dir, { recursive: true, force: true }); } }
const CLEAN = {
  'design.md': '# Design\nSurface: app\nFonts: Figtree.\n',
  'tokens.css': `:root { color-scheme: light; --background: oklch(1 0 0); --foreground: oklch(0.2 0 0); --primary: oklch(0.4 0.1 195); --border: oklch(0.9 0 0); --ring: oklch(0.5 0.1 195); --font-sans: "Figtree", sans-serif; }
.dark { color-scheme: dark; --background: oklch(0.2 0 0); --foreground: oklch(0.95 0 0); }
:focus-visible { outline: 2px solid var(--ring); }
html { scrollbar-color: var(--border) transparent; accent-color: var(--primary); }
input:-webkit-autofill { box-shadow: inset 0 0 0 100vmax var(--background); }
@media (prefers-reduced-motion: reduce) { * { transition-duration: 0.01ms !important; } }`,
};
const clean = (x) => check({ ...CLEAN, ...x });
const noScheme = CLEAN['tokens.css'].replace(/color-scheme: (light|dark); /g, '');

test('AX-02: menu-item bg, cmdk selection, popover panel, distant focus-within wrapper', () => {
  const r = clean({ 'm.tsx': `export const M = () => (<>
  <div role="menuitem" className="rounded-sm px-2 outline-none focus:bg-accent focus:text-accent-foreground">Edit</div>
  <div role="option" className="outline-none aria-selected:bg-accent">Copy</div>
  <div className="z-50 rounded-md border bg-popover p-4 shadow-md outline-none" />
  <div className="flex rounded-md border focus-within:ring-2 focus-within:ring-ring">
  ${'<span>a</span>\n'.repeat(12)}
    <input aria-label="Amount" className="bg-transparent focus:outline-none" />
  </div></>);` });
  assert.ok(!r.ids.includes('AX-02'), JSON.stringify(r.findings));
  assert.ok(clean({ 'b.tsx': 'export const B = () => <button className="focus:outline-none active:bg-gray-100">Go</button>;' }).ids.includes('AX-02'));
});
test('OG image routes are not UI', () => {
  const r = clean({ 'app/api/og/route.tsx': 'import { ImageResponse } from "@vercel/og";\nexport function GET() { const paint = "#fff"; return new ImageResponse(<div tw="leading-[1.1]" style={{ color: paint }}><svg viewBox="0 0 1 1"><path d="M0 0"/></svg><img src="/l.png" alt="" /></div>); }' });
  assert.deepEqual(r.ids.filter((id) => ['TK-01', 'TK-02', 'IC-03', 'FD-04'].includes(id)), []);
});
test('DM-04: next-themes provides color-scheme; prefers-color-scheme does not', () => {
  assert.ok(!check({ ...CLEAN, 'tokens.css': noScheme, 'p.tsx': 'import { ThemeProvider as NextThemesProvider } from "next-themes";\nexport const P = (p) => <NextThemesProvider {...p} />;' }).ids.includes('DM-04'));
  assert.ok(check({ ...CLEAN, 'tokens.css': noScheme, 'l.tsx': 'export const viewport = { themeColor: [{ media: "(prefers-color-scheme: dark)", color: "black" }] };' }).ids.includes('DM-04'));
});
test('RS-03: fixed full-viewport layers do not overflow the page', () => {
  assert.ok(!clean({ 'g.tsx': 'export const G = () => <div className="fixed inset-0 -z-10 h-screen w-screen" />;' }).ids.includes('RS-03'));
});
test('SL-05: Transition states, blur-none and scrims are not glass surfaces', () => {
  const t = '<Transition enterFrom="opacity-0 backdrop-blur-none" enterTo="opacity-100 backdrop-blur-[.5px]" leaveFrom="opacity-100 backdrop-blur-[.5px]" leaveTo="opacity-0 backdrop-blur-none"><div className="fixed inset-0 bg-black/30 backdrop-blur" /></Transition>';
  assert.ok(!clean({ 'a.tsx': `export const A = () => ${t};`, 'b.tsx': `export const B = () => ${t};` }).ids.includes('SL-05'));
});
test('CP-03: generic toast title with a specific description', () => {
  assert.ok(!clean({ 't.tsx': 'export const f = () => toast({\n  title: "Something went wrong.",\n  description: "Your post was not saved. Please try again.",\n});\nexport const X = () => <p/>;' }).ids.includes('CP-03'));
  assert.ok(clean({ 't.tsx': 'export const f = () => toast({\n  title: "Something went wrong.",\n});\nexport const X = () => <p/>;' }).ids.includes('CP-03'));
});
test('surface: storefront paths and a landing root page read as marketing', () => {
  const noDoc = { ...CLEAN, 'design.md': '# Design\nFonts: Figtree.\n' };
  assert.equal(check({ ...noDoc, 'app/product/[handle]/page.tsx': 'export default () => <main/>;', 'app/search/[collection]/page.tsx': 'export default () => <main/>;', 'components/cart/modal.tsx': 'export const C = () => <div/>;' }).surface.value, 'marketing');
  assert.equal(check({ ...noDoc, 'components/home/card.tsx': 'export const C = () => <div/>;', 'app/page.tsx': 'export default () => <main><h1>Precedent</h1><a href="https://x.dev" target="_blank">Deploy</a></main>;' }).surface.value, 'marketing');
});

test('VH-07 allows one display weight on marketing pages; TK-03 keeps the full variant prefix', () => {
  const five = 'export const A = () => <div><h1 className="font-extrabold">A</h1><h2 className="font-semibold">B</h2><p className="font-normal">C</p><b className="font-bold">D</b><i className="font-medium">E</i></div>;';
  assert.ok(clean({ 'p.tsx': five }).ids.includes('VH-07'), 'app surface: five weights fire');
  assert.ok(!check({ ...CLEAN, 'design.md': '# Design\nSurface: marketing\nFonts: Figtree.\n', 'p.tsx': five }).ids.includes('VH-07'), 'marketing: one display weight allowed');
  const r = clean({ 'p.tsx': 'export const A = () => <p className="group-[.destructive]:text-red-300">x</p>;' });
  const f = r.findings.find((x) => x.ruleId === 'TK-03');
  assert.ok(f && f.message.includes('group-[.destructive]:text-red-300'), f && f.message);
});
