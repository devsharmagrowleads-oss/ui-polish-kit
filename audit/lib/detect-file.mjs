// File-level detectors. Each receives a file context `f`, the project `facts`,
// and `report(ruleId, pos, message)` where `pos` is a character offset.
//
// Design goal: low false positives. A detector only fires on a pattern that is
// wrong in almost every codebase; anything judgement-based belongs in the
// agent-facing visual audit (audit/PROCEDURE.md), not here.

import { declarations, isDarkScope, isThemeBlock, huesIn, isPurpleBlueGradient } from './css.mjs';
import { findTags, attr, hasAttr, hasSpread, classMatches, classList, inputType, isInside } from './markup.mjs';

const PALETTE = 'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
const HIDDEN_CLASS = /(^|[\s"'`])(sr-only|visually-hidden|hidden|invisible|opacity-0|peer)(?=$|[\s"'`])/;
const COLOR_LITERAL = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})(?![\w-])|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(\s*[\d.]/;
const SPACING_OK = new Set([6, 10, 14]);

/** The quoted string (class list) that contains `pos`, or the line as a fallback. */
function stringAround(f, pos) {
  const t = f.text;
  const lineStart = t.lastIndexOf('\n', pos - 1) + 1;
  let lineEnd = t.indexOf('\n', pos);
  if (lineEnd < 0) lineEnd = t.length;
  if (f.isStyle) {
    const end = t.indexOf(';', pos);
    return t.slice(lineStart, end < 0 ? lineEnd : Math.max(end, lineEnd));
  }
  let start = -1;
  for (let i = pos - 1; i >= Math.max(0, pos - 2500); i--) {
    const c = t[i];
    if (c === '"' || c === "'" || c === '`') { start = i; break; }
  }
  if (start < 0) return t.slice(lineStart, lineEnd);
  const end = t.indexOf(t[start], pos);
  if (end < 0 || end - start > 4000) return t.slice(lineStart, lineEnd);
  return t.slice(start, end + 1);
}

/** A few lines either side of `pos`: used to look for a paired class. */
function linesAround(f, pos, n = 4) {
  const { line } = f.at(pos);
  const from = f.starts[Math.max(0, line - 1 - n)];
  const to = f.starts[Math.min(f.starts.length - 1, line + n)] ?? f.text.length;
  return f.text.slice(from, line + n >= f.starts.length ? f.text.length : to);
}

function svgRegions(text) {
  const out = [];
  const re = /<svg\b[\s\S]*?<\/svg\s*>/g;
  let m;
  while ((m = re.exec(text))) out.push([m.index, m.index + m[0].length]);
  return out;
}
const inRegion = (regions, pos) => regions.some(([a, b]) => pos >= a && pos < b);

/** Declarations from CSS blocks plus inline style="" attributes. */
function* styleDeclarations(f) {
  for (const b of f.blocks) {
    for (const d of declarations(b)) yield { ...d, block: b };
  }
  if (f.kind === 'html' || f.kind === 'markup' || f.hasMarkup) {
    const re = /\sstyle\s*=\s*(["'])([^"']*)\1/g;
    let m;
    while ((m = re.exec(f.text))) {
      const base = m.index + m[0].length - m[2].length - 1;
      const part = /([a-zA-Z-]+)\s*:\s*([^;]+)/g;
      let d;
      while ((d = part.exec(m[2]))) {
        yield { prop: d[1].toLowerCase(), value: d[2].trim(), pos: base + d.index, valuePos: base + d.index, block: null, inline: true };
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Native controls
// ---------------------------------------------------------------------------

function restyled(tag, facts, elementKey) {
  if (classMatches(tag.src, /appearance-none/)) return true;
  if (facts.appearanceNoneElements.has(elementKey) || (elementKey.startsWith('input:') && facts.appearanceNoneElements.has('input'))) return true;
  const cls = attr(tag.src, 'class|className');
  return typeof cls === 'string' && cls.split(/\s+/).some((c) => facts.appearanceNoneClasses.has(c));
}

function hiddenBehindTrigger(tag) {
  const cls = attr(tag.src, 'class|className');
  if (cls !== undefined && HIDDEN_CLASS.test(cls === true ? tag.src : ` ${cls} `)) return true;
  if (hasAttr(tag.src, 'hidden')) return true;
  const style = attr(tag.src, 'style');
  return typeof style === 'string' && /display\s*:\s*none|opacity\s*:\s*0\b/.test(style);
}

function nativeControls(f, facts, report) {
  if (!f.hasMarkup) return;
  for (const tag of findTags(f.text, 'select')) {
    if (!restyled(tag, facts, 'select')) {
      report('NC-01', tag.start, 'Native <select> with browser-default styling. Use the Select recipe (Radix/shadcn) so the open list matches the theme, or NativeSelect (appearance-none + tokens) where the OS picker is wanted.');
    }
  }
  for (const tag of findTags(f.text, 'input')) {
    const type = inputType(tag.src);
    if (/^(date|datetime-local|month|week)$/.test(type)) {
      report('NC-02', tag.start, `<input type="${type}"> opens the browser's own calendar, which ignores the theme. Use the DatePicker recipe (Popover + Calendar).`);
    } else if (type === 'time') {
      if (!restyled(tag, facts, 'input:time')) report('NC-02', tag.start, '<input type="time"> with browser-default styling. Use the TimePicker recipe or restyle it with tokens (appearance-none).');
    } else if (type === 'file') {
      if (!hiddenBehindTrigger(tag) && !facts.fileButtonStyled && !classMatches(tag.src, /file:[\w-]/)) {
        report('NC-03', tag.start, 'Bare <input type="file"> shows the browser\'s "Choose file" button. Hide the input (sr-only) behind a styled trigger or dropzone: see the FileUpload recipe.');
      }
    } else if (type === 'range') {
      if (!restyled(tag, facts, 'input:range') && !facts.sliderThumbStyled && !facts.accentColor) {
        report('NC-04', tag.start, 'Unstyled <input type="range">. Use the Slider recipe or style the track and thumb with tokens.');
      }
    } else if (type === 'color') {
      if (!hiddenBehindTrigger(tag) && !restyled(tag, facts, 'input:color')) {
        report('NC-05', tag.start, '<input type="color"> renders an OS colour well that cannot be themed. Use the ColorPicker recipe (swatches + hex field).');
      }
    } else if (type === 'checkbox' || type === 'radio') {
      if (!facts.accentColor && !hiddenBehindTrigger(tag) && !restyled(tag, facts, `input:${type}`) && !classMatches(tag.src, /(^|[\s"'`])accent-[\w[(]/)) {
        report('NC-06', tag.start, `Browser-default ${type}. Use the ${type === 'radio' ? 'RadioGroup' : 'Checkbox'} recipe, or at minimum set accent-color from the primary token.`);
      }
    }
  }

  const tooltipTags = 'a|button|div|span|img|input|i|p|li|td|th|tr|label|select|textarea|h[1-6]|section|article|nav|header|footer|strong|em|small|kbd|code|time|summary|svg|canvas|ul|ol|table';
  for (const tag of findTags(f.text, tooltipTags)) {
    if (hasAttr(tag.src, 'title')) {
      report('NC-08', tag.start, `title="…" on <${tag.name}> shows the slow, unstyled browser tooltip and is invisible to touch and keyboard users. Use the Tooltip recipe (and aria-label for icon-only controls).`);
    }
  }
}

function dialogs(f, facts, report) {
  if (f.isStyle) return;
  const re = /(?<![\w$.])(window\.)?(alert|confirm|prompt)\(/g;
  let m;
  while ((m = re.exec(f.text))) {
    const name = m[2];
    if (!m[1]) {
      const local = new RegExp(`function\\s+${name}\\b|(?:const|let|var)\\s+${name}\\b|[{,]\\s*${name}\\s*[,}:]|import\\s+${name}\\b|\\b${name}\\s*=\\s*(?:async\\s*)?(?:\\(|function|use)`);
      if (local.test(f.text)) continue;
      // Method or function definition: `confirm() {` / `confirm(): void`.
      let depth = 1;
      let i = m.index + m[0].length;
      for (; i < f.text.length && depth > 0 && i < m.index + 600; i++) {
        if (f.text[i] === '(') depth++;
        else if (f.text[i] === ')') depth--;
      }
      if (/^\s*(\{|:\s*[A-Za-z]|=>)/.test(f.text.slice(i, i + 16))) continue;
    }
    const swap = name === 'alert' ? 'a toast (Toaster recipe) or inline message' : name === 'confirm' ? 'the ConfirmDialog recipe (useConfirm)' : 'a Dialog with a labelled input';
    report('NC-07', m.index, `${name}() opens a browser-chrome dialog that blocks the page and cannot be styled. Use ${swap}.`);
  }
}

// ---------------------------------------------------------------------------
// Tokens
// ---------------------------------------------------------------------------

function tokens(f, facts, report, once) {
  const svg = f.hasMarkup ? svgRegions(f.text) : [];

  if (!f.isTokenFile) {
    for (const d of styleDeclarations(f)) {
      if (d.prop.startsWith('--') || (d.block && isThemeBlock(d.block))) continue;
      if (inRegion(svg, d.pos)) continue;
      const value = d.value.replace(/url\([^)]*\)/g, '');
      if (COLOR_LITERAL.test(value)) {
        report('TK-01', d.pos, `Hard-coded colour in \`${d.prop}: ${clip(d.value)}\`. Reference a token: var(--…) or a semantic utility.`);
      }
      if (/^(padding|margin|gap|row-gap|column-gap)(-(top|right|bottom|left|inline|block)(-(start|end))?)?$/.test(d.prop)) {
        const off = [...value.matchAll(/(?<![\w.-])(\d+(?:\.\d+)?)px/g)].map((x) => Number(x[1])).filter((n) => n > 2 && n % 4 !== 0 && !SPACING_OK.has(n));
        if (off.length) report('TK-04', d.pos, `Off-scale spacing \`${d.prop}: ${clip(d.value)}\` (${off.join('px, ')}px is not on the 4px scale). Use a spacing token.`);
      }
      if (d.prop === 'z-index' && /^-?\d{3,}$/.test(value.replace(/\s*!important/, ''))) {
        report('TK-06', d.pos, `Magic z-index ${value}. Use the z-index scale tokens (--z-dropdown, --z-modal, --z-toast …).`);
      }
    }

    if (f.kind === 'js') {
      const re = /(["'`])(#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})|(?:rgba?|hsla?|oklch)\(\s*[\d.][^"'`]*)\1/g;
      let m;
      while ((m = re.exec(f.text))) {
        if (inRegion(svg, m.index)) continue;
        const line = lineOf(f, m.index);
        if (/theme-?color|themeColor|msapplication|mask-icon|background_color/i.test(line)) continue;
        report('TK-01', m.index, `Hard-coded colour ${clip(m[2])} in component code. Reference a token: var(--…) or a semantic utility.`);
      }
    }
    if (!f.isStyle) {
      const arb = /(?<![\w-])(?:[\w-]+:)*[a-z-]+-\[(#[0-9a-fA-F]{3,8}|(?:rgba?|hsla?|oklch)\([^\]]*)\]/g;
      let m;
      while ((m = arb.exec(f.text))) {
        report('TK-01', m.index, `Hard-coded colour in Tailwind arbitrary value \`${clip(m[0])}\`. Use a semantic colour utility backed by a token.`);
      }
    }

    const raw = new RegExp(`(?<![\\w-])((?:[\\w\\[\\]&=>-]+:)*)(?:bg|text|border|ring|outline|fill|stroke|from|via|to|divide|decoration|placeholder|caret|accent|shadow|ring-offset)-(?:${PALETTE})-(?:50|[1-9]00|950)(?:\\/\\d+)?(?![\\w-])`, 'g');
    let m;
    while ((m = raw.exec(f.text))) {
      once('TK-03', m.index, m[0], (n, first) => `${n} raw Tailwind palette ${n === 1 ? 'utility' : 'utilities'} (first: \`${first}\`). Use semantic tokens (bg-primary, text-muted-foreground, border-border) so brand and dark mode come from one place.`);
      if (/(^|:)dark:/.test(m[1])) {
        once('DM-02', m.index, m[0], (n, first) => `${n} \`dark:\` palette ${n === 1 ? 'override' : 'overrides'} (first: \`${first}\`). Dark mode should come from redefined tokens, not per-element overrides.`);
      }
    }
  }

  const arbitrary = /(?<![\w-])(?:[\w-]+:)*-?(?:p[xytrblse]?|m[xytrblse]?|gap(?:-[xy])?|space-[xy]|text|leading|tracking|rounded(?:-[a-z]{1,2})?|z|indent|scroll-[pm][xytrblse]?)-\[-?\d*\.?\d+(?:px|rem|em|pt)?\]/g;
  let m;
  while ((m = arbitrary.exec(f.text))) {
    report('TK-02', m.index, `Tailwind arbitrary value \`${m[0]}\`. Use the scale (or add a token) so spacing, type, radius and z-index stay consistent.`);
  }
}

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

function typography(f, facts, report) {
  let m;
  const gf = /fonts\.(?:googleapis|bunny)\.(?:com|net)\/css2?\?[^"'\s)>]+/g;
  while ((m = gf.exec(f.text))) {
    if (!/display=(swap|optional|fallback)/.test(m[0]) && !/Material\+(Icons|Symbols)/.test(m[0])) {
      report('TY-03', m.index, 'Web font requested without `display=swap`: text stays invisible while the font loads. Add `&display=swap` (or use next/font).');
    }
  }
  for (const b of f.blocks) {
    if (/^@font-face\b/.test(b.prelude) && !/font-display\s*:/.test(b.decls)) {
      report('TY-03', b.start, '@font-face without `font-display`. Add `font-display: swap` so text renders in the fallback while the font loads.');
    }
  }

  if (!f.hasMarkup) return;
  const headings = [...findTags(f.text, 'h[1-6]')];
  const h1s = headings.filter((h) => h.name === 'h1');
  if (h1s.length > 1) {
    report('TY-04', h1s[1].start, `${h1s.length} <h1> elements in one file. A page has one <h1>; use <h2>–<h4> for sections and style size separately from level.`);
  }
  if (f.isHtmlDoc) {
    let prev = 0;
    for (const h of headings) {
      const level = Number(h.name[1]);
      if (prev && level > prev + 1) {
        report('TY-04', h.start, `Heading level jumps from <h${prev}> to <h${level}>. Do not skip levels; pick the level for structure and the size with a class.`);
      }
      prev = level;
    }
  }
}

// ---------------------------------------------------------------------------
// AI-slop patterns and motion
// ---------------------------------------------------------------------------

const HERO_COPY = /\b(supercharge your|unlock the (full )?(power|potential)|unleash (the|your)|revolutioni[sz]e (your|the)|elevate your|empower(ing)? your|take your [\w\s]{2,24} to the next level|next[- ]level|game[- ]chang(er|ing)|cutting[- ]edge|seamless(ly)? integrat|streamline your (workflow|business|process)|transform (your|the way)|all[- ]in[- ]one (platform|solution)|build (faster|better),? ?(ship|launch)|welcome to (our|my|the) (website|app|platform|site)|the future of [\w\s]{2,24} is here|10x your|effortless(ly)? (manage|create|build))/i;
const FILLER = /\b(your (company|name|text|title|tagline|logo|brand|headline|description) here|(text|content|description|title|copy|heading) goes here|placeholder text|insert (text|title|copy) here|feature (one|two|three|[1-9])\b|card title(?!\s*=)|some quick example text|sample text|john doe|jane doe|acme (inc|corp|co)\b|foo@bar\.com|test@test\.com|\[your [\w\s]+\])/i;
const VAGUE = /(>\s*click here\s*<|["'`]click here["'`]|something went wrong\.?\s*(<|["'`])|an error (has )?occurr?ed\.?\s*(<|["'`])|\boops[!.]|>\s*submit\s*<\/button>|["'`]invalid input\.?["'`]|>\s*no data\.?\s*<|["'`]no data\.?["'`])/i;

function slop(f, facts, report, once) {
  let m;

  // SL-01: the purple/indigo → blue/pink gradient.
  const from = new RegExp(`(?<![\\w-])(?:[\\w-]+:)*from-(${PALETTE})-\\d+`, 'g');
  while ((m = from.exec(f.text))) {
    const ctx = stringAround(f, m.index);
    const stops = [...ctx.matchAll(new RegExp(`(?:from|via|to)-(${PALETTE})-\\d+`, 'g'))].map((x) => x[1]);
    const purple = stops.some((c) => /^(purple|violet|indigo|fuchsia)$/.test(c));
    const partner = stops.some((c) => /^(blue|sky|cyan|pink|rose)$/.test(c));
    const twoPurples = new Set(stops.filter((c) => /^(purple|violet|indigo|fuchsia)$/.test(c))).size >= 2;
    if (purple && (partner || twoPurples)) {
      report('SL-01', m.index, `Purple/indigo-to-blue gradient (\`${clip(stops.map((s) => s).join(' → '))}\`): the most recognisable AI-generated look. Use a flat brand surface, or a gradient built from the brand tokens recorded in design.md.`);
    }
  }
  const grad = /(?:linear|radial|conic)-gradient\(([^;{}"`]*)/g;
  while ((m = grad.exec(f.text))) {
    if (isPurpleBlueGradient(huesIn(m[1]))) {
      report('SL-01', m.index, 'Purple/indigo-to-blue gradient: the most recognisable AI-generated look. Use a flat brand surface, or a gradient built from the brand tokens recorded in design.md.');
    }
  }

  // SL-02: gradient text.
  const clipText = /(?<![\w-])(?:[\w-]+:)*bg-clip-text(?![\w-])/g;
  while ((m = clipText.exec(f.text))) {
    if (/text-transparent/.test(stringAround(f, m.index)) || /text-transparent/.test(linesAround(f, m.index, 1))) {
      report('SL-02', m.index, 'Gradient text (bg-clip-text + text-transparent). It lowers contrast and reads as template styling. Use a solid foreground colour; create emphasis with weight, size, or one accent word.');
    }
  }
  for (const d of styleDeclarations(f)) {
    if (/^(-webkit-)?background-clip$/.test(d.prop) && /^text\b/.test(d.value) && d.prop === 'background-clip') {
      report('SL-02', d.pos, 'Gradient text (background-clip: text). It lowers contrast and reads as template styling. Use a solid foreground colour.');
    } else if (d.prop === '-webkit-background-clip' && /^text\b/.test(d.value) && !(d.block && /(^|[;\s])background-clip\s*:/.test(d.block.decls))) {
      report('SL-02', d.pos, 'Gradient text (background-clip: text). It lowers contrast and reads as template styling. Use a solid foreground colour.');
    }
    // SL-06: glows.
    if (d.prop === 'box-shadow' || d.prop === 'text-shadow') {
      const min = d.prop === 'box-shadow' ? 16 : 8;
      for (const part of d.value.split(/,(?![^(]*\))/)) {
        const g = /^\s*0(?:px)?\s+0(?:px)?\s+(\d+(?:\.\d+)?)px\b/.exec(part);
        if (g && Number(g[1]) >= min && !/\binset\b/.test(part) && (huesIn(part).length || /var\(--(primary|accent|brand|ring|glow)/.test(part))) {
          report('SL-06', d.pos, `Coloured glow (\`${d.prop}: ${clip(d.value)}\`). Glows read as decoration without purpose. Use the neutral elevation shadows from the shadow tokens.`);
          break;
        }
      }
    }
    // MO-01 / MO-02
    if (d.prop === 'transition' || d.prop === 'transition-property') {
      if (/(^|,)\s*all\b/.test(d.value)) once('MO-01', d.pos, 'transition: all', (n) => `\`transition: all\` (${n}× in this file) animates every property, including layout. List the properties: color, background-color, border-color, opacity, transform, box-shadow.`);
    }
    if (d.prop === 'transition' || d.prop === 'transition-duration') {
      const slow = [...d.value.matchAll(/(?<![\w.-])(\d*\.?\d+)(ms|s)\b/g)].map((x) => Number(x[1]) * (x[2] === 's' ? 1000 : 1));
      const worst = d.prop === 'transition' ? Math.max(0, ...d.value.split(/,(?![^(]*\))/).map((p) => { const t = /(?<![\w.-])(\d*\.?\d+)(ms|s)\b/.exec(p); return t ? Number(t[1]) * (t[2] === 's' ? 1000 : 1) : 0; })) : Math.max(0, ...slow);
      // The autofill override uses a deliberately huge transition to hold the browser's colour off.
      if (worst >= 600 && !(d.block && /autofill/.test(d.block.prelude))) report('MO-02', d.pos, `${worst}ms transition. Interface transitions should finish in 100–300ms (up to ~400ms for large surfaces); longer feels sluggish.`);
    }
  }

  const twGlow = new RegExp(`(?<![\\w-])(?:[\\w-]+:)*(?:drop-)?shadow-(?:\\[0(?:px)?_0(?:px)?_|(?:${PALETTE})-\\d+)`, 'g');
  while ((m = twGlow.exec(f.text))) {
    report('SL-06', m.index, `Coloured or glowing shadow \`${clip(stringToken(f.text, m.index))}\`. Use the neutral elevation shadows from the shadow tokens.`);
  }

  // SL-03: emoji as icons.
  if (!f.isStyle || /content\s*:/.test(f.text)) {
    const emoji = /\p{Extended_Pictographic}/gu;
    let lastLine = -1;
    while ((m = emoji.exec(f.text))) {
      if (m[0].codePointAt(0) < 0x2600) continue;
      const { line } = f.at(m.index);
      if (line === lastLine) continue;
      lastLine = line;
      report('SL-03', m.index, `Emoji "${m[0]}" used in the interface. Emoji render differently on every platform and cannot take the theme colour. Use an icon from the project's single icon set.`);
    }
  }

  if (f.hasMarkup) {
    const lineRe = /[^\n]+/g;
    while ((m = lineRe.exec(f.text))) {
      const hero = HERO_COPY.exec(m[0]);
      if (hero) report('SL-07', m.index + hero.index, `Generic marketing phrase "${hero[0]}". Say what the product does, for whom, with a concrete outcome or number.`);
      const fill = FILLER.exec(m[0]);
      if (fill && !(/doe$/i.test(fill[0]) && /placeholder/i.test(m[0]))) report('CP-02', m.index + fill.index, `Placeholder copy "${fill[0]}". Write the real text, or realistic sample data that matches the product's domain.`);
      const vague = VAGUE.exec(m[0]);
      if (vague) report('CP-03', m.index + vague.index, `Vague microcopy "${clip(vague[0].replace(/<\/?\w*|[<>"'\`]/g, '').trim())}". Name the action or the problem and the next step ("Save changes", "Couldn't save: check your connection and retry").`);
    }
  }

  const lorem = /lorem ipsum|dolor sit amet|consectetur adipisc/gi;
  let lastLorem = -1;
  while ((m = lorem.exec(f.text))) {
    const { line } = f.at(m.index);
    if (line === lastLorem) continue;
    lastLorem = line;
    report('CP-01', m.index, 'Lorem ipsum in source. Replace with real or realistic copy before the task is done.');
  }

  // Motion utilities.
  const all = /(?<![\w-])(?:[\w-]+:)*transition-all(?![\w-])/g;
  while ((m = all.exec(f.text))) once('MO-01', m.index, 'transition-all', (n) => `\`transition-all\` (${n}× in this file) animates every property, including layout. Use transition-colors, transition-opacity, transition-transform or transition-[color,box-shadow].`);
  const dur = /(?<![\w-])(?:[\w-]+:)*duration-(?:\[(\d+)ms\]|(\d+))(?![\w-])/g;
  while ((m = dur.exec(f.text))) {
    const ms = Number(m[1] || m[2]);
    if (ms >= 600 && !/animate-/.test(stringAround(f, m.index))) report('MO-02', m.index, `${ms}ms transition (\`${m[0]}\`). Interface transitions should finish in 100–300ms; longer feels sluggish.`);
  }
  const bounce = /(?<![\w-])(?:[\w-]+:)*animate-bounce(?![\w-])/g;
  while ((m = bounce.exec(f.text))) once('MO-04', m.index, 'animate-bounce', () => '`animate-bounce` loops forever and pulls attention from content. Animate once in response to an event, or remove it.');
}

// ---------------------------------------------------------------------------
// Accessibility, forms, responsive, dark mode, finishing details
// ---------------------------------------------------------------------------

const ICON_NAME = /Icon$|^Icon[A-Z]|^(Fa|Md|Io|Fi|Bi|Ri|Hi|Lu|Tb|Pi|Bs|Ai|Go|Gr|Si|Cg)[A-Z]|^(X|Plus|Minus|Check|Chevron\w*|Arrow\w*|Trash\d?|Search|Menu|Close|Edit\d?|Pencil|Settings\d?|MoreHorizontal|MoreVertical|Ellipsis\w*|Copy|Download|Upload|Bell|Heart|Star|Share\d?|Filter|Refresh\w*|Eye(Off)?|Info|Sun|Moon|Cross\d?)$/;

function accessibility(f, facts, report) {
  let m;

  // AX-02 in CSS.
  const fileHasFocusVisibleStyle = f.blocks.some((b) => /:focus(-visible|-within)?(?![\w-])/.test(b.prelude) && !/:not\(:focus-visible\)/.test(b.prelude) && /(^|[;\s])(outline(-color|-width|-style)?|box-shadow|border(-color)?|background(-color)?)\s*:\s*(?!\s|none|0\b)/.test(b.decls));
  for (const b of f.blocks) {
    const out = /(^|[;\s])(outline(?:-style|-width)?)\s*:\s*(none|0(?:px)?)\s*(!important)?\s*(;|$)/.exec(b.decls);
    if (!out) continue;
    if (/:not\(:focus-visible\)/.test(b.prelude)) continue;
    if (/(^|[;\s])(box-shadow|border|border-color|background|background-color)\s*:/.test(b.decls) && /:focus/.test(b.prelude)) continue;
    if (fileHasFocusVisibleStyle) continue;
    report('AX-02', b.bodyStart + out.index + out[1].length, `\`outline: none\` on \`${clip(b.prelude)}\` removes the focus indicator with no replacement. Keyboard users cannot see where they are. Add a :focus-visible ring using --ring.`);
  }
  // AX-02 in utility classes.
  const tw = /(?<![\w-])((?:[\w-]+:)*)outline-(?:none|hidden|0)(?![\w-])/g;
  while ((m = tw.exec(f.text))) {
    // The replacement may sit on a wrapper a few lines up (focus-within) or in a sibling cn() string.
    const near = `${stringAround(f, m.index)}\n${linesAround(f, m.index, 8)}`;
    if (/focus-visible:(ring|outline-(?!none|hidden|0)|border|shadow|bg)|focus:(ring|outline-(?!none|hidden|0)|border|shadow)|focus-within:|has-\[:focus-visible\]/.test(near)) continue;
    report('AX-02', m.index, `\`${m[0]}\` removes the focus indicator with no replacement in the same class list. Add \`focus-visible:ring-2 focus-visible:ring-ring\` (or an equivalent visible state).`);
  }

  if (/\btab[iI]ndex\s*=\s*(?:["']|\{\s*)?[1-9]/.test(f.text)) {
    m = /\btab[iI]ndex\s*=\s*(?:["']|\{\s*)?[1-9]/.exec(f.text);
    report('AX-08', m.index, 'Positive tabindex overrides the natural tab order and breaks keyboard navigation. Use 0 or -1 and order the DOM instead.');
  }
  if ((m = /user-?[sS]calable\s*[=:]\s*["']?(no|0|false)|maximum-?[sS]cale\s*[=:]\s*["']?1(\.0+)?(?![\d.])/.exec(f.text)) && /viewport/i.test(f.text)) {
    report('AX-05', m.index, 'The viewport blocks pinch-zoom (user-scalable=no / maximum-scale=1). People with low vision need zoom. Remove the restriction.');
  }

  if (!f.hasMarkup) return;

  const importsNextImage = /from\s*["']next\/(legacy\/)?image["']/.test(f.text);
  for (const tag of findTags(f.text, importsNextImage ? 'img|Image' : 'img')) {
    if (hasSpread(tag.src)) continue;
    if (!hasAttr(tag.src, 'alt')) {
      report('AX-03', tag.start, `<${tag.name}> without alt. Describe the image, or use alt="" if it is purely decorative.`);
    }
    if (tag.name === 'img') {
      const sized = (hasAttr(tag.src, 'width') && hasAttr(tag.src, 'height'))
        || classMatches(tag.src, /(^|[\s"'`:])(aspect-|size-)/)
        || (classMatches(tag.src, /(^|[\s"'`:])w-/) && classMatches(tag.src, /(^|[\s"'`:])h-/))
        || classList(tag.src).some((c) => facts.aspectRatioClasses.has(c))
        || /aspect-?[rR]atio/.test(tag.src);
      if (!sized) report('FD-04', tag.start, '<img> without width/height (or an aspect-ratio). The page jumps when the image loads. Set both attributes or reserve the box with aspect-ratio.');
    }
  }

  for (const tag of findTags(f.text, 'div|span|li|p|td|tr|section|article|img|h[1-6]|svg|i')) {
    const handler = attr(tag.src, 'onClick|onclick|@click|on:click|v-on:click');
    if (handler === undefined || hasAttr(tag.src, 'role')) continue;
    if (/stopPropagation|preventDefault/.test(tag.src) && tag.src.length < 260) continue;
    if (classMatches(tag.src, /inset-0|backdrop|overlay|scrim/)) continue;
    report('AX-04', tag.start, `Click handler on a non-interactive <${tag.name}>. It is not focusable and has no keyboard activation. Use <button type="button"> (or <a href> for navigation).`);
  }

  for (const tag of findTags(f.text, 'html')) {
    if (!hasAttr(tag.src, 'lang') && !hasSpread(tag.src)) report('AX-06', tag.start, '<html> without a lang attribute. Screen readers pick pronunciation from it. Add lang="en" (or the page language).');
  }

  for (const tag of findTags(f.text, 'button|a')) {
    if (hasAttr(tag.src, 'aria-label|aria-labelledby|title') || hasSpread(tag.src) || tag.src.endsWith('/>')) continue;
    const closeAt = f.text.indexOf(`</${tag.name}`, tag.end);
    if (closeAt < 0 || closeAt - tag.end > 700) continue;
    const inner = f.text.slice(tag.end + 1, closeAt).trim();
    if (!inner || /sr-only|visually-hidden|<title/.test(inner)) continue;
    const svgOnly = /^<svg\b[\s\S]*<\/svg\s*>$/.test(inner) && !/aria-label/.test(inner);
    const iTag = /^<(i|span)\b[^>]*class(Name)?=["'][^"']*(icon|material|fa-|bi-|ri-)[^"']*["'][^>]*>[^<]*<\/(i|span)>$/.test(inner);
    const comp = /^<([A-Z][\w.]*)\b[^<>]*\/>$/.exec(inner);
    if (svgOnly || iTag || (comp && ICON_NAME.test(comp[1].split('.').pop()))) {
      report('AX-07', tag.start, `Icon-only <${tag.name}> has no accessible name. Add aria-label="…" describing the action (and a Tooltip for sighted users).`);
    }
  }
}

function forms(f, facts, report) {
  if (!f.hasMarkup) return;
  for (const tag of findTags(f.text, 'input|textarea|select')) {
    const type = tag.name === 'input' ? inputType(tag.src) : '';
    if (/^(hidden|submit|button|reset|image)$/.test(type)) continue;
    if (hasSpread(tag.src)) continue;

    if (tag.name === 'input' && /^(email|password|tel)$/.test(type) && !hasAttr(tag.src, 'autocomplete|autoComplete')) {
      report('FM-02', tag.start, `<input type="${type}"> without autocomplete. Set autocomplete (e.g. "${type === 'password' ? 'current-password' : type}") so browsers and password managers can fill it.`);
    }

    if (hasAttr(tag.src, 'aria-label|aria-labelledby')) continue;
    if (isInside(f.text, tag.start, 'label')) continue;
    const id = attr(tag.src, 'id');
    if (id === true) continue;
    if (typeof id === 'string') {
      const esc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (new RegExp(`(?:for|htmlFor)\\s*=\\s*(?:\\{\\s*)?["'\`]${esc}["'\`]`).test(f.text)) continue;
    }
    const ph = hasAttr(tag.src, 'placeholder');
    report('FM-01', tag.start, `<${tag.name}> has no label${ph ? ' (a placeholder is not a label: it disappears on input and is skipped by many screen readers)' : ''}. Add a visible <label for> or use the Field recipe.`);
  }
}

function responsive(f, facts, report) {
  let m;
  for (const d of styleDeclarations(f)) {
    if (d.prop === 'width') {
      const px = /^(\d{3,})px$/.exec(d.value.replace(/\s*!important/, ''));
      const inMinWidthQuery = d.block && d.block.parents.some((p) => /min-width/.test(p));
      const hasMax = d.block ? /(^|[;\s])max-width\s*:/.test(d.block.decls) : false;
      if (px && Number(px[1]) >= 480 && !inMinWidthQuery && !hasMax) {
        report('RS-02', d.pos, `Fixed \`width: ${d.value}\` is wider than a phone screen and forces horizontal scrolling. Use width: 100% with max-width: ${d.value}.`);
      }
      if (/^100vw$/.test(d.value)) report('RS-03', d.pos, '`width: 100vw` includes the scrollbar width and causes horizontal overflow. Use width: 100%.');
    }
    if (d.prop === 'filter' && /invert\(/.test(d.value) && d.block && (isDarkScope(d.block) || /(^|[\s,])(html|body|:root)(?![\w-])/.test(d.block.prelude))) {
      report('DM-03', d.pos, 'Dark mode by `filter: invert()` flips images, shadows and brand colours. Define dark values for the colour tokens instead.');
    }
  }
  const fixed = /(?<![\w:-])w-\[(\d{3,})px\](?![\w-])/g;
  while ((m = fixed.exec(f.text))) {
    if (Number(m[1]) >= 480 && !/max-w-/.test(stringAround(f, m.index))) {
      report('RS-02', m.index, `Fixed \`${m[0]}\` is wider than a phone screen and forces horizontal scrolling. Use \`w-full max-w-[${m[1]}px]\` or a container token.`);
    }
  }
  const vw = /(?<![\w-])(?:[\w-]+:)*w-screen(?![\w-])/g;
  while ((m = vw.exec(f.text))) report('RS-03', m.index, '`w-screen` (100vw) includes the scrollbar width and causes horizontal overflow. Use `w-full`.');
}

const DEFAULT_TITLES = /^(vite( \+ \w+)*( \+ ts)?|create next app|react app|document|untitled( document)?|my app|app|home|title|welcome|page title|new project|next\.js|astro|sveltekit|nuxt app|vite app)$/i;

function documentHead(f, facts, report) {
  if (f.isHtmlDoc && /<head[\s>]/i.test(f.text)) {
    const headAt = f.text.search(/<head[\s>]/i);
    if (!/<meta[^>]+name=["']?viewport/i.test(f.text)) {
      report('RS-01', headAt, 'No viewport meta tag: phones render the page at desktop width and shrink it. Add <meta name="viewport" content="width=device-width, initial-scale=1">.');
    }
    const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(f.text);
    if (!title || !title[1].trim()) report('FD-02', headAt, 'No <title>. Browser tabs, bookmarks and search results show the URL instead. Add a specific title: "Page · Product".');
    else if (DEFAULT_TITLES.test(title[1].trim())) report('FD-02', title.index, `<title> is still the scaffold default ("${title[1].trim()}"). Write a specific title: "Page · Product".`);
    if (!/<meta[^>]+name=["']?description/i.test(f.text)) report('FD-02', headAt, 'No meta description. Search and link previews fall back to arbitrary page text. Add a one-sentence description.');
    const missing = ['og:title', 'og:description', 'og:image'].filter((p) => !new RegExp(`<meta[^>]+(property|name)=["']?${p}`, 'i').test(f.text));
    // Pages kept out of search (404s, error pages, previews) are not shared, so they need no social card.
    const noindex = /<meta[^>]+name=["']?robots["']?[^>]+content=["'][^"']*noindex/i.test(f.text);
    if (missing.length && !noindex) report('FD-03', headAt, `Missing social preview tags: ${missing.join(', ')}. Shared links show a blank card. Add Open Graph tags and a 1200×630 image.`);
  }

  // Next.js App Router root layout.
  if (/(^|\/)app\/layout\.(tsx|jsx|js|ts)$/.test(f.rel)) {
    if (!/export\s+(const\s+metadata|(async\s+)?function\s+generateMetadata)/.test(f.text)) {
      report('FD-02', 0, 'Root layout exports no `metadata`. Add title (with a template) and description.');
    } else {
      const hasOgFile = facts.allFiles.some((p) => /(^|\/)(opengraph-image|twitter-image)\.\w+$/.test(p));
      if (!/openGraph\s*:/.test(f.text) && !hasOgFile) report('FD-03', f.text.search(/metadata/), 'Metadata has no `openGraph` and there is no opengraph-image file. Shared links show a blank card.');
    }
  }
  const scaffold = /Create Next App|Generated by create next app/.exec(f.text);
  if (scaffold && f.kind === 'js') report('FD-02', scaffold.index, 'Scaffold default metadata ("Create Next App") is still in place. Write the real title and description.');
}

// ---------------------------------------------------------------------------

function clip(s, n = 60) {
  const one = String(s).replace(/\s+/g, ' ').trim();
  return one.length > n ? `${one.slice(0, n - 1)}…` : one;
}
function lineOf(f, pos) {
  const start = f.text.lastIndexOf('\n', pos - 1) + 1;
  let end = f.text.indexOf('\n', pos);
  if (end < 0) end = f.text.length;
  return f.text.slice(start, end);
}
function stringToken(text, pos) {
  const m = /[^\s"'`]+/.exec(text.slice(pos, pos + 80));
  return m ? m[0] : '';
}

// ---------------------------------------------------------------------------
// Tables, page structure, links, icons, direction
// ---------------------------------------------------------------------------

/** The source between an opening tag and its matching close (first one found; nesting is rare here). */
function contentOf(text, tag) {
  const close = text.indexOf(`</${tag.name}`, tag.end);
  return close < 0 ? '' : text.slice(tag.end + 1, close);
}

function structure(f, facts, report, once) {
  if (f.hasMarkup) {
    // DT-01 tables with no header cells
    for (const tag of findTags(f.text, 'table')) {
      const body = contentOf(f.text, tag);
      if (body && !/<th[\s>]/.test(body) && !/role=["']columnheader["']/.test(body)) {
        report('DT-01', tag.start, '<table> without header cells. Add a <thead> of <th scope="col"> (and <th scope="row"> for the row\'s name) so every cell has a header for assistive technology, plus a <caption>.');
      }
    }

    // NV-05 links used as buttons
    const fake = /\shref\s*=\s*(?:\{\s*)?(["'`])(#|javascript:[^"'`]*)\1/g;
    let m;
    while ((m = fake.exec(f.text))) {
      report('NV-05', m.index + 1, `href="${clip(m[2], 30)}" makes a link that goes nowhere. Use <button type="button"> for actions, and a real URL for navigation.`);
    }

    // IC-03 inline SVG that is neither hidden nor named
    if (f.ext !== '.svg') {
      for (const tag of findTags(f.text, 'svg')) {
        if (hasSpread(tag.src)) continue;
        if (/\saria-hidden\s*=\s*(\{\s*)?["']?true|\saria-hidden(?=[\s/>])|\srole\s*=\s*["']?(img|presentation|none)|\saria-label(ledby)?\s*=/.test(tag.src)) continue;
        if (/width=["']?0["']?/.test(tag.src) && /height=["']?0["']?/.test(tag.src)) continue; // a hidden sprite sheet
        if (/<title[\s>]/.test(contentOf(f.text, tag))) continue;
        // Already hidden by its wrapper: <span class="icon" aria-hidden="true"><svg …>
        const parent = /<([A-Za-z][\w-]*)\b[^<>]*>\s*$/.exec(f.text.slice(Math.max(0, tag.start - 400), tag.start));
        if (parent && /\saria-hidden\s*=\s*(\{\s*)?["']?true/.test(parent[0])) continue;
        report('IC-03', tag.start, 'Inline <svg> with no aria-hidden and no accessible name. Add aria-hidden="true" when it sits next to a text label, or role="img" with aria-label when the icon carries meaning on its own.');
      }
    }
  }

  // NV-02 a full document without <main>. App shells that render into a root element are skipped.
  if (f.isHtmlDoc) {
    const body = /<body[\s>]/i.exec(f.text);
    if (body && !/<main[\s>]|role\s*=\s*["']main["']/i.test(f.text)) {
      const inner = f.text.slice(body.index).replace(/<script[\s\S]*?<\/script>/gi, '');
      const shell = /\sid\s*=\s*["'](root|app|__next|__nuxt|svelte|main-app)["']/.test(inner);
      const text = inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (!shell && text.length > 40) {
        report('NV-02', body.index, 'Page without a <main> landmark. Wrap the page content in <main id="main">, put navigation in a labelled <nav>, and add a "Skip to content" link as the first focusable element.');
      }
    }
  }

  // IN-01 physical left/right in a localised project
  if (facts.localised) {
    for (const d of styleDeclarations(f)) {
      const physical = /^(margin|padding|border)-(left|right)(-|$)|^(left|right)$|^border-(top|bottom)-(left|right)-radius$/.test(d.prop)
        || ((d.prop === 'text-align' || d.prop === 'float' || d.prop === 'clear') && /^(left|right)\b/.test(d.value));
      if (physical) once('IN-01', d.pos, d.prop, (n, first) => `${n} physical left/right ${n === 1 ? 'property' : 'properties'} (first: \`${first}\`) in a translated project. Use logical properties (margin-inline-start, padding-inline-end, inset-inline-start, text-align: start) so right-to-left layouts mirror.`);
    }
    if (f.hasMarkup) {
      const tw = /(?<=["'`\s:])-?(?:m[lr]|p[lr]|left|right|rounded-[lr]|border-[lr]|scroll-m[lr]|scroll-p[lr])-[\w./[\]-]+|(?<=["'`\s:])(?:text|float)-(?:left|right)(?=["'`\s])/g;
      let t;
      while ((t = tw.exec(f.text))) {
        once('IN-01', t.index, t[0], (n, first) => `${n} physical left/right Tailwind ${n === 1 ? 'utility' : 'utilities'} (first: \`${first}\`) in a translated project. Use the logical ones (ms-/me-, ps-/pe-, start-/end-, rounded-s-/rounded-e-, text-start/text-end).`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// UX laws
// ---------------------------------------------------------------------------

const NAV_SKIP = /breadcrumb|pagination|pager|footer|sitemap|table of contents|contents|on this page|\btoc\b|\bsteps?\b|\btabs?\b/i;
const LOOSE_FIELD = /\b(tel|phone|mobile|cc-number|card-?number|card|iban|postal-code|postcode|zip)\b/i;
const STRICT_FIELD = /\b(cc-csc|csc|cvc|cvv|one-time-code|otp|pin)\b/i;

// AS-05: images from placeholder and random-image services.
const PLACEHOLDER_IMAGES = /\b(?:via\.placeholder\.com|placehold\.(?:co|it|jp)|placeholder\.com|picsum\.photos|source\.unsplash\.com|unsplash\.it|placekitten\.com|placebear\.com|placecage\.com|fillmurray\.com|dummyimage\.com|lorempixel\.com|loremflickr\.com|fakeimg\.pl|placeimg\.com|baconmockup\.com)\b/gi;

function assets(f, facts, report) {
  if (f.ext === '.md') return;
  let m;
  PLACEHOLDER_IMAGES.lastIndex = 0;
  while ((m = PLACEHOLDER_IMAGES.exec(f.text))) {
    report('AS-05', m.index, `Image from ${m[0]}, a placeholder or random-image service. It is unrelated to the product, changes or disappears, and marks the page as a template. Use the product's own screenshots or the owner's photos (ask for them during the asset inventory), or design the section without an image.`);
  }
}

function uxLaws(f, facts, report) {
  if (!f.hasMarkup) return;
  // UX-02 Hick's law: a navigation bar with too many top-level links.
  for (const nav of findTags(f.text, 'nav')) {
    const label = String(attr(nav.src, 'aria-label|id|class|className') ?? '');
    if (NAV_SKIP.test(label) || isInside(f.text, nav.start, 'footer')) continue;
    const body = contentOf(f.text, nav);
    let depth = 0;
    let links = 0;
    const re = /<(ul|ol)[\s>]|<\/(ul|ol)>|<(a|Link|NavLink|NavItem)[\s>]/g;
    let m;
    while ((m = re.exec(body))) {
      if (m[1]) depth++;
      else if (m[2]) depth = Math.max(0, depth - 1);
      else if (depth <= 1) links++;
    }
    if (links > 8) {
      report('UX-02', nav.start, `Navigation with ${links} top-level links. Every extra choice slows the decision (Hick's law): keep about seven, ordered by use, and group or move the rest (settings and help into an account menu, rarely used pages into a "More" group).`);
    }
  }
  // UX-10 Postel's law: patterns that reject the way people type phone and card numbers.
  for (const tag of findTags(f.text, 'input|Input')) {
    const pattern = attr(tag.src, 'pattern');
    if (typeof pattern !== 'string') continue;
    const ident = [inputType(tag.src), attr(tag.src, 'autocomplete|autoComplete'), attr(tag.src, 'name'), attr(tag.src, 'id')].filter((x) => typeof x === 'string').join(' ');
    if (!LOOSE_FIELD.test(ident) || STRICT_FIELD.test(ident)) continue;
    // Allowed when the pattern contains a space, \s, \x20, a dot or a negated class.
    if (/ |\\s|\\x20|\.|\[\^/.test(pattern)) continue;
    report('UX-10', tag.start, `pattern="${clip(pattern, 30)}" rejects spaces in a phone, card or postcode field, but people type these the way they are printed ("4242 4242 4242 4242", "+44 20 7946 0958"). Allow spaces and dashes in the pattern and strip them before validating (Postel's law).`);
  }
}

export function runFileDetectors(f, facts, report, once) {
  nativeControls(f, facts, report);
  dialogs(f, facts, report);
  tokens(f, facts, report, once);
  typography(f, facts, report);
  slop(f, facts, report, once);
  accessibility(f, facts, report);
  forms(f, facts, report);
  responsive(f, facts, report);
  documentHead(f, facts, report);
  structure(f, facts, report, once);
  uxLaws(f, facts, report);
  assets(f, facts, report);
}
