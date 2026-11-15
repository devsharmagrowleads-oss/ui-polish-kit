---
topic: typography
prefix: TY
title: Typography
when: Choosing or loading fonts, setting up the type scale, styling headings or body text, or laying out numbers and tables.
---

# Typography

Type is most of what a user looks at, and it is where agent-built interfaces look most alike: Inter (or the scaffold's Geist) at Tailwind's default sizes, every time. A product's typeface is a brand decision. Take it from the brand guideline; when there is none, choose a pairing for this product on purpose and write the choice down.

## TY-01 · A real typeface is configured
Severity: error · Check: static

**Rule.** The project loads a specific typeface for body text (and optionally a second for headings) and exposes it as `--font-sans` / `--font-display` / `--font-mono` tokens. Do not leave the browser default, and do not ship a bare system stack unless `design.md` says the system font is the brand choice (then set `"allowSystemFonts": true` in `ui-polish.config.json`).

**Why.** With no font configured the page renders in Times New Roman or Arial. A system stack renders differently on every OS (San Francisco, Segoe UI, Roboto), so spacing and line breaks tuned on one machine are wrong on the others.

**Bad.**
```css
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
```

**Good.**
```tsx
// app/layout.tsx
import { Instrument_Sans, Fraunces } from 'next/font/google';
const body = Instrument_Sans({ subsets: ['latin'], variable: '--font-body-loaded', display: 'swap' });
const display = Fraunces({ subsets: ['latin'], variable: '--font-display-loaded', display: 'swap' });
```

**Check.** Static: no `@font-face`, font link, `next/font`, `@fontsource` import or non-system `font-family` anywhere in the project.

## TY-02 · The font is chosen for this product, not by habit
Severity: warning · Check: static

**Rule.** Use the fonts named in `design.md`. If the brand has none, pick a pairing from the table below that matches the product's personality, and record it in `design.md` with one sentence of reasoning. Inter, Roboto, Poppins, Open Sans, Montserrat, Lato, Space Grotesk and Geist are allowed only when `design.md` names them as the brand's decision.

**Why.** Those eight fonts are what every agent and every template defaults to. Using them without a reason is the typographic equivalent of the purple gradient: readers recognise the template before they read a word.

**Bad.**
```tsx
import { Inter } from 'next/font/google';   // no design.md, no reason: the default
```

**Good.**
```md
<!-- design.md -->
## Typography
- Body and UI: IBM Plex Sans. Headings: IBM Plex Serif. Data: IBM Plex Mono.
- Why: an accounting tool for finance teams; Plex reads as precise and has true tabular figures.
```

**Check.** Static: every loaded typeface is on the default-prone list and `design.md` does not mention it. Manual: the chosen fonts appear in `design.md` with a reason.

### Pairings by product personality

All are on Google Fonts. Use at most two families plus an optional mono. Check that the family has the weights you need (400, 500, 600 or 700) and tabular figures if the product shows numbers.

| Personality / product | Headings | Body and UI | Mono / data |
| --- | --- | --- | --- |
| Precise B2B, finance, analytics | IBM Plex Sans (600) | IBM Plex Sans | IBM Plex Mono |
| Developer tools, infrastructure | Schibsted Grotesk | Source Sans 3 | JetBrains Mono |
| Calm productivity, notes, docs | Newsreader | Figtree | JetBrains Mono |
| Editorial, publishing, long-form | Fraunces | Source Serif 4 | IBM Plex Mono |
| Warm consumer, wellness, food | Bricolage Grotesque | Nunito Sans | Spline Sans Mono |
| Confident marketing site, agency | Bricolage Grotesque or Archivo (expanded) | Instrument Sans | DM Mono |
| Premium, fashion, hospitality | Cormorant Garamond or Playfair Display | Jost or Mulish | (none) |
| Friendly SaaS, onboarding-heavy | Plus Jakarta Sans | Plus Jakarta Sans | JetBrains Mono |
| Health, public sector, education | Atkinson Hyperlegible Next | Atkinson Hyperlegible Next | Atkinson Hyperlegible Mono |
| Technical, scientific, data-dense | Manrope | Public Sans | Red Hat Mono |
| Playful, kids, games, community | Baloo 2 or Fredoka | Nunito | (none) |
| Commerce, marketplace | Outfit | DM Sans | DM Mono |
| Legal, institutional, heritage | Libre Caslon Text | Libre Franklin | (none) |
| Modern geometric, fintech, crypto | Sora or Unbounded (display only) | Albert Sans | Martian Mono |

Rules for pairing: contrast in structure (serif + sans, or expanded + normal), similarity in proportion (x-height). If unsure, use one family in two weights; a single good family beats a mismatched pair.

## TY-03 · Fonts load without invisible text or layout shift
Severity: warning · Check: static

**Rule.** Load fonts with `next/font`, or self-host WOFF2 with `font-display: swap`, or a Google Fonts `<link>` with `&display=swap` plus `<link rel="preconnect">`. Request only the weights used (normally 400, 500, 600 or 700; variable fonts where available). Give the fallback stack a metric-compatible fallback so the swap does not reflow the page.

**Why.** Without `swap`, text is invisible for up to three seconds on slow connections. Loading all nine weights of two families can add over 500 KB before the first paint.

**Bad.**
```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@100;200;300;400;500;600;700;800;900" rel="stylesheet">
```

**Good.**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet">
```

**Check.** Static: font URL without `display=swap`; `@font-face` without `font-display`. Visual: throttle to Slow 3G and reload; text is readable immediately.

## TY-04 · One `<h1>`, no skipped heading levels
Severity: warning · Check: static

**Rule.** Each page has exactly one `<h1>` naming the page. Sections use `<h2>`, subsections `<h3>`, in order, without skipping. Choose the level for document structure and the size with a class; a small heading is still an `<h2>` if it starts a section.

**Why.** Screen-reader users navigate by heading level; a page with four `<h1>` elements or an `<h2>` followed by an `<h5>` has no usable outline. Search engines read the same outline.

**Bad.**
```html
<h1>Acme</h1> <h1>Pricing</h1> <h4>Starter</h4>
```

**Good.**
```html
<h1>Pricing</h1>
<h2 class="text-lg">Starter</h2>
```

**Check.** Static: more than one `<h1>` in a file; level jumps in HTML documents. Manual: list the headings of each page and read them as an outline.

## TY-05 · A real type scale with few sizes
Severity: warning · Check: visual

**Rule.** Use one scale and at most about eight sizes across the product. A workable app scale: 12, 14, 16, 18, 20, 24, 30, 36px (`text-xs` to `text-4xl`); marketing pages may add 48 and 60. Body text is 16px (14px only in dense tables and secondary UI, never below 12px). Each step up the hierarchy changes size by a visible ratio (1.2 or more) or changes weight; never both size and weight and colour for one small step.

**Why.** Sizes such as 15px, 17px and 19px side by side look like mistakes because the difference is too small to read as hierarchy and too large to read as the same.

**Bad.**
```tsx
<h2 className="text-[22px]">Billing</h2> <p className="text-[15px]">…</p> <span className="text-[13px]">…</span>
```

**Good.**
```tsx
<h2 className="text-2xl font-semibold tracking-tight">Billing</h2>
<p className="text-base text-muted-foreground">…</p> <span className="text-sm">…</span>
```

**Check.** Visual: list every distinct font size on a page (DevTools computed styles or a screenshot); there should be no more than five or six on one screen, all from the scale.

## TY-06 · Line height and line length are set for reading
Severity: warning · Check: visual

**Rule.** Body text has line-height 1.5 to 1.7; headings 1.1 to 1.25 (tighter as size grows); UI labels and buttons 1.2 to 1.4. Paragraphs are 45 to 75 characters wide: constrain text blocks with `max-w-prose` (65ch), never let paragraphs span a 1200px container. Use `text-wrap: balance` on headings and `text-wrap: pretty` on paragraphs.

**Why.** A 140-character line makes the eye lose its place on the return sweep. Headings at body line-height look double-spaced; body text at heading line-height is a grey block.

**Bad.**
```tsx
<p className="text-lg leading-tight">{longDescription}</p>   {/* full container width */}
```

**Good.**
```tsx
<p className="max-w-prose text-lg leading-relaxed text-pretty">{longDescription}</p>
```

**Check.** Visual at 1440px: count characters in the longest paragraph line; check headings that wrap to two lines.

## TY-07 · Numbers are tabular and formatted
Severity: warning · Check: visual

**Rule.** Anywhere digits line up or change (tables, prices, stats, timers, counters, pagination) use `font-variant-numeric: tabular-nums`. Right-align numeric columns. Format with `Intl.NumberFormat` and `Intl.DateTimeFormat` (thousands separators, currency, units, locale dates), never by string concatenation.

**Why.** Proportional digits make a column of prices ragged and make a ticking counter jitter sideways. Unformatted `1234567.5` and `2026-03-09T14:22:00Z` read as debug output.

**Bad.**
```tsx
<td>{'$' + invoice.total}</td> <td>{invoice.createdAt}</td>
```

**Good.**
```tsx
<td className="text-right tabular-nums">{currency.format(invoice.total)}</td>
<td className="tabular-nums">{dateFmt.format(new Date(invoice.createdAt))}</td>
```

**Check.** Visual: look at every table and stat; digits align in columns, values have separators and units.

## TY-08 · Weight, tracking and case are used sparingly
Severity: info · Check: visual

**Rule.** Use two or three weights (400 body, 500 or 600 for emphasis and UI, 600 or 700 for headings). Tighten letter-spacing slightly on large headings (-0.01 to -0.03em); add 0.04 to 0.08em only on small all-caps labels. All caps is for labels of one to three words, never sentences. Do not use light (300) weights below 20px or grey text lighter than `--muted-foreground` for content.

**Why.** Six weights and wide-tracked uppercase paragraphs are noise. Thin light-grey text is the commonest contrast failure.

**Bad.**
```tsx
<p className="text-sm font-light uppercase tracking-widest text-gray-400">Manage your team members and their permissions</p>
```

**Good.**
```tsx
<p className="text-sm text-muted-foreground">Manage your team members and their permissions.</p>
```

**Check.** Visual: count weights on a page; find any uppercase text longer than three words; check small grey text against AX-09.
