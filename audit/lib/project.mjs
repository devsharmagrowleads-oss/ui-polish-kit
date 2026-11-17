// Project loading: config, file walk, per-file context, and the project-wide
// facts that file-level detectors need (e.g. "is there a global rule that
// restyles <select>?").

import fs from 'node:fs';
import path from 'node:path';
import { maskComments, lineStarts, locate, buildIgnore, matchesAny, embeddedRegions } from './util.mjs';
import { parseBlocks, declarations, isDarkScope, isThemeBlock } from './css.mjs';

export const DEFAULT_CONFIG = {
  include: [],
  exclude: [],
  tokenFiles: [],
  rules: {},
  minScore: 85,
  failOn: 'error',
  allowSystemFonts: false,
  darkMode: true,
  designDoc: null,
  surface: 'auto',
};

/** What kind of product the project is. Topics can apply to marketing sites, product apps, or both. */
export const PROJECT_SURFACES = ['auto', 'marketing', 'app', 'both'];

const CONFIG_NAMES = ['ui-polish.config.json', '.ui-polishrc.json', '.ui-polishrc'];

const SKIP_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'out', '.next', '.nuxt', '.svelte-kit', '.astro', '.output', '.vercel',
  '.turbo', '.cache', 'coverage', 'vendor', '.ui-polish', '.ui-polish-audit', '.cursor', '.windsurf', '.devin',
  '.claude', '.github', '.vscode', '.idea', '__tests__', '__mocks__', '__snapshots__', 'storybook-static',
]);

const EXT_KIND = {
  '.html': 'html', '.htm': 'html',
  '.css': 'css', '.scss': 'scss', '.less': 'scss', '.pcss': 'css',
  '.js': 'js', '.jsx': 'js', '.mjs': 'js', '.cjs': 'js', '.ts': 'js', '.tsx': 'js',
  '.vue': 'markup', '.svelte': 'markup', '.astro': 'markup',
};

const TOKEN_FILE = /(^|\/)((design-)?tokens?|themes?|variables|vars|colors?|colours?|palette|design-system)(\.[\w-]+)?\.(css|scss|less|pcss|ts|js|mjs|cjs|json)$|(^|\/)tailwind\.config\.\w+$|(^|\/)(theme|tokens)\/[^/]+$/i;
const TEST_FILE = /\.(test|spec|stories|story|d)\.[cm]?[jt]sx?$|\.min\.(js|css)$|(^|\/)(test|tests|e2e|cypress|playwright|fixtures?)\//i;

export function loadConfig(root, explicitPath) {
  let file = explicitPath ? path.resolve(explicitPath) : null;
  if (!file) {
    for (const name of CONFIG_NAMES) {
      const candidate = path.join(root, name);
      if (fs.existsSync(candidate)) { file = candidate; break; }
    }
  }
  if (!file) return { ...DEFAULT_CONFIG, configFile: null };
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    throw new Error(`Cannot read config ${file}: ${err.message}`);
  }
  const known = Object.keys(DEFAULT_CONFIG);
  const unknown = Object.keys(parsed).filter((k) => !known.includes(k) && k !== '$schema');
  if (unknown.length) throw new Error(`Unknown config key(s) in ${file}: ${unknown.join(', ')}. Known keys: ${known.join(', ')}`);
  const merged = { ...DEFAULT_CONFIG, ...parsed, configFile: file };
  if (!PROJECT_SURFACES.includes(merged.surface)) throw new Error(`Config "surface" in ${file} must be one of ${PROJECT_SURFACES.join(', ')} (got ${JSON.stringify(merged.surface)})`);
  return merged;
}

/** Every file under root (relative, forward slashes), skipping build and vendor folders. */
export function walk(root) {
  const all = [];
  const visit = (dir, rel) => {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) {
        if (!SKIP_DIRS.has(e.name)) visit(path.join(dir, e.name), r);
      } else if (e.isFile()) all.push(r);
    }
  };
  visit(root, '');
  return all.sort();
}

