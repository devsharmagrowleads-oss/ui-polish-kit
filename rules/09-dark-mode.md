---
topic: dark-mode
prefix: DM
title: Dark mode
when: Defining colour tokens, adding a theme switch, or styling any surface, border, shadow, image or chart that must work on a dark background.
---

# Dark mode

Dark mode is a second set of values for the same tokens. Components never know which theme is active: they ask for `--card` and get the right surface. Every approach that puts theme knowledge into components (`dark:` overrides on each element, inverted colours, a second stylesheet) leaves holes: the one dropdown that stays white, the chart with black gridlines on a black panel. If the product is deliberately light-only, say so in `design.md` and set `"darkMode": false` in `ui-polish.config.json`; otherwise both themes ship.

## DM-01 · Dark values are defined for the tokens
Severity: warning · Check: static

**Rule.** The token file redefines every colour and shadow token under a dark scope: `.dark` and/or `[data-theme="dark"]` on `<html>`, optionally also `@media (prefers-color-scheme: dark)`. In Tailwind v4 add `@custom-variant dark (&:where(.dark, .dark *));`. Components use the semantic utilities only, so they need no change.

**Why.** One block of overrides themes the entire product, including components written later and third-party ones that read the same variables.

**Bad.**
```css
:root { --background: #ffffff; --foreground: #111111; }   /* no dark scope anywhere */
```

**Good.**
```css
:root  { color-scheme: light; --background: oklch(0.99 0.003 195); --foreground: oklch(0.2 0.015 195); }
.dark  { color-scheme: dark;  --background: oklch(0.17 0.01 195);  --foreground: oklch(0.95 0.006 195); }
```

**Check.** Static: tokens exist but no dark scope redefines custom properties (and no `light-dark()`).

## DM-02 · No per-element `dark:` colour overrides
Severity: info · Check: static

**Rule.** Do not write `bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100` on elements. Write `bg-background text-foreground` once. The `dark:` variant is for the rare non-colour difference (swap an illustration, drop a shadow), not for restating the palette.

**Why.** Paired overrides double every class list and are forgotten on the next component, which then stays light. They also cannot express a third theme.

**Bad.**
```tsx
<div className="border-gray-200 bg-white text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100">
```

**Good.**
```tsx
<div className="border-border bg-card text-card-foreground">
```

**Check.** Static: `dark:` variants on palette colour utilities, reported once per file.

## DM-03 · Never invert
Severity: error · Check: static

**Rule.** Do not implement dark mode with `filter: invert()`, `mix-blend-mode: difference`, or by swapping black and white. Define the dark palette deliberately (DM-05).

**Why.** Inversion flips photographs, logos and status colours (green becomes magenta), turns shadows into glows and gives every brand colour the wrong hue.

**Bad.**
```css
html.dark { filter: invert(1) hue-rotate(180deg); }
```

**Good.**
```css
.dark { --background: oklch(0.17 0.01 195); --card: oklch(0.205 0.012 195); --primary: oklch(0.78 0.1 190); }
```

**Check.** Static: `filter: invert()` on `html`, `body`, `:root` or a dark scope.

## DM-04 · `color-scheme` is set
Severity: info · Check: static

**Rule.** Set `color-scheme: light` on `:root` and `color-scheme: dark` on the dark scope (or `color-scheme: light dark` when following the OS). Add `<meta name="color-scheme" content="light dark">` so the first paint matches.

**Why.** `color-scheme` tells the browser to draw its own parts dark: scrollbars, form control internals, autofill, the default canvas before CSS loads, and native select lists. Without it a dark page has a white scrollbar and white option lists.

**Bad.**
```css
.dark { --background: oklch(0.17 0.01 195); }
```

**Good.**
```css
.dark { color-scheme: dark; --background: oklch(0.17 0.01 195); }
```

**Check.** Static: dark tokens exist but `color-scheme` never appears. Visual: in dark mode look at the page scrollbar and any remaining native control.

## DM-05 · The dark palette is designed, not derived
Severity: error · Check: visual

**Rule.** Background is a dark tinted neutral (lightness about 0.15 to 0.2 in OKLCH), never pure black; text is off-white (about 0.93 to 0.96), never pure white. Elevation is shown by lighter surfaces (page < card < popover), since shadows are barely visible on dark. Borders are slightly lighter than the surface they sit on. Brand and status colours are lighter and a little less saturated than in light mode so they hold 4.5:1 on dark surfaces; filled buttons may need dark text. Large tinted areas (alerts, badges) use the colour at 10 to 20% over the surface.

**Why.** Pure white on pure black vibrates and smears for many readers; saturated brand blue that passed on white fails contrast on dark grey; light-mode shadows vanish, flattening every layer.

**Bad.**
```css
.dark { --background: #000; --foreground: #fff; --card: #000; --primary: #1d4ed8; }
```

**Good.**
```css
.dark { --background: oklch(0.17 0.01 195); --card: oklch(0.205 0.012 195); --popover: oklch(0.23 0.012 195);
        --foreground: oklch(0.95 0.006 195); --border: oklch(0.3 0.01 195);
        --primary: oklch(0.78 0.1 190); --primary-foreground: oklch(0.18 0.03 195); }
```

**Check.** Visual: screenshot every page in dark mode. Check layer separation (page, card, popover, dialog), contrast of muted text and of primary buttons, borders, charts, and any image with a white background.

## DM-06 · Theme switching is correct
Severity: warning · Check: visual

**Rule.** Default to the OS preference; offer Light / Dark / System where the product has settings; persist the choice. Apply the theme class before first paint (an inline script in `<head>`, or `next-themes` with `suppressHydrationWarning`) so there is no flash of the wrong theme. Update `<meta name="theme-color">` per theme. Provide dark variants of logos, illustrations and screenshots, or place them on a neutral surface; charts and code blocks use tokens too.

**Why.** A white flash on every load in dark mode is jarring at night; a black logo on a dark header disappears.

**Bad.**
```tsx
useEffect(() => { if (localStorage.theme === 'dark') document.documentElement.classList.add('dark'); }, []);   // runs after paint
```

**Good.**
```html
<script>
  (function () { var t = localStorage.getItem('theme'); var d = t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', d); })();
</script>
```

**Check.** Visual: set the OS to dark, hard-reload: no light flash. Toggle the theme: every element changes, including logos, images, charts and the browser toolbar colour on mobile.
