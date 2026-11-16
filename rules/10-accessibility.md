---
topic: accessibility
prefix: AX
title: Accessibility
when: Building any interactive component, choosing text or border colours, adding images or icons, handling focus, writing custom widgets, or reviewing a page before completion.
---

# Accessibility

Accessibility is a quality bar, not a feature: the same properties that let a screen-reader or keyboard user operate the page (real buttons, labels, visible focus, sufficient contrast) are what make it robust for everyone. Target WCAG 2.2 AA. The recipes are built on Radix primitives, which handle focus management and ARIA for composite widgets; most failures come from bypassing them with a `<div onClick>`.

## AX-01 · A visible focus ring on everything focusable
Severity: error · Check: static

**Rule.** Define a global `:focus-visible` style using the `--ring` token (2px outline, 2px offset) and keep or restate it on every custom control. The ring must have 3:1 contrast against what is behind it and must not be clipped by `overflow: hidden` parents.

**Why.** Keyboard users navigate by the focus indicator alone. Without one they are operating the page blind.

**Bad.**
```css
/* no :focus-visible rule anywhere; reset stylesheet removed outlines */
```

**Good.**
```css
:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }
```

**Check.** Static: no `:focus-visible` (or `focus-visible:` utility) anywhere in the project. Visual: Tab through the page; you can always see where focus is.

## AX-02 · Never remove an outline without replacing it
Severity: error · Check: static

**Rule.** `outline: none` / `outline-none` is allowed only together with a visible replacement for the focused state: a ring, a border colour change with 3:1 contrast, or a background change on items inside a menu. To hide the ring for mouse users use `:focus:not(:focus-visible)`, never a blanket reset.

**Why.** `*:focus { outline: none }` is in countless snippets "to remove the ugly blue border" and disables keyboard navigation site-wide.

**Bad.**
```css
button:focus, input:focus { outline: none; }
```

**Good.**
```tsx
<input className="border border-input outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40" />
```

**Check.** Static: `outline: none|0` with no focus replacement in the stylesheet; `outline-none` with no `focus-visible:`/`focus:` ring, border or background in the same class list.

## AX-03 · Images have alt text
Severity: error · Check: static

**Rule.** Every `<img>` has `alt`. Informative images describe their content or function in a short phrase ("Bar chart: revenue up 12% in March"); decorative images use `alt=""` so they are skipped; images inside links or buttons describe the destination or action. Inline SVG icons that are decorative get `aria-hidden="true"`; meaningful ones get `role="img"` and `aria-label`.

**Why.** Without `alt` a screen reader reads the file name ("IMG underscore 4032 dot jpeg"). With a wrong alt on a decorative image it reads noise.

**Bad.**
```tsx
<img src="/team/dana.jpg" />
```

**Good.**
```tsx
<img src="/team/dana.jpg" alt="Dana Okafor, Head of Support" width={96} height={96} />
<img src="/divider-wave.svg" alt="" width={1200} height={48} />
```

**Check.** Static: `<img>` (and `next/image`) without `alt`.

## AX-04 · Interactive things are real interactive elements
Severity: error · Check: static

**Rule.** Anything clickable is a `<button type="button">` (action) or `<a href>` (navigation). Do not attach `onClick` to `<div>`, `<span>`, `<li>`, `<tr>` or `<img>`. To make a whole card or row clickable, put a link or button inside and stretch it with a pseudo-element, or use the row's primary cell link.

**Why.** A clickable `<div>` cannot be reached with Tab, does not respond to Enter or Space, and is announced as plain text. Rebuilding that with `role`, `tabIndex` and key handlers is more code and usually incomplete.

**Bad.**
```tsx
<div className="card" onClick={() => router.push(`/projects/${p.id}`)}>{p.name}</div>
```

**Good.**
```tsx
<article className="relative rounded-lg border p-4 hover:bg-accent">
  <h3><a href={`/projects/${p.id}`} className="after:absolute after:inset-0">{p.name}</a></h3>
</article>
```

**Check.** Static: click handlers on non-interactive elements without a `role`. Visual: Tab through the page and activate every control with Enter or Space.

## AX-05 · Zoom is never disabled
Severity: error · Check: static

**Rule.** The viewport meta must not contain `user-scalable=no` or `maximum-scale=1`. The layout must remain usable at 200% browser zoom and with text resized to 200% (use `rem` for font sizes, avoid fixed heights on text containers).

