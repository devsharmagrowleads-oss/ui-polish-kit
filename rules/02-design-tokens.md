---
topic: design-tokens
prefix: TK
title: Design tokens
when: Starting a UI, creating the theme or global stylesheet, or about to type a colour, pixel value, radius, shadow, z-index or duration into a component.
---

# Design tokens first

A token is a named design decision: `--primary`, `--radius`, `--shadow-md`, `--duration-fast`. When every component reads the same names, the interface is consistent by construction and a rebrand or dark mode is an edit to one file. When values are typed into components, each one drifts: one card has a 12px radius and another 10px, one border is `#e5e7eb` and another `#e2e8f0`, and nobody can say which is right. Define the tokens first, then build. Starter file: `recipes/react-tailwind-shadcn/tokens/tokens.css`.

## TK-01 · No hard-coded colours outside the token file
Severity: error · Check: static

**Rule.** Component code and stylesheets never contain hex, `rgb()`, `hsl()` or `oklch()` literals. Colours are written once, as custom properties in the token file, and used everywhere else through `var(--token)` or a semantic utility (`bg-primary`, `text-muted-foreground`). Opacity variants derive from tokens (`bg-primary/10`, `color-mix()`), not from new literals.

**Why.** A literal cannot change with the theme. Every `#ffffff` background is a white rectangle in dark mode, and every near-duplicate grey is a place the palette forked.

**Bad.**
```tsx
<div style={{ background: '#ffffff', border: '1px solid #e5e7eb' }} className="text-[#111827]">
```

**Good.**
```tsx
<div className="border border-border bg-card text-card-foreground">
```

**Check.** Static: colour literals in CSS declarations, style attributes, string literals in component code, and Tailwind arbitrary colours. Exempt: custom property declarations, `@theme` blocks, token files, inline SVG artwork, `.svg` files (favicons, logos), `theme-color` meta and web app manifests.

## TK-02 · No Tailwind arbitrary values for spacing, type, radius or z-index
Severity: warning · Check: static

**Rule.** Do not write `p-[13px]`, `gap-[18px]`, `text-[15px]`, `leading-[1.35]`, `rounded-[10px]` or `z-[999]`. Use the scale step (`p-3`, `text-sm`, `rounded-md`, `z-(--z-modal)`). If the design needs a value the scale lacks, add a token and use it by name. Arbitrary values that reference a variable (`w-(--sidebar-width)`, `h-[calc(100dvh-var(--header-height))]`) are fine.

**Why.** Each bracketed number is a one-off decision that the next component will not repeat exactly. Ten components later the page has seven slightly different paddings and looks uneven without anyone being able to point at why.

**Bad.**
```tsx
<button className="rounded-[10px] px-[18px] py-[9px] text-[15px]">Save</button>
```

**Good.**
```tsx
<button className="h-10 rounded-md px-4 text-sm font-medium">Save changes</button>
```

**Check.** Static: bracketed px/rem/em/number values on padding, margin, gap, space, text, leading, tracking, rounded and z utilities.

## TK-03 · Semantic colour utilities, not the raw palette
Severity: warning · Check: static

**Rule.** Do not style with Tailwind's default palette (`bg-blue-600`, `text-gray-500`, `border-slate-200`). Use role-based utilities backed by tokens: `bg-background`, `bg-card`, `bg-primary`, `text-foreground`, `text-muted-foreground`, `border-border`, `ring-ring`, `bg-destructive`, `text-success`.

**Why.** `bg-blue-600` says what the colour is, not what it is for, so it cannot follow the brand or the theme. It also guarantees the stock Tailwind look, because every agent reaches for the same `blue-600` / `gray-900` / `gray-500` set.

**Bad.**
```tsx
<p className="text-gray-500">Last synced 4 minutes ago</p>
<button className="bg-blue-600 text-white hover:bg-blue-700">Sync now</button>
```

**Good.**
```tsx
<p className="text-muted-foreground">Last synced 4 minutes ago</p>
<Button>Sync now</Button>
```

**Check.** Static: default-palette utilities (`<property>-<hue>-<shade>`), reported once per file with a count.

## TK-04 · Spacing values are on the 4px scale
Severity: warning · Check: static

**Rule.** In CSS, padding, margin and gap use the spacing scale: 0, 1px, 2px, then multiples of 4px (4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96), with 6, 10 and 14 allowed for dense controls. Prefer the token (`calc(var(--spacing) * 4)` or `var(--space-4)`) over the literal.

**Why.** Values such as 13px, 18px or 22px come from nudging until one screenshot looked right. They break vertical rhythm as soon as the element sits next to one built on the scale.

