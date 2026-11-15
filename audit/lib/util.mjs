// Text helpers shared by the checker: comment masking, ignore directives,
// line lookup, and a minimal glob matcher. No dependencies.

/** Offsets at which each line starts. */
export function lineStarts(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) === 10) starts.push(i + 1);
  return starts;
}

/** 1-based line and column for a character offset. */
export function locate(starts, pos) {
  let lo = 0;
  let hi = starts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (starts[mid] <= pos) lo = mid;
    else hi = mid - 1;
  }
  return { line: lo + 1, column: pos - starts[lo] + 1 };
}

function blank(chars, from, to) {
  for (let i = from; i < to; i++) if (chars[i] !== '\n' && chars[i] !== '\r') chars[i] = ' ';
}

/**
 * Replace comments with spaces (same length, newlines kept) so detectors never
 * match commented-out code and reported offsets stay valid.
 * `comments` collects { start, end, text } for ignore-directive parsing.
 */
function maskJsRange(src, chars, from, to, comments) {
  let i = from;
  let quote = null;
  while (i < to) {
    const c = src[i];
    if (quote) {
      if (c === '\\') { i += 2; continue; }
      // ' and " cannot span lines in JS; resetting here also limits the damage
      // of an apostrophe in JSX text being mistaken for a string start.
      if (c === quote || (c === '\n' && quote !== '`')) quote = null;
      i++;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { quote = c; i++; continue; }
    if (c === '/' && src[i + 1] === '/' && src[i - 1] !== ':') {
      let j = src.indexOf('\n', i);
      if (j < 0 || j > to) j = to;
      comments.push({ start: i, end: j, text: src.slice(i, j) });
      blank(chars, i, j);
      i = j;
      continue;
    }
    if (c === '/' && src[i + 1] === '*') {
      let j = src.indexOf('*/', i + 2);
      j = j < 0 || j + 2 > to ? to : j + 2;
      comments.push({ start: i, end: j, text: src.slice(i, j) });
      blank(chars, i, j);
      i = j;
      continue;
    }
    i++;
  }
}

function maskCssRange(src, chars, from, to, comments, lineComments) {
  let i = from;
  while (i < to) {
    if (src[i] === '/' && src[i + 1] === '*') {
      let j = src.indexOf('*/', i + 2);
      j = j < 0 || j + 2 > to ? to : j + 2;
      comments.push({ start: i, end: j, text: src.slice(i, j) });
      blank(chars, i, j);
      i = j;
      continue;
    }
    if (lineComments && src[i] === '/' && src[i + 1] === '/' && (i === 0 || /\s/.test(src[i - 1]))) {
      let j = src.indexOf('\n', i);
      if (j < 0 || j > to) j = to;
      comments.push({ start: i, end: j, text: src.slice(i, j) });
      blank(chars, i, j);
      i = j;
      continue;
    }
    i++;
  }
}

function maskHtml(src, chars, comments) {
  const re = /<!--[\s\S]*?-->/g;
  let m;
  while ((m = re.exec(src))) {
    comments.push({ start: m.index, end: m.index + m[0].length, text: m[0] });
    blank(chars, m.index, m.index + m[0].length);
  }
  for (const region of embeddedRegions(src, 'script')) maskJsRange(src, chars, region.start, region.end, comments);
  for (const region of embeddedRegions(src, 'style')) maskCssRange(src, chars, region.start, region.end, comments, false);
}

/** Inner ranges of <script> or <style> elements in markup. */
export function embeddedRegions(src, tag) {
  const out = [];
  const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}\\s*>`, 'gi');
  let m;
  while ((m = re.exec(src))) {
    const start = m.index + m[0].indexOf('>') + 1;
    out.push({ start, end: start + m[1].length });
  }
  return out;
}

/** kind: 'js' | 'css' | 'scss' | 'html' */
export function maskComments(src, kind) {
  const chars = src.split('');
  const comments = [];
  if (kind === 'js') maskJsRange(src, chars, 0, src.length, comments);
  else if (kind === 'css') maskCssRange(src, chars, 0, src.length, comments, false);
  else if (kind === 'scss') maskCssRange(src, chars, 0, src.length, comments, true);
  else maskHtml(src, chars, comments);
  return { text: chars.join(''), comments };
}

const RULE_ID = /^[A-Z]{2}-\d{2}$/;

/**
 * Parse ignore directives out of comments.
 *   ui-polish-ignore-next-line [IDs]   ui-polish-ignore-line [IDs]
 *   ui-polish-ignore-file [IDs]        ui-polish-disable [IDs] ... ui-polish-enable [IDs]
 * No IDs means every rule. Returns a predicate (ruleId, line) => boolean.
 */
export function buildIgnore(comments, starts) {
  const fileRules = new Set();
  let fileAll = false;
  const lineRules = new Map(); // line -> Set | 'all'
  const ranges = []; // { from, to, ids: Set | 'all' }
  const open = [];
  const lastLine = starts.length;

  const addLine = (line, ids) => {
    if (ids === 'all' || lineRules.get(line) === 'all') { lineRules.set(line, 'all'); return; }
    const set = lineRules.get(line) || new Set();
    ids.forEach((id) => set.add(id));
    lineRules.set(line, set);
  };

  for (const c of comments) {
    const re = /ui-polish-(ignore-next-line|ignore-line|ignore-file|disable|enable)\b([^\n]*)/g;
    let m;
    while ((m = re.exec(c.text))) {
      const found = m[2].split(/[\s,]+/).map((s) => s.replace(/[^A-Z0-9-]/g, '')).filter((s) => RULE_ID.test(s));
      const ids = found.length ? new Set(found) : 'all';
      const startLine = locate(starts, c.start).line;
      const endLine = locate(starts, Math.max(c.start, c.end - 1)).line;
      switch (m[1]) {
        case 'ignore-file':
          if (ids === 'all') fileAll = true;
          else ids.forEach((id) => fileRules.add(id));
          break;
        case 'ignore-line':
          addLine(startLine, ids);
          break;
        case 'ignore-next-line':
          addLine(endLine + 1, ids);
          break;
        case 'disable':
          open.push({ from: endLine, ids });
          break;
        case 'enable': {
          const o = open.pop();
          if (o) ranges.push({ from: o.from, to: startLine, ids: o.ids });
          break;
        }
      }
    }
  }
  for (const o of open) ranges.push({ from: o.from, to: lastLine, ids: o.ids });

  return (ruleId, line) => {
    if (fileAll || fileRules.has(ruleId)) return true;
    const l = lineRules.get(line);
    if (l && (l === 'all' || l.has(ruleId))) return true;
    return ranges.some((r) => line >= r.from && line <= r.to && (r.ids === 'all' || r.ids.has(ruleId)));
  };
}

/** Minimal glob: `**` any depth, `*` within a segment, `?` one character. */
export function globToRegExp(glob) {
  let re = '';
  const g = glob.replace(/\\/g, '/');
  for (let i = 0; i < g.length; i++) {
    const c = g[i];
    if (c === '*') {
      if (g[i + 1] === '*') {
        i++;
        if (g[i + 1] === '/') { i++; re += '(?:.*/)?'; } else re += '.*';
      } else re += '[^/]*';
    } else if (c === '?') re += '[^/]';
    else re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${re}$`, 'i');
}

export function matchesAny(relPath, globs) {
  return globs.some((g) => {
    const re = globToRegExp(g);
    // A bare name ("vendor") or a pattern without a slash matches at any depth.
    return re.test(relPath) || (!g.includes('/') && relPath.split('/').some((seg) => re.test(seg)));
  });
}
