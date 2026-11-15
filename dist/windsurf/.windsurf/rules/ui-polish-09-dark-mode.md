---
trigger: model_decision
description: "Dark mode rules (ui-polish-kit). Defining colour tokens, adding a theme switch, or styling any surface, border, shadow, image or chart that must work on a dark background."
---

# Dark mode (DM)

This is the short form. Before writing code in this area, read the full rules with reasons, bad/good examples and checks: `.ui-polish/rules/09-dark-mode.md`.

- **DM-01 Dark values are defined for the tokens** (warning). The token file redefines every colour and shadow token under a dark scope: `.dark` and/or `[data-theme="dark"]` on `<html>`, optionally also `@media (prefers-color-scheme: dark)`. In Tailwind v4 add `@custom-variant dark (&:where(.dark, .dark *));`. Components use the semantic utilities only, so they need no change.
- **DM-02 No per-element `dark:` colour overrides** (info). Do not write `bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100` on elements. Write `bg-background text-foreground` once. The `dark:` variant is for the rare non-colour difference (swap an illustration, drop a shadow), not for restating the palette.
- **DM-03 Never invert** (error). Do not implement dark mode with `filter: invert()`, `mix-blend-mode: difference`, or by swapping black and white. Define the dark palette deliberately (DM-05).
- **DM-04 `color-scheme` is set** (info). Set `color-scheme: light` on `:root` and `color-scheme: dark` on the dark scope (or `color-scheme: light dark` when following the OS). Add `<meta name="color-scheme" content="light dark">` so the first paint matches.
- **DM-05 The dark palette is designed, not derived** (error). Background is a dark tinted neutral (lightness about 0.15 to 0.2 in OKLCH), never pure black; text is off-white (about 0.93 to 0.96), never pure white. Elevation is shown by lighter surfaces (page < card < popover), since shadows are barely visible on dark. Borders are slightly lighter than the surface they sit on. Brand and status colours are lighter and a little less saturated than in light mode so they hold 4.5:1 on dark surfaces; filled buttons may need dark text. Large tinted areas (alerts, badges) use the colour at 10 to 20% over the surface.
- **DM-06 Theme switching is correct** (warning). Default to the OS preference; offer Light / Dark / System where the product has settings; persist the choice. Apply the theme class before first paint (an inline script in `<head>`, or `next-themes` with `suppressHydrationWarning`) so there is no flash of the wrong theme. Update `<meta name="theme-color">` per theme. Provide dark variants of logos, illustrations and screenshots, or place them on a neutral surface; charts and code blocks use tokens too.