**Bad.**
```css
.card { padding: 18px 22px; margin-bottom: 13px; }
```

**Good.**
```css
.card { padding: var(--space-5) var(--space-6); margin-block-end: var(--space-4); }
```

**Check.** Static: px values in padding/margin/gap declarations that are not on the scale.

## TK-05 · A token file exists and is complete
Severity: error · Check: static

**Rule.** Before the first component, create one token file that defines, for light and dark: surface and text colours by role, primary, secondary, muted, accent, destructive, success, warning, info (each with a `-foreground`), border, input, ring; a radius base; four elevation shadows; font families; a z-index scale; motion durations and easings; section spacing and container widths. Copy `recipes/react-tailwind-shadcn/tokens/tokens.css` and replace the values marked EXAMPLE with the ones in `design.md`.

**Why.** If the token does not exist when a component needs it, the agent types a literal "for now", and that literal ships.

**Bad.**
```css
/* globals.css */
body { font-family: sans-serif; }
```

**Good.**
```css
:root { --background: oklch(0.99 0.003 195); --foreground: oklch(0.2 0.015 195); --primary: oklch(0.43 0.085 195);
  --radius: 0.5rem; --z-modal: 40; --duration-fast: 120ms; /* … full set … */ }
.dark { --background: oklch(0.17 0.01 195); --foreground: oklch(0.95 0.006 195); /* … */ }
```

**Check.** Static: fewer than five custom properties on `:root` / `@theme` and no Tailwind theme config. Manual: every category in the list above is present.

## TK-06 · z-index comes from a scale
Severity: warning · Check: static

**Rule.** Never write `z-index: 9999` or any three-digit literal. Use the scale: `--z-sticky` 10, `--z-dropdown` 20, `--z-overlay` 30, `--z-modal` 40, `--z-popover` 50, `--z-toast` 60, `--z-tooltip` 70. Inside a component, small local values (1, 2) with `isolation: isolate` on the parent are fine.

**Why.** Magic z-index values start an arms race: the dropdown is 999, so the modal becomes 9999, then the toast 99999, and the tooltip inside the modal still renders underneath it.

**Bad.**
```css
.modal { z-index: 9999; }
.dropdown { z-index: 99999; }
```

**Good.**
```css
.modal { z-index: var(--z-modal); }
.dropdown { z-index: var(--z-popover); }
```

**Check.** Static: `z-index` literals of 100 or more outside the token file; `z-[N]` utilities (TK-02). Visual: open a select inside a dialog, then trigger a toast.

## TK-07 · Name tokens by role, in two layers
Severity: warning · Check: visual

**Rule.** Keep two layers. Primitive values (a neutral ramp, a brand ramp) may exist, but components only use semantic tokens named for their job: `--background`, `--card`, `--muted-foreground`, `--border`, `--destructive`. Never name a token after its value (`--blue`, `--gray-light`, `--shadow-big-purple`), and pair every surface token with the text colour that goes on it (`--primary` / `--primary-foreground`).

**Why.** Role names survive a rebrand and a theme switch; value names become lies (`--blue` that is green). Pairing surfaces with foregrounds makes contrast a property of the token set rather than of each component.

**Bad.**
```css
:root { --blue: #2563eb; --light-gray: #f3f4f6; --dark-text: #111827; }
```

**Good.**
```css
:root { --primary: oklch(0.43 0.085 195); --primary-foreground: oklch(0.985 0.005 195);
        --muted: oklch(0.965 0.006 195); --muted-foreground: oklch(0.47 0.015 195); }
```

**Check.** Read the token file: no value-based names in the layer components use; every surface has a matching foreground.

## TK-08 · Reuse the token; do not mint near-duplicates
Severity: warning · Check: visual

**Rule.** Before adding a token, look for one that already carries the meaning. The set stays small: about 4 radii, 4 shadows, 3 durations, 2 easings, 8 font sizes. A new token needs a new role, not a slightly different number.

**Why.** `--radius-card: 10px` next to `--radius-lg: 12px` re-creates the drift tokens were meant to remove, with extra indirection.

**Bad.**
```css
:root { --radius-card: 10px; --radius-panel: 11px; --radius-modal: 12px; --radius-popover: 9px; }
```

**Good.**
```css
:root { --radius: 0.5rem; }
/* sm = base - 4px, md = base - 2px, lg = base, xl = base + 4px; cards, panels and dialogs all use lg */
```

**Check.** Count distinct values per category in the token file; question any two within 2px or a few percent of each other.