function loadFile(root, rel, config) {
  const ext = path.extname(rel).toLowerCase();
  const kind = EXT_KIND[ext];
  const abs = path.join(root, rel);
  const stat = fs.statSync(abs);
  if (stat.size > 1024 * 1024) return null;
  const raw = fs.readFileSync(abs, 'utf8');
  const { text, comments } = maskComments(raw, kind === 'markup' ? 'html' : kind);
  const starts = lineStarts(raw);
  const isStyle = kind === 'css' || kind === 'scss';
  // Markup-capable: can contain tags. Plain .ts never does.
  const hasMarkup = kind === 'html' || kind === 'markup' || (kind === 'js' && ext !== '.ts' && /<\/?[A-Za-z]/.test(text));

  const cssRegions = isStyle
    ? [{ start: 0, end: text.length }]
    : kind === 'html' || kind === 'markup' ? embeddedRegions(text, 'style') : [];
  const blocks = cssRegions.flatMap((r) => parseBlocks(text.slice(r.start, r.end), r.start));

  return {
    rel, abs, ext, kind, raw, text, starts, isStyle, hasMarkup, cssRegions, blocks,
    isHtmlDoc: (kind === 'html' || kind === 'markup') && /<html[\s>]/i.test(text),
    isTokenFile: TOKEN_FILE.test(rel) || matchesAny(rel, config.tokenFiles),
    ignored: buildIgnore(comments, starts),
    at: (pos) => locate(starts, pos),
  };
}

export function loadProject(root, config) {
  const allFiles = walk(root);
  const files = [];
  for (const rel of allFiles) {
    const ext = path.extname(rel).toLowerCase();
    if (!EXT_KIND[ext]) continue;
    if (TEST_FILE.test(rel)) continue;
    if (config.include.length && !matchesAny(rel, config.include)) continue;
    if (config.exclude.length && matchesAny(rel, config.exclude)) continue;
    const f = loadFile(root, rel, config);
    if (f) files.push(f);
  }
  return { root, config, allFiles, files, facts: collectFacts(root, allFiles, files, config) };
}

// ---------------------------------------------------------------------------

const SYSTEM_FAMILIES = new Set([
  'system-ui', '-apple-system', 'blinkmacsystemfont', 'segoe ui', 'roboto', 'helvetica', 'helvetica neue', 'arial',
  'sans-serif', 'serif', 'monospace', 'ui-sans-serif', 'ui-serif', 'ui-monospace', 'ui-rounded', 'times new roman',
  'times', 'georgia', 'courier new', 'courier', 'menlo', 'monaco', 'consolas', 'sfmono-regular', 'sf mono',
  'liberation mono', 'apple color emoji', 'segoe ui emoji', 'segoe ui symbol', 'noto color emoji', 'noto sans',
  'ubuntu', 'cantarell', 'oxygen', 'fira sans', 'droid sans', 'verdana', 'tahoma', 'inherit', 'initial', 'unset',
  'cursive', 'fantasy', 'emoji', 'math',
]);

