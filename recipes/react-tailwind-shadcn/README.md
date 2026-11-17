# React + Tailwind + shadcn/ui recipes

Ready-to-copy code that implements the kit's rules: one token file, and a token-styled replacement for every native control. Copy what you need into the project (`src/components/ui/`, `src/lib/`, `src/styles/`), then adjust imports. Nothing here is a package; the files are meant to be owned and edited by the project.

Tailwind v4 is the primary target. A Tailwind v3 mapping is provided in `tokens/tailwind.config.v3.ts`.

## Already using shadcn/ui?

Keep the shadcn CLI as the source of components (`npx shadcn@latest add select calendar popover …`) and take from this folder:

1. `tokens/tokens.css` — merge its extra tokens (`--success`, `--warning`, `--info`, `--overlay`, z-index, motion, shadows) and its `@layer base` block into your global stylesheet. The colour token names are the shadcn names, so existing components keep working.
2. The components shadcn does not ship or ships differently: `field`, `native-select`, `date-picker`, `time-picker`, `file-upload`, `color-picker`, `confirm-dialog`, `empty-state`, and the `loading` prop in `button`.

## Install

```bash
npm install radix-ui class-variance-authority clsx tailwind-merge lucide-react react-day-picker cmdk sonner
```

Requires React 19 (components take `ref` as a prop, no `forwardRef`), Tailwind CSS 4, and the `@/` import alias pointing at `src/`. `react-day-picker` 9 or later. For the alias, set `resolve.alias` in the bundler and `"paths": { "@/*": ["./src/*"] }` in `tsconfig.json` (relative to the tsconfig; recent TypeScript versions no longer need, or accept, `baseUrl`).

## Files

| File | What it is |
| --- | --- |
| `tokens/tokens.css` | Light and dark semantic tokens (oklch), chart colours (`--chart-1` … `--chart-6`, utilities `bg-chart-1` etc.), the Tailwind `@theme` mapping, and a base layer that restyles what browsers leave default: focus ring, autofill, scrollbars, selection, `accent-color`, `color-scheme`, reduced motion, and forced-colours (high contrast) fallbacks. |
| `tokens/tailwind.config.v3.ts` | The same tokens mapped for Tailwind v3, with the class substitutions needed. |
| `lib/utils.ts` | `cn()` class merger. |
| `components/button.tsx` | Variants, sizes, `loading` (spinner + `aria-busy`), disabled and active states. |
| `components/input.tsx`, `textarea.tsx`, `label.tsx` | Text controls. `controlClasses` is the shared look every field-like trigger reuses. |
| `components/field.tsx` | Label + hint + error wired to one control (`htmlFor`, `aria-describedby`, `aria-invalid`, required/optional marker). |
| `components/select.tsx` | Replaces `<select>`; the open list is styled too. |
| `components/native-select.tsx` | The only acceptable native `<select>`: `appearance-none`, tokens, own chevron. For phones and no-JS forms. |
| `components/combobox.tsx` | Searchable select for long lists (cmdk + popover), with an empty state. |
| `components/calendar.tsx`, `date-picker.tsx` | Replace `<input type="date">`. `DatePicker` and `DateRangePicker`. |
| `components/time-picker.tsx` | Replaces `<input type="time">` with a list of time slots. |
| `components/file-upload.tsx` | Replaces the bare file input: dropzone, file list, remove, size validation, error state. |
| `components/slider.tsx` | Replaces `<input type="range">`. |
| `components/color-picker.tsx` | Replaces `<input type="color">`: preset swatches plus an optional hex field. |
| `components/checkbox.tsx`, `radio-group.tsx`, `switch.tsx` | Token-styled, with 40px hit areas. |
| `components/tooltip.tsx` | Replaces `title=`. |
| `components/dropdown-menu.tsx`, `popover.tsx`, `dialog.tsx` | Overlays on the z-index scale. |
| `components/confirm-dialog.tsx` | Replaces `confirm()`: `ConfirmDialog`, plus `ConfirmProvider` / `useConfirm()` for `if (await confirm({...}))`. |
| `components/toaster.tsx` | Replaces `alert()`: sonner styled with tokens; re-exports `toast`. |
| `components/skeleton.tsx`, `empty-state.tsx` | Loading and empty states. |
| `components/data-table.tsx` | Semantic, sortable table: caption, column and row headers, sticky header, end-aligned tabular numbers, `aria-sort` plus an announcement, skeleton rows, error row with retry, empty slot. Sort can be controlled to keep it in the URL. |
| `components/scroll-area.tsx` | Overlay scrollbars for panels where the native bar would shift layout. |

### Marketing sections (`sections/`, for marketing surfaces)

Composable page sections for landing pages and marketing sites. Each takes the content as props, so the copy, screenshots and proof are the project's own (LP, AS).

