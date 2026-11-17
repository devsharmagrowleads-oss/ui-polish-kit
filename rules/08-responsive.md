---
topic: responsive
prefix: RS
title: Responsive design
when: Building any page layout, navigation, table, grid or overlay; before declaring a page done on desktop; whenever fixed widths or heights are being set.
---

# Responsive design

More than half of web traffic is on phones, and an agent checks its work, if at all, in one desktop viewport. The result is desktop layouts squeezed until they overflow. Design the 375px layout first, as its own layout with its own decisions about what is shown, stacked or moved, then add columns as width allows. Verify at 320, 375, 768, 1024 and 1440px.

## RS-01 · The viewport meta tag is present
Severity: error · Check: static

**Rule.** Every HTML document includes `<meta name="viewport" content="width=device-width, initial-scale=1">`. Do not add `maximum-scale` or `user-scalable=no` (AX-05). Add `viewport-fit=cover` only when the layout handles safe-area insets.

**Why.** Without it a phone renders the page 980px wide and scales it down, so every media query is ignored and text is unreadably small.

**Bad.**
```html
<head><title>Dashboard</title></head>
```

**Good.**
```html
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Overdue invoices · Ledgerly</title>
</head>
```

**Check.** Static: HTML documents without a viewport meta. (Next.js adds it automatically.)

## RS-02 · No fixed widths wider than a phone
Severity: warning · Check: static

**Rule.** Do not set `width: 600px` or `w-[800px]` on layout elements. Use `width: 100%` with `max-width`, `min()` / `clamp()`, or grid tracks with `minmax(0, 1fr)`. Give flex and grid children `min-width: 0` so long content can shrink, and let long words and URLs wrap (`overflow-wrap: anywhere`).

**Why.** A fixed 600px box inside a 375px screen pushes the whole page sideways. One such element is enough to give the page a horizontal scrollbar.

**Bad.**
```css
.modal { width: 600px; }
```

**Good.**
```css
.modal { width: 100%; max-width: 37.5rem; }   /* or: width: min(100% - 2rem, 37.5rem) */
```

**Check.** Static: `width` of 480px or more without `max-width`; `w-[Npx]` of 480 or more without `max-w-*`.

## RS-03 · No horizontal scrolling at 320px
Severity: warning · Check: static

**Rule.** At 320px wide nothing extends past the viewport: no page-level horizontal scrollbar, no clipped content. Avoid `100vw` (it includes the scrollbar; use `100%`), negative margins that exceed the gutter, unwrapped flex rows, and long unbroken strings. Where horizontal scrolling is the intended pattern (a wide table, a carousel), it scrolls inside its own container with a visible affordance, not the page.

**Why.** Sideways page scroll on a phone hides content off-screen and makes vertical scrolling drift; it is the clearest sign nobody opened the page on a phone.

**Bad.**
```css
.hero { width: 100vw; margin-left: -2rem; }
.tags { display: flex; }                       /* never wraps */
```

**Good.**
```css
.hero { width: 100%; }
.tags { display: flex; flex-wrap: wrap; gap: var(--space-2); }
```

**Check.** Static: `100vw` / `w-screen`. Visual: at 320px run `document.documentElement.scrollWidth > innerWidth` in the console; it must be false on every page. `audit/screenshot.mjs` reports this.

## RS-04 · The mobile layout is designed, not shrunk
Severity: error · Check: visual

**Rule.** Write base styles for the narrow layout and add complexity upward with `min-width` breakpoints (`sm:`, `md:`, `lg:`). At 375px: one column; primary action reachable without scrolling a sidebar; headings scaled down (a 60px desktop hero is 32 to 36px); section padding reduced (96px becomes 48px); side-by-side media stacks with the text first; secondary columns move below or into a disclosure. Choose breakpoints where the content breaks, not by device names.

**Why.** Desktop-first CSS overridden downward leaves forgotten fixed sizes at every breakpoint; mobile-first has nothing to forget.

**Bad.**
```tsx
<div className="grid grid-cols-3 gap-8 p-16"><h1 className="text-6xl">…</h1></div>
```

**Good.**
```tsx
<div className="grid gap-6 p-4 sm:p-8 lg:grid-cols-3 lg:gap-8 lg:p-16"><h1 className="text-3xl lg:text-6xl">…</h1></div>
```

**Check.** Visual: screenshot every page at 375px. Read it top to bottom as a phone user: is the order sensible, is anything cramped, cut off or absurdly tall?

## RS-05 · Touch targets are at least 44px
Severity: error · Check: visual

**Rule.** Every tappable control has a hit area of at least 44×44px on touch layouts (24×24px is the WCAG 2.2 AA minimum and only acceptable for inline links and dense desktop tables), with at least 8px between adjacent targets. Small icons get padding or a pseudo-element to reach the size. Default control height is 40px on desktop and 44px on phones. Nothing depends on hover: menus open on tap, tooltips are never the only source of information.

**Why.** A 16px close icon or 28px-high pagination link is a missed tap for most thumbs.

