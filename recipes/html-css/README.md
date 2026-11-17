# Plain HTML and CSS recipes

The same rules as the React recipes, for projects without React or Tailwind: static sites, server-rendered pages (Rails, Django, Laravel, Go templates), Astro, Vue, Svelte, web components, or a prototype. They use the browser's own components (`<dialog>`, popover, customizable `<select>`, `:user-invalid`, container queries, view transitions), styled with tokens, with a small script only where a browser still lacks a feature.

Each `.html` file is a fragment: copy its markup and script into a page that loads the three stylesheets.

```html
<link rel="stylesheet" href="/css/tokens.css">
<link rel="stylesheet" href="/css/base.css">
<link rel="stylesheet" href="/css/components.css">
<!-- Only on pages that use them: -->
<link rel="stylesheet" href="/css/sections.css"> <!-- marketing-sections.html -->
<link rel="stylesheet" href="/css/app.css">      <!-- app-shell.html -->
```

Replace every value marked `EXAMPLE` in `tokens.css` with the colours and fonts in the project's `design.md`; keep the token names. The names and values match `../react-tailwind-shadcn/tokens/tokens.css`.

## Files

| File | What it is | Rules |
| --- | --- | --- |
| `tokens.css` | Colour (light and dark), chart colours, type, the 4px spacing scale, sizes, radius, shadows, z-index, motion | TK, CO, DM |
| `base.css` | Focus ring, selection, autofill, scrollbars, `accent-color`, skip link, icon sizes, page transitions, reduced motion, forced colours, and the theme script | AX, MO, NC-09, NC-10 |
| `components.css` | Styles for every fragment below, using logical properties so right-to-left works | all |
| `dialog.html` | Confirmation dialog replacing `confirm()`: native modal `<dialog>`, light dismiss, safe action focused | NC-07, FD-08 |
| `select.html` | Native `<select>` styled fully where customizable select exists, and with tokens elsewhere | NC-01, NC-11 |
| `field.html` | Label, hint, input, and an error shown only after interaction, kept in step with `aria-invalid` | FM |
| `data-table.html` | Sortable, sticky, accessible table that becomes cards in a narrow container | DT, RS-06, RS-09 |
| `menu.html` | Action menu: popover anchored to its button, arrow keys, focus handling | NC-13 |
| `tooltip.html` | Tooltip replacing `title=""`: `popover="hint"` with `interestfor` | NC-08, AX-07 |
| `toast.html` | Toast region replacing `alert()`: manual popovers, announced | FD-07, ST-05 |
| `navigation.html` | Skip link, header navigation with the current page marked, breadcrumbs, page header | NV, RS-07 |
| `sections.css` | Styles for `marketing-sections.html` | LP, SL |
| `marketing-sections.html` | **Marketing sites only.** A landing page in reading order: plain-words hero with the product screenshot as the LCP image, attributed proof, alternating feature rows (not three identical cards), three-plan pricing with one recommended and a monthly/yearly toggle, an FAQ of `<details>`, a closing call to action and a footer with privacy, terms and contact | LP-01 to LP-07, SL-07, SL-08, UX-05, AS-05 |
| `app.css` | Styles for `app-shell.html` | NV, AC, VH |
| `app-shell.html` | **Product apps only.** A grouped sidebar that becomes a modal drawer on narrow screens, a top bar with a Ctrl/Cmd+K command palette (combobox and grouped listbox, arrow keys, empty state), one page header, KPI tiles with values louder than labels, the first-run state for a new workspace, a dismissible setup checklist with progress, and two-column settings sections | NV-01, NV-03, NV-07, RS-07, UX-02, UX-05, UX-09, VH-04, AC-01, AC-03, FM-09 |

## Browser support

The fragments follow [Modern Web Guidance](https://github.com/GoogleChrome/modern-web-guidance): features that are not yet available everywhere are used as progressive enhancements, with a fallback in the fragment's script or CSS:

- Customizable `<select>`: other browsers get the token-styled control and the system list.
- Anchor positioning: a few lines of script place menus and tooltips next to their trigger.
- `interestfor`, invoker commands (`command` / `commandfor`), `closedby` and `focusgroup`: small feature-detected fallbacks are included.
- View transitions: pages and sorts change instantly where unsupported.
- `ariaNotify()`: a polite live region is used instead.

To support browsers older than about 2024 (without the Popover API), load `@oddbird/popover-polyfill` only when `!Object.hasOwn(HTMLElement.prototype, "popover")`.

## Icons

The fragments use inline SVG with `class="icon"`, `aria-hidden="true"` and `stroke="currentColor"` (IC-03). With many icons on a page, put them in one hidden sprite and reference them with `<svg class="icon" aria-hidden="true"><use href="#i-name"/></svg>` (IC-06).