| File | What it is | Rules |
| --- | --- | --- |
| `sections/hero.tsx` | Plain-words headline, one supporting sentence, one primary and one secondary action, the reassurance line, and a real product screenshot as the high-priority image | LP-01, VH-05, SL-07 |
| `sections/feature-showcase.tsx` | Features as alternating rows of claim and cropped screenshot, instead of three icon cards | LP-04, SL-08 |
| `sections/social-proof.tsx` | `LogoWall` (one monochrome treatment), `Testimonial` (full name, role, company), `Stat` (value, label and source) | LP-03, AS-04, VH-04 |
| `sections/pricing.tsx` | Two to four plans, one recommended by label and position, a monthly/yearly toggle with the saving in money, prices with period, trial terms in view | LP-05, UX-05 |
| `sections/faq.tsx` | `<details>` accordion (optionally exclusive) with an animated open where supported and a contact line | LP-06 |
| `sections/cta-band.tsx` | The closing call to action, repeating the hero's single goal | LP-02 |
| `sections/site-footer.tsx` | Brand, grouped link columns, and the required privacy, terms and contact links | LP-07, UX-02 |

### App building blocks (`app/`, for product apps)

| File | What it is | Rules |
| --- | --- | --- |
| `app/app-shell.tsx` | Skip link, grouped sidebar with the current page marked and settings apart, top bar, one `<main>`; the navigation opens in a dialog below `lg` | NV-01, NV-02, NV-07, RS-07, UX-02 |
| `app/page-header.tsx` | The one page-header pattern: breadcrumbs, `<h1>`, a line of description, actions in the same place on every page | NV-03, NV-04, VH-01 |
| `app/kpi-card.tsx` | `KpiCard` (value louder than label, change with icon, sign, words and period, loading skeleton, optional featured size) and `KpiGrid` | VH-04, AX-12, ST-02, SL-11 |
| `app/settings-section.tsx` | Title and description beside the fields, one form per section, a save bar that appears only when something changed, a danger tone | FM-08, FM-09, UX-04 |
| `app/setup-checklist.tsx` | Deferred setup with progress, items that link to the place to do them and tick themselves, permanent dismissal | AC-03, UX-09 |
| `app/first-run.tsx` | What a new account sees instead of zeros: the first success as the primary action plus import, template or sample-data paths (each a link or an in-page action) | AC-01, AC-02 |
| `app/command-palette.tsx` | `CommandPalette` (Dialog + cmdk, grouped results, a specific empty message), `CommandPaletteTrigger` and `useCommandPaletteShortcut` (Ctrl/⌘ K, IME-safe) | UX-08, AX-10 |

The section and app files import the base components as `@/components/ui/*`; copy them into `src/components/sections/` and `src/components/app/` (or anywhere) and keep that alias.

## Wire the tokens

```css
/* src/app/globals.css (or src/index.css) */
@import "./tokens.css"; /* already contains @import "tailwindcss" */
```

Replace every value marked `EXAMPLE` in `tokens.css` with the colours and fonts recorded in the project's `design.md`. Keep the token names.

Dark mode is switched by `class="dark"` or `data-theme="dark"` on `<html>`. To follow the OS, add `<meta name="color-scheme" content="light dark">` and a small script before the app that sets the class from `matchMedia("(prefers-color-scheme: dark)")` and listens for its `change` event (a saved user choice wins); `next-themes` does this for Next.js. Mount `<TooltipProvider>`, `<ConfirmProvider>` and `<Toaster />` once in the root layout.

## Wire the fonts

`tokens.css` reads three variables set by the font loader: `--font-body-loaded`, `--font-display-loaded`, `--font-mono-loaded`. The families below are the example pairing; use the ones chosen in `design.md`.

### Next.js (`next/font`, self-hosted, no layout shift)

```tsx
// src/app/layout.tsx
import { Fraunces, Instrument_Sans, JetBrains_Mono } from "next/font/google";

const body = Instrument_Sans({ subsets: ["latin"], display: "swap", variable: "--font-body-loaded" });
const display = Fraunces({ subsets: ["latin"], display: "swap", variable: "--font-display-loaded" });
const mono = JetBrains_Mono({ subsets: ["latin"], display: "swap", variable: "--font-mono-loaded" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

### Plain `<link>` (Vite, Astro, static HTML)

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..700&family=Instrument+Sans:wght@400..700&family=JetBrains+Mono:wght@400..600&display=swap"
/>
```

No extra CSS is needed: the stacks in `tokens.css` fall back to the family names when the `-loaded` variables are not set. If you change the families, change the names in the `--font-*` stacks to match. Load only the weights you use, and always keep `display=swap`.

## Conventions the components follow

- Colours, radii, shadows, z-index and motion come only from tokens. No hex values, no default-palette utilities (`bg-blue-500`), no `dark:` overrides — dark mode is the `.dark` token block.
- Every interactive element has hover, `focus-visible`, active and disabled styles. Focus is a 2px `--ring` outline; menu and list items use the accent fill because Radix moves real focus onto them.
- Controls are 40px tall (`h-10`), 36px for `sm`. Smaller visuals (checkbox, radio, switch) extend their hit area with a pseudo-element.
- Field text is 16px below the `md` breakpoint so iOS Safari does not zoom on focus.
- Overlays animate in with `animate-pop-in` / `animate-fade-in` (defined in `tokens.css`), under 200ms, and stop under `prefers-reduced-motion`.
- Icons are from `lucide-react` only.
