// A small brace-matching CSS reader. It is not a full parser: it yields every
// rule block with its prelude (selector or at-rule), its own declarations
// (nested blocks blanked out), and the preludes of its ancestors.

/**
 * @param {string} text  comment-masked CSS
 * @param {number} base  offset of `text` inside the containing file
 * @returns {{prelude:string, parents:string[], start:number, bodyStart:number, bodyEnd:number, decls:string}[]}
 */
export function parseBlocks(text, base = 0) {
  const blocks = [];
  const stack = [];
  let preludeStart = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"' || c === "'") {
      const j = text.indexOf(c, i + 1);
      if (j < 0) break;
      i = j;
    } else if (c === ';') {
      preludeStart = i + 1;
    } else if (c === '{') {
      const raw = text.slice(preludeStart, i);
      const lead = raw.length - raw.trimStart().length;
      stack.push({ prelude: raw.trim().replace(/\s+/g, ' '), start: preludeStart + lead, bodyStart: i + 1, holes: [] });
      preludeStart = i + 1;
    } else if (c === '}') {
      const b = stack.pop();
      preludeStart = i + 1;
      if (!b) continue;
      const chars = text.slice(b.bodyStart, i).split('');
      for (const [from, to] of b.holes) {
        for (let k = from - b.bodyStart; k < to - b.bodyStart; k++) if (chars[k] !== '\n') chars[k] = ' ';
      }
      const decls = chars.join('');
      blocks.push({
        prelude: b.prelude,
        parents: stack.map((s) => s.prelude),
        start: base + b.start,
        bodyStart: base + b.bodyStart,
        bodyEnd: base + i,
        decls,
      });
      const parent = stack[stack.length - 1];
      if (parent) parent.holes.push([b.start, i + 1]);
    }
  }
  return blocks;
}

/** Declarations of a block: { prop, value, pos } with `pos` as a file offset. */
export function declarations(block) {
  const out = [];
  const re = /(^|[;{\s])(--[\w-]+|[a-zA-Z-]+)\s*:\s*([^;]+)/g;
  let m;
  while ((m = re.exec(block.decls))) {
    const propAt = m.index + m[1].length;
    out.push({ prop: m[2].toLowerCase(), value: m[3].trim(), pos: block.bodyStart + propAt, valuePos: block.bodyStart + m.index + m[0].length - m[3].length });
  }
  return out;
}

/** True when the block (or an ancestor) defines a dark theme scope. */
export function isDarkScope(block) {
  const dark = /(\.dark\b|\.theme-dark\b|\[data-(theme|mode|color-scheme|bs-theme)\s*[~|^$*]?=\s*["']?dark|\[class~=["']?dark|prefers-color-scheme:\s*dark)/i;
  return dark.test(block.prelude) || block.parents.some((p) => dark.test(p));
}

export function isThemeBlock(block) {
  return /^@theme\b/.test(block.prelude) || block.parents.some((p) => /^@theme\b/.test(p));
}

// --- colour helpers ---------------------------------------------------------

/** Hue in degrees (0-360) and saturation (0-1) for a hex colour, or null. */
export function hexToHsl(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3 || h.length === 4) h = h.split('').map((x) => x + x).join('');
  if (h.length !== 6 && h.length !== 8) return null;
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return rgbToHsl(r, g, b);
}

export function rgbToHsl(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  return { h, s, l };
}

const NAMED_HUES = { purple: 285, violet: 270, indigo: 245, blue: 220, fuchsia: 300, magenta: 300, pink: 330, cyan: 190, royalblue: 225, blueviolet: 271, mediumpurple: 260, rebeccapurple: 270, darkviolet: 282, slateblue: 248, dodgerblue: 210 };

/** Hues of every recognisable colour stop in a CSS value. */
export function huesIn(value) {
  const hues = [];
  let m;
  const hex = /#([0-9a-fA-F]{3,8})\b/g;
  while ((m = hex.exec(value))) {
    const c = hexToHsl(m[0]);
    if (c && c.s > 0.25) hues.push(c.h);
  }
  const rgb = /rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})/g;
  while ((m = rgb.exec(value))) {
    const c = rgbToHsl(m[1] / 255, m[2] / 255, m[3] / 255);
    if (c.s > 0.25) hues.push(c.h);
  }
  const hsl = /hsla?\(\s*(\d{1,3}(?:\.\d+)?)(?:deg)?[\s,]+(\d{1,3}(?:\.\d+)?)%/g;
  while ((m = hsl.exec(value))) if (Number(m[2]) > 25) hues.push(Number(m[1]) % 360);
  const named = new RegExp(`\\b(${Object.keys(NAMED_HUES).join('|')})\\b`, 'gi');
  while ((m = named.exec(value))) hues.push(NAMED_HUES[m[1].toLowerCase()]);
  return hues;
}

/** The signature "AI gradient": a violet/purple/indigo stop next to a blue, cyan, or pink one. */
export function isPurpleBlueGradient(hues) {
  const purple = hues.some((h) => h >= 235 && h <= 300);
  const partner = hues.some((h) => (h >= 180 && h < 235) || (h > 300 && h <= 345));
  const twoPurples = hues.filter((h) => h >= 235 && h <= 300).length >= 2 && Math.max(...hues) - Math.min(...hues) >= 15;
  return purple && (partner || twoPurples);
}