**Why.** People with low vision zoom every page. Blocking it fails WCAG 1.4.4 and iOS ignores it anyway, so it only harms Android users.

**Bad.**
```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
```

**Good.**
```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

**Check.** Static: `user-scalable=no` or `maximum-scale=1` in a viewport declaration. Visual: zoom to 200%; nothing is cut off or overlapping.

## AX-06 · The document declares its language
Severity: error · Check: static

**Rule.** `<html lang="…">` is set to the page language (`en`, `en-GB`, `de`, …), with `dir="rtl"` for right-to-left languages. Passages in another language get their own `lang`.

**Why.** Screen readers choose the voice and pronunciation from `lang`; browsers use it for hyphenation, quotes and translation prompts.

**Bad.**
```html
<html>
```

**Good.**
```html
<html lang="en-GB">
```

**Check.** Static: `<html>` without `lang`.

## AX-07 · Icon-only controls have accessible names
Severity: warning · Check: static

**Rule.** A button or link whose only content is an icon has `aria-label` describing the action and its object ("Delete invoice INV-2041", not "Delete" repeated twenty times; never "icon" or "button"). The icon itself is `aria-hidden`. Pair it with a `Tooltip` showing the same label.

**Why.** An unnamed icon button is announced as just "button". In a table with a row of them, a screen-reader user hears "button, button, button".

**Bad.**
```tsx
<button onClick={remove}><Trash2 /></button>
```

**Good.**
```tsx
<Button variant="ghost" size="icon" aria-label={`Delete invoice ${invoice.number}`} onClick={remove}><Trash2 aria-hidden /></Button>
```

**Check.** Static: `<button>` or `<a>` containing only an icon and no `aria-label`. Visual: inspect the accessibility tree in DevTools; every control has a name.

## AX-08 · No positive `tabindex`
Severity: warning · Check: static

**Rule.** Use `tabindex="0"` to add a custom widget to the tab order and `tabindex="-1"` for programmatic focus only. Never use values of 1 or more. Tab order follows DOM order, so fix the DOM order (and use CSS `order` sparingly, since it desynchronises visual and focus order).

**Why.** A positive tabindex jumps that element ahead of everything else on the page, so focus leaps around unpredictably.

**Bad.**
```html
<input tabindex="2"> <input tabindex="1"> <button tabindex="3">Send</button>
```

**Good.**
```html
<input> <input> <button>Send message</button>
```

**Check.** Static: `tabindex` greater than 0. Visual: Tab through; focus moves in reading order.

## AX-09 · Contrast meets AA
Severity: error · Check: visual

**Rule.** Body text and text in controls: at least 4.5:1 against its background. Large text (24px, or 18.66px bold and up): 3:1. Non-text essentials (input borders, icons that convey meaning, focus rings, chart lines, the boundary of a toggle): 3:1. Placeholder and disabled text are exempt from the ratio but must still be legible. Check both themes, and check text on tinted surfaces, on images and on the primary colour.

**Why.** Light grey on white is the most common real-world accessibility failure and affects everyone on a phone in sunlight.

**Bad.**
```tsx
<p className="text-gray-400">Last updated 3 days ago</p>            {/* 2.6:1 on white */}
<input className="border border-gray-200" />                         {/* 1.2:1 boundary */}
```

**Good.**
```tsx
<p className="text-muted-foreground">Last updated 3 days ago</p>    {/* token tuned to ≥ 4.5:1 */}
<Input />                                                            {/* border-input ≈ 3:1 */}
```

**Check.** Visual/tool: compute the ratio for every text/background token pair in both themes (DevTools colour picker shows it; or `audit/PROCEDURE.md` step 4). Record the pairs in `design.md`.

## AX-10 · Everything works from the keyboard
Severity: error · Check: visual

**Rule.** Tab reaches every control in a logical order and never gets trapped except inside an open modal. Enter and Space activate; arrow keys move within composite widgets (menus, tabs, radio groups, listboxes, calendars); Escape closes the topmost overlay. Opening a dialog moves focus into it and traps it; closing returns focus to the element that opened it. Provide a "Skip to content" link as the first focusable element. After a route change or an inline deletion, move focus somewhere sensible.

**Why.** Hand-built overlays commonly leave focus behind the backdrop, so keyboard users tab through an invisible page.

**Bad.**
```tsx
{open && <div className="fixed inset-0"><div className="modal">…</div></div>}   {/* no focus management */}
```

**Good.**
```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent><DialogTitle>Rename project</DialogTitle>…</DialogContent>
</Dialog>
```

**Check.** Visual: unplug the mouse. Complete the page's main task, open and close every overlay, and confirm focus returns to the trigger.

## AX-11 · Semantic structure before ARIA
Severity: warning · Check: visual

**Rule.** Use landmarks once each where applicable: `<header>`, `<nav aria-label>`, `<main>`, `<aside>`, `<footer>`. Use lists for lists, `<table>` with `<th scope>` and `<caption>` for tabular data, `<button>` and `<a>` for controls, `<fieldset>`/`<legend>` for grouped inputs. Add ARIA only when no element has the semantics, and follow the WAI-ARIA Authoring Practices pattern exactly when you do. No `role="button"` on a `<button>`, no `aria-label` on non-interactive `<div>`s.

**Why.** Native elements come with roles, states and keyboard behaviour for free. Incorrect ARIA overrides them and makes things worse than no ARIA.

**Bad.**
```tsx
<div className="nav"><div className="nav-item" role="link">Home</div></div>
<div className="table"><div className="row"><div>Invoice</div><div>Total</div></div></div>
```

**Good.**
```tsx
<nav aria-label="Main"><ul><li><a href="/">Home</a></li></ul></nav>
<table><caption className="sr-only">Invoices</caption><thead><tr><th scope="col">Invoice</th><th scope="col">Total</th></tr></thead>…</table>
```

**Check.** Visual: view the page outline (landmarks and headings) in the accessibility tree; it should read like a table of contents.

## AX-12 · Not colour alone; announce changes
Severity: warning · Check: visual

**Rule.** Status is carried by text or an icon plus colour: error fields have a message and icon, required fields say so, chart series differ by label or shape, links inside text are underlined. Dynamic updates are announced: toasts and async results use `role="status"` / `aria-live="polite"`, errors `role="alert"`; loading regions set `aria-busy`. Do not auto-dismiss messages that contain actions or errors.

**Why.** About 1 in 12 men cannot reliably tell red from green. A toast that a sighted user sees is silent to a screen reader unless it is in a live region.

**Bad.**
```tsx
<span className={ok ? 'text-green-600' : 'text-red-600'}>●</span>
```

**Good.**
```tsx
<Badge variant={ok ? 'success' : 'destructive'}>{ok ? <Check aria-hidden /> : <CircleAlert aria-hidden />}{ok ? 'Paid' : 'Overdue'}</Badge>
```

**Check.** Visual: view the page in greyscale (DevTools Rendering → emulate vision deficiency → achromatopsia); every status is still readable.

## AX-13 · Works in forced-colours (high-contrast) mode
Severity: warning · Check: visual

**Rule.** Do not convey a boundary, state or separator only with `box-shadow`, `background-color`, `background-image`, gradients or `border-image`: Windows high-contrast mode removes them. Give controls a real `border` or `outline` (transparent in normal mode is fine), and under `@media (forced-colors: active)` restore anything lost using system colours (`CanvasText`, `ButtonText`, `Highlight`, `LinkText`, `GrayText`). Use `forced-color-adjust: none` only where colour itself is the content (a colour swatch, a chart series key), and then set both text and background.

**Why.** In forced-colours mode the browser replaces author colours with the user's system palette and drops shadows and background images, so a focus ring drawn as a box-shadow, a selected tab shown only by its background, or a toggle drawn with gradients simply disappears.

**Bad.**
```css
button:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--ring); }
.tab[aria-selected="true"] { background: var(--accent); }
```

**Good.**
```css
button:focus-visible { outline: 2px solid transparent; box-shadow: 0 0 0 3px var(--ring); }
.tab[aria-selected="true"] { background: var(--accent); }
@media (forced-colors: active) {
  button:focus-visible { outline-color: Highlight; }
  .tab[aria-selected="true"] { border-block-end: 2px solid Highlight; }
}
```

**Check.** Visual: turn on Windows Contrast themes, or emulate `forced-colors: active` in DevTools (Rendering panel); focus rings, selected states, checkbox marks and dividers are still visible.
