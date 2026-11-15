// Tag and attribute helpers that work on HTML, JSX/TSX, Vue, Svelte and Astro
// source without a real parser. Good enough for linting opening tags.

/** Index of the `>` closing the opening tag that starts before `from`. */
function tagEnd(text, from) {
  let depth = 0;
  let quote = null;
  const limit = Math.min(text.length, from + 6000);
  for (let i = from; i < limit; i++) {
    const c = text[i];
    if (quote) {
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') quote = c;
    else if (c === '{') depth++;
    else if (c === '}') depth--;
    else if (c === '>' && depth <= 0 && text[i - 1] !== '=') return i;
  }
  return -1;
}

/**
 * Opening tags whose name matches `names` (a regex source such as "select|input").
 * Yields { name, start, end, src }.
 */
export function* findTags(text, names, { caseSensitive = true } = {}) {
  const re = new RegExp(`<(${names})(?=[\\s/>])`, caseSensitive ? 'g' : 'gi');
  let m;
  while ((m = re.exec(text))) {
    // Skip TypeScript generics and comparisons: a tag is not preceded by an identifier character.
    const prev = text[m.index - 1];
    if (prev && /[\w$.)\]]/.test(prev)) continue;
    const end = tagEnd(text, m.index + m[0].length);
    if (end < 0) continue;
    yield { name: m[1], start: m.index, end, src: text.slice(m.index, end + 1) };
  }
}

/**
 * Attribute value. Returns the literal string when it is one, `true` when the
 * attribute is present but dynamic or valueless, `undefined` when absent.
 * `names` may list alternatives: "class|className".
 */
export function attr(tagSrc, names) {
  // Three shapes: a literal value (groups 1-6), a dynamic `{expression}` (group 7), or no value.
  const literal = `"([^"]*)"|'([^']*)'|\\{\\s*(?:"([^"]*)"|'([^']*)'|\`([^\`$]*)\`)\\s*\\}|([^\\s"'>{]+)`;
  const re = new RegExp(`(?:[\\s"'}])(?:${names})(?:\\s*=\\s*(?:(?:${literal})(?=[\\s/>]|$)|(\\{))|(?=[\\s/>]|$))`);
  const m = re.exec(tagSrc);
  if (!m) return undefined;
  for (let i = 1; i <= 6; i++) if (m[i] !== undefined) return m[i];
  return true;
}

export const hasAttr = (tagSrc, names) => attr(tagSrc, names) !== undefined;

/** True when the tag spreads props (`{...props}`), i.e. attributes may arrive from the caller. */
export const hasSpread = (tagSrc) => /\{\s*\.\.\./.test(tagSrc);

/**
 * Test the tag's classes against a regex. For a dynamic class expression
 * (cn(...), template strings) the whole tag source is searched instead.
 */
export function classMatches(tagSrc, re) {
  const cls = attr(tagSrc, 'class|className|:class|class:list');
  if (cls === undefined) return false;
  return re.test(cls === true ? tagSrc : cls);
}

export function classList(tagSrc) {
  const cls = attr(tagSrc, 'class|className');
  if (typeof cls === 'string') return cls.split(/\s+/).filter(Boolean);
  if (cls === true) return (tagSrc.match(/[\w:/.[\]()%-]+/g) || []);
  return [];
}

/** Lowercased literal `type` of an input, or '' when absent/dynamic. */
export function inputType(tagSrc) {
  const t = attr(tagSrc, 'type');
  return typeof t === 'string' ? t.toLowerCase() : '';
}

/** Is `pos` inside an open element of the given name (e.g. inside <label>…</label>)? */
export function isInside(text, pos, name) {
  const before = text.slice(Math.max(0, pos - 3000), pos);
  const open = before.lastIndexOf(`<${name}`);
  if (open < 0) return false;
  const close = before.lastIndexOf(`</${name}`);
  return close < open;
}
