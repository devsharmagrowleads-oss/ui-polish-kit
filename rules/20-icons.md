---
topic: icons
prefix: IC
title: Icons
when: Adding, choosing or sizing an icon; building icon buttons, navigation items, badges, empty states or status messages with icons; importing an icon library or inline SVG.
---

# Icons

Icons are small, so their mistakes are easy to miss and add up fast: three libraries mixed together, icons of four sizes next to the same text, sparkles and rockets as decoration, and icon-only buttons nobody can name. This topic gathers the icon rules in one place. Two live in other topics because they are about AI-slop habits: SL-03 (no emoji as icons) and SL-04 (one icon set). Naming icon-only controls is AX-07; tooltips are NC-08; touch size is RS-05.

## IC-01 · Icon size follows the text beside it
Severity: warning · Check: visual

**Rule.** Use three sizes, defined as tokens or size classes: 16px next to 12–14px text (tables, badges, dense menus), 20px next to 16px body text (buttons, navigation, form fields), 24px for standalone icons. Empty-state and feature icons may go to 32–48px inside a tinted circle, and nowhere else. Stroke width is the set's default (1.5 or 2) everywhere; do not mix.

**Why.** An 18px icon in one button and a 22px icon in the next reads as carelessness even when nobody can say why. Icons sized to the text sit at the same visual weight as the words they label.

**Bad.**
```tsx
<Button><Plus size={18} /> Add</Button> <Button><Upload className="h-[22px]" /> Import</Button>
```

**Good.**
```tsx
<Button><Plus className="size-5" aria-hidden /> Add member</Button> <Button variant="outline"><Upload className="size-5" aria-hidden /> Import CSV</Button>
```

**Check.** Visual: compare every icon button and nav item on one screen; icons next to the same text size are the same size.

## IC-02 · One style, and fill means "on"
Severity: warning · Check: visual

**Rule.** Use the outline style of the one icon set (SL-04) throughout. A filled variant marks a selected or active state only (the current nav item, a starred item, an enabled toggle), so fill always means "on". Do not mix outline and solid icons for unrelated reasons, and do not use multi-colour icons inside the interface.

**Why.** When some icons are solid because that variant looked nicer, users cannot tell which items are active. A consistent stroke is what makes a set look like one product.

**Bad.**
```tsx
import { HomeIcon } from '@heroicons/react/24/solid'; import { InboxIcon } from '@heroicons/react/24/outline';
```

**Good.**
```tsx
<Star className="size-4" aria-hidden fill={starred ? 'currentColor' : 'none'} />
```

**Check.** Visual: look at the navigation and toolbar; only the current or active items are filled.

## IC-03 · Decorative icons are hidden; meaningful ones have text
Severity: warning · Check: static

**Rule.** An icon next to a text label is decorative: `aria-hidden="true"` (and `focusable="false"` on inline SVG). An icon that carries meaning on its own (a status icon in a table, a warning sign) has a text alternative: visible text, or `role="img"` with `aria-label`, or a `<title>` inside the SVG. Icons take their colour from `currentColor` and tokens, never a hard-coded fill, and meet 3:1 contrast with their background.

**Why.** An unhidden SVG is read out as "graphic" or as its path data next to the label it duplicates; a lone status icon without text says nothing to a screen reader. Hard-coded fills break in dark mode and in Windows high-contrast mode (AX-13).

**Bad.**
```html
<button><svg viewBox="0 0 24 24"><path fill="#111827" d="…"/></svg> Delete</button>
```

**Good.**
```html
<button><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="…"/></svg> Delete</button>
<span role="img" aria-label="Overdue"><svg aria-hidden="true">…</svg></span>
```

**Check.** Static: inline `<svg>` in markup with neither `aria-hidden` nor `role="img"`, `aria-label`, `aria-labelledby` or `<title>`. Visual: inspect the accessibility tree.

## IC-04 · Icon plus label by default
Severity: warning · Check: visual

**Rule.** Buttons and navigation items show an icon and a text label. Icon-only is allowed only for actions whose icon is universally known (close ×, search, menu, more ⋯, previous/next, play/pause), in tight toolbars or repeated rows, and then needs `aria-label` (AX-07), a tooltip on hover and focus (NC-08) and a 44px touch target (RS-05). Never use an icon to mean two things in one product, or two icons for the same action.

**Why.** Apart from a handful of conventions, icons are ambiguous: is a box "archive", "package" or "storage"? Labels cost a few pixels and remove the guess. Reusing the trash icon for "remove from list" teaches users that it might delete.

**Bad.**
```tsx
<Button size="icon"><Box /></Button> <Button size="icon"><Sparkles /></Button>
```

**Good.**
```tsx
<Button variant="outline"><Archive className="size-5" aria-hidden /> Archive</Button>
<Button variant="ghost" size="icon" aria-label="Close dialog"><X className="size-5" aria-hidden /></Button>
```

**Check.** Visual: for each icon-only control, a new user would name the action correctly without hovering.

## IC-05 · Icons align with their text
Severity: info · Check: visual

**Rule.** Put the icon and its label in an inline flex row with `align-items: center`, a gap of 6–8px (a spacing token), and `flex-shrink: 0` on the icon so long labels never squash it. Next to multi-line text, align the icon with the first line, not the middle of the block. Leading icons go before the label; trailing icons only for direction (chevron, external link), and directional icons mirror in right-to-left layouts (IN-03).

**Why.** Icons sit on the baseline by default and look low; a shrinking icon in a long button is a common bug; an icon centred on a three-line message floats away from the sentence it belongs to.

**Bad.**
```tsx
<p><AlertCircle /> Your card was declined. Try another card or contact your bank.</p>
```

**Good.**
```tsx
<p className="flex items-start gap-2"><AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />Your card was declined. Try another card or contact your bank.</p>
```

**Check.** Visual: zoom to 200% on buttons, alerts and menus; icons stay centred on their first line of text and keep their size.

## IC-06 · Icons are delivered efficiently
Severity: info · Check: visual

**Rule.** Import icons individually (`import { Search } from 'lucide-react'`), never a whole library or an icon font. Repeated inline SVG icons on a plain HTML page use one hidden sprite with `<symbol>` and `<use href="#id">`; CSS-driven icons use a mask with `currentColor`. Do not recolour `<img>` icons with filters. Brand and product logos come from one source as SVG.

**Why.** Icon fonts render as empty boxes when the font fails, are read as letters by screen readers and cannot be multi-coloured; importing a whole library can add hundreds of kilobytes.

**Bad.**
```html
<link rel="stylesheet" href="https://cdn.example.com/font-awesome.css"> <i class="fa fa-user"></i>
```

**Good.**
```html
<svg class="icon" aria-hidden="true"><use href="#i-user"/></svg>
```

**Check.** Visual: check the bundle report and network panel for icon fonts or full icon libraries.