**Bad.**
```tsx
<button onClick={close}><X className="size-4" /></button>
```

**Good.**
```tsx
<Button variant="ghost" size="icon" aria-label="Close dialog" onClick={close}><X /></Button>   {/* size-10; size-11 on touch */}
```

**Check.** Visual: at 375px, overlay a 44px square on each control in the screenshot, or use DevTools device mode and try tapping with the touch cursor.

## RS-06 · Tables have a small-screen form
Severity: error · Check: visual

**Rule.** Choose one per table: (a) wrap it in `overflow-x: auto` with the first column sticky and a visible scroll hint, for data that must stay tabular; (b) hide lower-priority columns below a breakpoint and expose them in a row detail; (c) restack each row as a card with label and value pairs, for five or fewer fields. Never let the table set the page width, and never shrink text below 12px to fit.

**Why.** A six-column table cannot fit 375px. Left alone it either overflows the page or wraps every cell into an unreadable column of single words.

**Bad.**
```tsx
<table className="w-full">…8 columns…</table>
```

**Good.**
```tsx
<div className="overflow-x-auto rounded-lg border" role="region" aria-label="Invoices" tabIndex={0}>
  <table className="w-full min-w-[640px] text-sm">…<th className="sticky left-0 bg-card">Invoice</th>…</table>
</div>
```

**Check.** Visual: every table at 375px. The page does not scroll sideways, and the key column stays readable. In a stacked or card form, sorting and filtering are still reachable (a sort menu above the list when the header row is hidden).

## RS-07 · Navigation has a small-screen form
Severity: error · Check: visual

**Rule.** Below the width where the full navigation fits, use a pattern suited to the product: a bottom tab bar for three to five top-level destinations in an app, or a menu button opening a sheet or drawer for sites with more links. The menu button is 44px, has `aria-expanded` and an accessible name; the drawer traps focus, closes on Escape, on backdrop tap and on navigation, and locks background scroll. A desktop sidebar becomes a drawer, not a 200px column squeezing the content.

**Why.** Navigation links that wrap onto three lines or run off-screen make the site unusable from the first second.

**Bad.**
```tsx
<nav className="flex gap-8">{links.map((l) => <a href={l.href}>{l.label}</a>)}</nav>   {/* 7 links, no breakpoint */}
```

**Good.**
```tsx
<nav className="hidden md:flex md:gap-6">{links.map(NavLink)}</nav>
<Sheet><SheetTrigger asChild><Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu"><Menu /></Button></SheetTrigger>
  <SheetContent side="left">{links.map(NavLink)}</SheetContent></Sheet>
```

**Check.** Visual: at 375px open and close the menu with touch and keyboard; follow a link and confirm the menu closes.

## RS-08 · Fluid media, viewport units and safe areas
Severity: warning · Check: visual

**Rule.** Images and video are `max-width: 100%; height: auto` with an aspect ratio reserved (FD-04) and `srcset`/`sizes` or the framework image component. Full-height layouts use `100dvh` (with a `100vh` fallback), never `100vh` alone. Fixed bars at the bottom pad with `env(safe-area-inset-bottom)`. Dialogs become full-width sheets on phones with `max-height: 100dvh` and internal scroll. Inputs are at least 16px font size on iOS to prevent zoom on focus.

**Why.** `100vh` on mobile Safari is taller than the visible area, hiding the bottom button under the browser toolbar; a 14px input zooms the page on focus.

**Bad.**
```css
.app { height: 100vh; }  .cta-bar { position: fixed; bottom: 0; }
```

**Good.**
```css
.app { min-height: 100vh; min-height: 100dvh; }
.cta-bar { position: fixed; inset-block-end: 0; padding-block-end: calc(var(--space-3) + env(safe-area-inset-bottom)); }
```

**Check.** Visual: iPhone-sized viewport with browser chrome visible; focus an input; open a dialog taller than the screen.

## RS-09 · Components respond to their container
Severity: warning · Check: visual

**Rule.** A component that appears in places of different widths (cards, tables, chart panels, forms in a sidebar and in a page) adapts to its own container with container queries: `container-type: inline-size` on the wrapper and `@container (width < 32rem)` rules for the narrow form. Keep `@media` queries for the page layout and for user preferences. Start from the narrow layout as the default so browsers without container queries still get a usable result.

**Why.** A card that switches layout at the viewport's 768px breakpoint still breaks when it is placed in a 320px sidebar on a wide screen. Container queries make the component correct wherever it is used, without one breakpoint per placement.

**Bad.**
```css
@media (min-width: 768px) { .stat-card { flex-direction: row; } } /* wrong in a narrow sidebar */
```

**Good.**
```css
.stat-card-wrap { container-type: inline-size; }
.stat-card { display: flex; flex-direction: column; gap: 0.75rem; }
@container (width >= 24rem) { .stat-card { flex-direction: row; align-items: center; } }
```

**Check.** Visual: place each reusable component in the narrowest and widest slots it is used in (sidebar, modal, full page); each looks designed for that width.
