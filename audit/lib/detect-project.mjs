// Project-level detectors: things that are true (or missing) for the project as
// a whole rather than at one line. `report(ruleId, where, message)` takes
// `where` as { rel, pos } or null.

const DEFAULT_PRONE = new Set(['inter', 'roboto', 'poppins', 'open sans', 'montserrat', 'lato', 'space grotesk', 'geist', 'geist sans', 'arial', 'helvetica']);

export function runProjectDetectors(project, report) {
  const { facts, config, files } = project;
  const all = facts.allFiles;
  const has = (re) => all.some((p) => re.test(p));
  const uiFiles = files.filter((f) => f.hasMarkup || f.isStyle);
  if (!uiFiles.length) return;

  const interactive = files.find((f) => f.hasMarkup && /<(button|a|input|select|textarea)[\s>]/.test(f.text));
  const nextLayout = files.find((f) => /(^|\/)app\/layout\.(tsx|jsx|js|ts)$/.test(f.rel));
  const isApp = facts.htmlDocs.length > 0 || Boolean(nextLayout) || has(/(^|\/)pages\/_(app|document)\.\w+$/);
  const entry = facts.htmlDocs.find((f) => /(^|\/)index\.html?$/.test(f.rel)) || facts.htmlDocs[0] || nextLayout || null;
  const at = (f, pos = 0) => (f ? { rel: f.rel, pos } : null);

  // --- tokens and dark mode
  const hasTokens = facts.tokenCount >= 5 || facts.hasTailwindThemeConfig;
  if (!hasTokens) {
    report('TK-05', null, 'No design tokens found (no CSS custom properties on :root / @theme, no Tailwind theme). Define colour, spacing, radius, shadow, type, z-index and motion tokens before building components: see recipes/react-tailwind-shadcn/tokens/tokens.css.');
  } else if (config.darkMode && !facts.darkTokens && !facts.usesLightDark) {
    report('DM-01', null, 'Tokens are defined for one theme only. Redefine the colour and shadow tokens under `.dark` (or `[data-theme="dark"]` / prefers-color-scheme). If the product is deliberately light-only, record that in design.md and set "darkMode": false in ui-polish.config.json.');
  }
  if (facts.darkTokens && !facts.colorScheme) {
    report('DM-04', null, 'Dark tokens exist but `color-scheme` is never set, so scrollbars, native controls and autofill stay light in dark mode. Set `color-scheme: light` on :root and `color-scheme: dark` on the dark scope.');
  }

  // --- typography
  if (!config.allowSystemFonts) {
    const fonts = facts.customFonts.filter((x) => !/mono|code/i.test(x.family) && !/^\(/.test(x.family));
    const hosted = facts.customFonts.some((x) => /^\(/.test(x.family));
    if (!facts.customFonts.length) {
      report('TY-01', null, facts.fontDeclared
        ? 'Only system/default font stacks are configured. Load the brand typeface from design.md, or a deliberately chosen pairing (rules/03-typography.md has a list by product personality). If a system stack is the brand decision, set "allowSystemFonts": true.'
        : 'No font is configured anywhere, so the browser default (Times/Arial) is used. Load the brand typeface from design.md, or a deliberately chosen pairing (rules/03-typography.md).');
    } else if (fonts.length && !hosted) {
      const names = [...new Set(fonts.map((x) => x.family))];
      const doc = facts.designDocText.toLowerCase();
      const unrecorded = names.filter((n) => DEFAULT_PRONE.has(n.toLowerCase()) && !doc.includes(n.toLowerCase()));
      if (unrecorded.length === names.length) {
        const first = fonts.find((x) => x.family === unrecorded[0]);
        report('TY-02', { rel: first.rel, pos: first.pos }, `The only typeface${names.length > 1 ? 's are' : ' is'} ${names.join(', ')}: the font agents reach for by default, with no record in design.md that it was chosen. Use the brand font, or pick a pairing suited to the product and record the decision in design.md.`);
      }
    }
  }

  // --- icons, glass
  if (facts.iconLibs.size > 1) {
    const libs = [...facts.iconLibs.entries()];
    report('SL-04', libs[1][1], `${libs.length} icon sets in use (${libs.map(([n, w]) => `${n} in ${w.rel}`).join('; ')}). Mixed stroke widths and corner styles look assembled from parts. Pick one set and replace the others.`);
  }
  if (facts.backdropBlur.length >= 4) {
    report('SL-05', facts.backdropBlur[0], `backdrop-blur used ${facts.backdropBlur.length} times. Glass on every surface lowers contrast and costs GPU time. Keep blur for at most one layer (e.g. a sticky header) and use solid token surfaces elsewhere.`);
  }

  // --- states / accessibility / motion
  if (interactive && !facts.focusVisible) {
    report('AX-01', null, 'No :focus-visible styles anywhere in the project. Keyboard users get the browser default at best, nothing at worst. Add a global :focus-visible ring using --ring, and focus-visible utilities on custom controls.');
  }
  if (facts.usesMotion && !facts.reducedMotion) {
    report('MO-03', facts.usesMotion, 'The project animates but never checks prefers-reduced-motion. Add the global reduced-motion reset from tokens.css (or motion-reduce: utilities).');
  }
  if (facts.scrollContainer && !facts.scrollbarStyled) {
    report('NC-09', facts.scrollContainer, 'Scrollable containers use the default OS scrollbar, which is light grey on any theme. Set scrollbar-color/scrollbar-width from tokens (and color-scheme), or use the ScrollArea recipe.');
  }
  if (facts.firstInput && !facts.autofillStyled) {
    report('NC-10', facts.firstInput, 'Browser autofill paints inputs pale yellow/blue because :-webkit-autofill is never styled. Add the autofill override from tokens.css.');
  }

  // --- finishing details
  if (isApp) {
    const linkIcon = files.some((f) => /<link[^>]+rel=["'](?:shortcut )?(?:icon|apple-touch-icon)["']/i.test(f.text) || /\bicons\s*:\s*[{["'`]/.test(f.text));
    const iconFile = has(/(^|\/)(favicon\.(ico|svg|png)|icon\.(ico|svg|png|tsx|jsx|js|ts)|apple-icon\.\w+|apple-touch-icon[\w-]*\.png)$/);
    if (!linkIcon && !iconFile) {
      report('FD-01', at(entry), 'No favicon. The browser tab shows a blank page icon (or the framework logo). Add an SVG/ICO favicon and an apple-touch-icon.');
    } else {
      const touchIcon = files.some((f) => /rel=["']apple-touch-icon(-precomposed)?["']|\bapple\s*:\s*[{["'`]/i.test(f.text)) || has(/(^|\/)(apple-icon\.\w+|apple-touch-icon[\w-]*\.png)$/);
      if (!touchIcon) {
        report('AS-02', at(entry), 'There is a favicon but no apple-touch-icon, so a site saved to an iPhone home screen shows a screenshot thumbnail. Add a 180×180 PNG with a solid background (<link rel="apple-touch-icon" href="/apple-touch-icon.png">), generated from the same mark as the favicon.');
      }
    }
    const manifest = has(/(^|\/)([\w-]*\.webmanifest|manifest\.json|manifest\.(ts|js)|manifest\.webmanifest)$/) || files.some((f) => /rel=["']manifest["']/i.test(f.text));
    const themeColor = files.some((f) => /name=["']theme-color["']|\bthemeColor\s*:/.test(f.text));
    if (!manifest && !themeColor) {
      report('AS-03', at(entry), 'No theme-color meta tag and no web app manifest. Set <meta name="theme-color"> from the background token (one per colour scheme) and add a site.webmanifest with name, short_name, colours and icons, so mobile browser chrome and installed versions match the product.');
    }
    // LP-07: marketing pages need privacy, terms and contact links (run.mjs drops it on app surfaces).
    {
      const privacyRoute = has(/(^|\/)(privacy|privacy-policy|legal|datenschutz)(\/|\.|-|$)/i);
      const privacyLink = files.some((f) => f.hasMarkup && /href\s*=\s*\{?\s*["'`][^"'`]*(privacy|legal)/i.test(f.text));
      // A "Privacy" link whose href goes nowhere is the common case in agent output; say so.
      const deadLink = files.some((f) => f.hasMarkup && /<a\b[^>]*href\s*=\s*["'](#|javascript:[^"']*)["'][^>]*>\s*Privacy\b/i.test(f.text));
      if (!privacyRoute && !privacyLink && deadLink) {
        report('LP-07', at(entry), 'The footer has a "Privacy" link, but it points nowhere (href="#") and there is no privacy page. Link privacy, terms and contact to real pages, and ask the owner for the legal text; do not invent it.');
      } else if (!privacyRoute && !privacyLink) {
        report('LP-07', at(entry), 'Marketing site with no privacy policy page or link. Link privacy, terms and contact from the footer of every page, and next to forms that collect personal data. Ask the owner for the legal text; do not invent it.');
      }
    }
    if (!has(/(^|\/)(404\.(html?|tsx|jsx|js|astro|vue|svelte|md)|not-found\.(tsx|jsx|js)|\+error\.svelte|error\.vue|\[\.\.\.[\w]+\]\.\w+)$/)) {
      report('FD-05', at(entry), 'No 404 page. Mistyped URLs land on the host\'s default error screen. Add a not-found page with the site navigation and a way back.');
    }
  }

  // --- visual hierarchy: number of font weights in use
  const weights = new Map(); // weight -> first { rel, pos }
  const WEIGHT_NAMES = { thin: 100, extralight: 200, light: 300, normal: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800, black: 900, lighter: 300, bolder: 700 };
  for (const f of files) {
    const text = f.text.replace(/@font-face\s*\{[^}]*\}/g, (x) => ' '.repeat(x.length));
    const css = /(?<![-\w])font-weight\s*:\s*(\d{3}|bold|bolder|normal|lighter)\b/g;
    const tw = /(?<=["'`\s:])font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)(?=["'`\s])/g;
    for (const re of f.isStyle || f.cssRegions.length ? [css, tw] : [tw]) {
      let m;
      while ((m = re.exec(text))) {
        const w = Number(m[1]) || WEIGHT_NAMES[m[1]];
        if (w && !weights.has(w)) weights.set(w, { rel: f.rel, pos: m.index });
      }
    }
  }
  if (weights.size > 4) {
    const list = [...weights.keys()].sort((a, b) => a - b);
    report('VH-07', weights.get(list[list.length - 1]), `${weights.size} font weights in use (${list.join(', ')}). Weight is an emphasis level, so more than three or four stops meaning anything. Settle on regular, medium and semibold (or bold) and give each one role.`);
  }

  // --- brand intake
  if (!facts.designDoc) {
    report('BR-01', null, 'No design.md. Before building UI, record brand colours, fonts, tone and references (templates/design.md is the template) so every later decision has something to follow.');
  } else if (facts.surface && facts.surface.source === 'detected' && facts.surface.value === 'unknown') {
    report('BR-06', null, 'design.md does not say what kind of product this is, and the code does not make it clear. Add a line "Surface: marketing", "Surface: app" or "Surface: both" so rules meant only for landing pages or only for apps apply where they fit.');
  }
}