export const ICON_LIBRARIES = [
  ['lucide', /^lucide(-react|-vue-next|-svelte|-static)?$|^@lucide\//],
  ['heroicons', /^@heroicons\/|^heroicons$/],
  ['phosphor', /^@phosphor-icons\/|^phosphor-react$/],
  ['tabler', /^@tabler\/icons/],
  ['radix-icons', /^@radix-ui\/react-icons$/],
  ['feather', /^react-feather$|^feather-icons$/],
  ['font-awesome', /^@fortawesome\/|^font-awesome$|^react-fontawesome$/],
  ['material-icons', /^@mui\/icons-material|^material-icons$|^@material-design-icons\//],
  ['iconify', /^@iconify\//],
  ['iconoir', /^iconoir(-react)?$/],
  ['remix-icon', /^@remixicon\/|^remixicon(-react)?$/],
  ['bootstrap-icons', /^bootstrap-icons$|^react-bootstrap-icons$/],
  ['ionicons', /^ionicons$|^@ionic\/react$/],
  ['ant-design-icons', /^@ant-design\/icons/],
  ['hugeicons', /^hugeicons-react$|^@hugeicons\//],
  ['simple-icons', /^simple-icons$|^@icons-pack\/react-simple-icons$/],
];
const ICON_CDN = [
  ['font-awesome', /font-?awesome|fontawesome/i],
  ['material-icons', /fonts\.googleapis\.com\/(icon|css2?\?family=Material\+(Icons|Symbols))/i],
  ['bootstrap-icons', /bootstrap-icons/i],
  ['remix-icon', /remixicon/i],
  ['ionicons', /ionicons/i],
  ['lucide', /unpkg\.com\/lucide|cdn\.jsdelivr\.net\/npm\/lucide/i],
  ['feather', /feather-icons/i],
  ['tabler', /tabler-icons|@tabler\/icons/i],
  ['phosphor', /phosphor-icons/i],
];

function firstFamily(value) {
  // `var(--font-loaded, "Fraunces"), serif` names its real family as the var() fallback.
  const fallback = /^var\(\s*--[\w-]+\s*,\s*([^)]+)\)/.exec(value.trim());
  const first = (fallback ? fallback[1] : value).split(',')[0].trim().replace(/^["']|["']$/g, '').trim();
  return /^var\(/.test(first) ? '' : first;
}

function collectFacts(root, allFiles, files, config) {
  const facts = {
    appearanceNoneClasses: new Set(),
    appearanceNoneElements: new Set(), // 'select', 'input', 'input:range' ...
    aspectRatioClasses: new Set(),
    tokenCount: 0,
    darkTokens: false,
    usesLightDark: false,
    colorScheme: false,
    focusVisible: false,
    reducedMotion: false,
    usesMotion: null,
    scrollbarStyled: false,
    scrollContainer: null,
    autofillStyled: false,
    firstInput: null,
    accentColor: false,
    sliderThumbStyled: false,
    fileButtonStyled: false,
    fonts: [], // { family, rel, pos, via }
    fontDeclared: false, // any font-family / font config present at all
    iconLibs: new Map(), // lib -> { rel, pos }
    reactIconsSets: new Map(),
    backdropBlur: [], // { rel, pos }
    htmlDocs: [],
    hasTailwindThemeConfig: false,
    designDoc: null,
    designDocText: '',
    localised: false, // translated or right-to-left: enables IN-01
    allFiles,
  };

  const note = (key, f, pos) => { if (!facts[key]) facts[key] = { rel: f.rel, pos }; };

  for (const f of files) {
    const t = f.text;
    if (f.isHtmlDoc) facts.htmlDocs.push(f);

    if (/:focus-visible|focus-visible:|:focus-within|focus-within:/.test(t)) facts.focusVisible = true;
    if (/prefers-reduced-motion|motion-reduce:|motion-safe:|useReducedMotion|MotionConfig/.test(t)) facts.reducedMotion = true;
    if (/scrollbar-width|scrollbar-color|::-webkit-scrollbar|\bscrollbar-(thin|none)\b|ScrollArea/.test(t)) facts.scrollbarStyled = true;
    if (/:-webkit-autofill|:autofill|\bautofill:/.test(t)) facts.autofillStyled = true;
    if (/accent-color\s*:|(?<![\w-])accent-(?!foreground)[a-z[(]/.test(t)) facts.accentColor = true;
    if (/::-webkit-slider-thumb|::-moz-range-thumb/.test(t)) facts.sliderThumbStyled = true;
    if (/::file-selector-button|\bfile:[a-z]/.test(t)) facts.fileButtonStyled = true;
    if (/color-scheme\s*:|\bscheme-(light|dark|normal)\b|colorScheme/.test(t)) facts.colorScheme = true;
    if (/light-dark\(/.test(t)) facts.usesLightDark = true;

    let m;
    if ((m = /\btransition(-[a-z-]+)?\s*:|\banimation(-name)?\s*:|\b(transition|animate)-[a-z[]|framer-motion|from ["']motion\/react["']|@keyframes/.exec(t))) note('usesMotion', f, m.index);
    if ((m = /overflow(-[xy])?\s*:\s*(auto|scroll)|\boverflow-(x-|y-)?(auto|scroll)\b/.exec(t))) note('scrollContainer', f, m.index);
    if ((m = /<(input|textarea)[\s/>]/.exec(t)) && f.hasMarkup) note('firstInput', f, m.index);

    const blur = /\bbackdrop-blur(-\w+)?\b|backdrop-filter\s*:\s*[^;]*blur\(/g;
    while ((m = blur.exec(t))) facts.backdropBlur.push({ rel: f.rel, pos: m.index });

    // --- CSS facts
    for (const b of f.blocks) {
      const decls = declarations(b);
      const custom = decls.filter((d) => d.prop.startsWith('--'));
      const tokenScope = /(^|[,\s])(:root|html|body|\.light|:host)(?![\w-])/.test(b.prelude) || isThemeBlock(b) || /@layer\s+(base|theme)/.test(b.parents.join(' '));
      if (custom.length && isDarkScope(b)) facts.darkTokens = true;
      else if (custom.length && (tokenScope || f.isTokenFile)) facts.tokenCount += custom.length;

      for (const d of decls) {
        if (/^(-webkit-|-moz-)?appearance$/.test(d.prop) && /^none\b/.test(d.value)) {
          for (const sel of b.prelude.split(',')) {
            for (const c of sel.match(/\.[\w-]+/g) || []) facts.appearanceNoneClasses.add(c.slice(1));
            const el = /(?:^|[\s>+~])(select|input|progress|meter)(?![\w-])(\[type=["']?(\w+)["']?\])?/.exec(sel.trim());
            const typeOnly = /\[type=["']?([\w-]+)["']?\]/.exec(sel);
            if (el && !/\./.test(sel)) facts.appearanceNoneElements.add(el[3] ? `input:${el[3]}` : el[1]);
            else if (typeOnly && !/\./.test(sel)) facts.appearanceNoneElements.add(`input:${typeOnly[1]}`);
          }
        }
        if (d.prop === 'aspect-ratio') {
          for (const c of b.prelude.match(/\.[\w-]+/g) || []) facts.aspectRatioClasses.add(c.slice(1));
        }
        if (d.prop === 'font-family' || /^--font(-family)?(-[\w-]+)?$/.test(d.prop) || d.prop === 'font') {
          facts.fontDeclared = true;
          if (/^inherit$/.test(d.value) || /^var\(\s*--[\w-]+\s*\)/.test(d.value)) continue;
          if (d.prop === 'font' && !/,|["']/.test(d.value)) continue;
          const fam = d.prop === 'font' ? firstFamily(d.value.replace(/^.*?\d[\w.%/]*\s+(?=["'A-Za-z])/, '')) : firstFamily(d.value);
          if (fam && !/^(@|\$|theme\()/.test(fam)) facts.fonts.push({ family: fam, rel: f.rel, pos: d.pos, via: 'css' });
        }
      }
      if (/^@font-face\b/.test(b.prelude)) {
        const fam = decls.find((d) => d.prop === 'font-family');
        if (fam) facts.fonts.push({ family: firstFamily(fam.value), rel: f.rel, pos: b.start, via: '@font-face', fontFace: true });
      }
    }

    // --- font loaders outside CSS
    const gf = /fonts\.(?:googleapis|bunny)\.(?:com|net)\/css2?\?([^"'\s)>]+)/g;
    while ((m = gf.exec(t))) {
      facts.fontDeclared = true;
      const famRe = /family=([^&:;"']+)/g;
      let fm;
      while ((fm = famRe.exec(m[1]))) {
        const family = decodeURIComponent(fm[1].replace(/\+/g, ' '));
        if (!/^Material (Icons|Symbols)/.test(family)) facts.fonts.push({ family, rel: f.rel, pos: m.index, via: 'google-fonts' });
      }
    }
    const nf = /import\s*\{([^}]+)\}\s*from\s*["']next\/font\/google["']/g;
    while ((m = nf.exec(t))) {
      facts.fontDeclared = true;
      for (const name of m[1].split(',').map((s) => s.trim().split(/\s+as\s+/)[0]).filter(Boolean)) {
        facts.fonts.push({ family: name.replace(/_/g, ' '), rel: f.rel, pos: m.index, via: 'next/font' });
      }
    }
    if ((m = /from\s*["'](next\/font\/local|geist\/font[\w/]*)["']/.exec(t))) {
      facts.fontDeclared = true;
      facts.fonts.push({ family: m[1].startsWith('geist') ? 'Geist' : '(local font)', rel: f.rel, pos: m.index, via: m[1] });
    }
    const fs2 = /["']@fontsource(?:-variable)?\/([\w-]+)/g;
    while ((m = fs2.exec(t))) {
      facts.fontDeclared = true;
      facts.fonts.push({ family: m[1].replace(/-/g, ' '), rel: f.rel, pos: m.index, via: '@fontsource' });
    }
    if (/use\.typekit\.net|fonts\.adobe\.com|fast\.fonts\.net|rsms\.me\/inter/.test(t)) {
      facts.fontDeclared = true;
      facts.fonts.push({ family: /rsms\.me\/inter/.test(t) ? 'Inter' : '(hosted brand font)', rel: f.rel, pos: 0, via: 'hosted' });
    }
    if (/(^|\/)tailwind\.config\.\w+$/.test(f.rel)) {
      if (/\b(colors|extend)\s*:/.test(t)) facts.hasTailwindThemeConfig = true;
      const ff = /fontFamily\s*:\s*\{([\s\S]*?)\}/.exec(t);
      if (ff) {
        facts.fontDeclared = true;
        const fam = /\[\s*["'`]([^"'`]+)["'`]/g;
        let x;
        while ((x = fam.exec(ff[1]))) if (!/^var\(/.test(x[1])) facts.fonts.push({ family: firstFamily(x[1]), rel: f.rel, pos: ff.index, via: 'tailwind.config' });
      }
    }

    // --- icon libraries
    if (f.kind === 'js' || f.kind === 'markup') {
      const imp = /(?:from\s*|import\s*\(?\s*|require\(\s*)["']([^"']+)["']/g;
      while ((m = imp.exec(t))) {
        const spec = m[1];
        const ri = /^react-icons\/(\w+)/.exec(spec);
        if (ri) {
          if (!facts.reactIconsSets.has(ri[1])) facts.reactIconsSets.set(ri[1], { rel: f.rel, pos: m.index });
          continue;
        }
        for (const [name, re] of ICON_LIBRARIES) {
          if (re.test(spec) && !facts.iconLibs.has(name)) facts.iconLibs.set(name, { rel: f.rel, pos: m.index });
        }
      }
    }
    if (f.kind === 'html' || f.kind === 'markup') {
      const link = /<(?:link|script)\b[^>]*(?:href|src)=["']([^"']+)["']/gi;
      while ((m = link.exec(t))) {
        for (const [name, re] of ICON_CDN) {
          if (re.test(m[1]) && !facts.iconLibs.has(name)) facts.iconLibs.set(name, { rel: f.rel, pos: m.index });
        }
      }
    }
  }

  for (const [set, where] of facts.reactIconsSets) facts.iconLibs.set(`react-icons/${set}`, where);

  // --- design doc
  const candidates = [config.designDoc, 'design.md', 'DESIGN.md', 'docs/design.md', 'docs/DESIGN.md', '.ui-polish/design.md', 'brand.md', 'BRAND.md', 'docs/brand.md'].filter(Boolean);
  for (const c of candidates) {
    const abs = path.join(root, c);
    if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
      facts.designDoc = c;
      try { facts.designDocText = fs.readFileSync(abs, 'utf8'); } catch { /* unreadable: treat as empty */ }
      break;
    }
  }

  facts.fonts = facts.fonts.filter((x) => x.family);
  facts.customFonts = facts.fonts.filter((x) => !SYSTEM_FAMILIES.has(x.family.toLowerCase()));
  // Localised: an i18n library, a locale folder, or right-to-left markup.
  const I18N_LIBS = /"(i18next|react-i18next|next-intl|next-i18next|react-intl|@formatjs\/[\w-]+|@lingui\/[\w-]+|vue-i18n|@nuxtjs\/i18n|svelte-i18n|@inlang\/[\w-]+|typesafe-i18n|rosetta|polyglot|node-polyglot)"\s*:/;
  try {
    const pkg = fs.readFileSync(path.join(root, 'package.json'), 'utf8');
    if (I18N_LIBS.test(pkg)) facts.localised = true;
  } catch {
    // no package.json
  }
  if (!facts.localised && allFiles.some((p) => /(^|\/)(locales?|i18n|translations|messages|lang)\/[\w@.-]+\.(json|ya?ml|po|ftl|properties)$/i.test(p))) facts.localised = true;
  if (!facts.localised && files.some((f) => f.hasMarkup && /\bdir\s*=\s*["']?rtl\b/.test(f.text))) facts.localised = true;
  facts.surface = resolveSurface(config, facts.designDocText, allFiles, files);
  return facts;
}

// ---------------------------------------------------------------------------
// Surface: marketing site, product app, or both
// ---------------------------------------------------------------------------

const MARKETING_PATHS = /(^|\/)(landing|pricing|features|about|blog|customers|testimonials|careers|press|home)(\/|\.|-|$)/i;
const APP_PATHS = /(^|\/)(dashboard|settings|admin|account|billing|workspace|onboarding|sign-?in|log-?in|sign-?up|projects|inbox|reports)(\/|\.|-|$)/i;
const ID_OR_CLASS = (word) => new RegExp(`\\b(?:id|class|className)\\s*=\\s*\\{?\\s*["'\`][^"'\`]*\\b${word}\\b`, 'i');
const MARKETING_MARKUP = [
  ['hero', ID_OR_CLASS('hero')],
  ['pricing', (t) => ID_OR_CLASS('pricing').test(t) || /<h[1-3][^>]*>\s*(Pricing|Plans)\b/i.test(t)],
  ['testimonials', ID_OR_CLASS('testimonials?')],
  ['faq', (t) => ID_OR_CLASS('faq').test(t) || /Frequently asked/i.test(t)],
  ['call to action', /\b(Get started|Start (your )?free trial|Book a demo|Request a demo|Sign up free)\b/],
];
const APP_MARKUP = [
  ['sidebar', (t) => /<(aside|Sidebar)[\s>]/.test(t) || ID_OR_CLASS('sidebar').test(t)],
  ['data table', /<(table|DataTable)[\s>]/],
  ['sign-in form', /type\s*=\s*["']password["']|auto[cC]omplete\s*=\s*["']current-password["']/],
  ['app shell', /\b(AppShell|DashboardLayout|app-shell)\b/],
];
const hit = (test, text) => (typeof test === 'function' ? test(text) : test.test(text));

/** Read "Surface: app" (or marketing / both) from design.md. */
export function surfaceFromDesignDoc(text) {
  const m = /^[\s>*|-]*\**surface\**\s*[:|]\s*\**\s*(marketing|app|both)\b/im.exec(text || '');
  return m ? m[1].toLowerCase() : null;
}

/** Guess the surface from file paths and markup. Returns { value, signals }; value is marketing, app, both or unknown. */
export function detectSurface(allFiles, files) {
  const marketing = new Set();
  const app = new Set();
  for (const p of allFiles) {
    if (/\.(md|json|lock|ya?ml|txt)$/i.test(p)) continue;
    const mm = MARKETING_PATHS.exec(p);
    if (mm) marketing.add(`${mm[2].toLowerCase()} page`);
    const am = APP_PATHS.exec(p);
    if (am) app.add(`${am[2].toLowerCase()} route`);
  }
  for (const f of files) {
    if (!f.hasMarkup) continue;
    for (const [name, test] of MARKETING_MARKUP) if (hit(test, f.text)) marketing.add(name);
    for (const [name, test] of APP_MARKUP) if (hit(test, f.text)) app.add(name);
  }
  const m = marketing.size >= 2;
  const a = app.size >= 2;
  const value = m && a ? 'both' : m ? 'marketing' : a ? 'app' : 'unknown';
  return { value, signals: { marketing: [...marketing], app: [...app] } };
}

function resolveSurface(config, designDocText, allFiles, files) {
  if (config.surface && config.surface !== 'auto') return { value: config.surface, source: 'config' };
  const fromDoc = surfaceFromDesignDoc(designDocText);
  if (fromDoc) return { value: fromDoc, source: 'design.md' };
  const detected = detectSurface(allFiles, files);
  return { value: detected.value, source: 'detected', signals: detected.signals };
}

/** Does a topic written for `topicSurface` (all, marketing or app) apply to a project whose surface is `projectSurface`? */
export function surfaceApplies(topicSurface, projectSurface) {
  if (!topicSurface || topicSurface === 'all') return true;
  if (projectSurface === 'both') return true;
  return topicSurface === projectSurface;
}

export { SYSTEM_FAMILIES };
