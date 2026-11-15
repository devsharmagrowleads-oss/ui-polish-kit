---
topic: native-controls
prefix: NC
title: Native controls
when: Adding or touching any form control, dropdown, select, date or time picker, file upload, slider, colour input, checkbox, radio, tooltip, confirm/alert dialog, scrollable area or menu.
---

# Native controls

The fastest way to spot an unfinished interface is a browser-default control sitting inside a styled page: a grey OS dropdown in a dark SaaS form, the blue Chrome calendar popping out of a branded booking flow. Browsers draw these controls with their own colours, fonts, radii and popups, and most of that cannot be themed with CSS. The rule for all of them is the same: the user must never see a surface the project did not style. Recipes live in `recipes/react-tailwind-shadcn/components/`.

## NC-01 · Never ship a browser-default `<select>`
Severity: error · Check: static

**Rule.** Do not render a bare `<select>`. Use the `Select` recipe (Radix listbox) so both the closed trigger and the open list use the project's tokens. A native select is allowed only through the `NativeSelect` recipe (`appearance-none`, token border/radius/height, custom chevron), for long mobile-first lists where the OS picker is the better experience.

**Why.** The open list of a native select is drawn by the operating system: system font, system colours, no radius, no dark theme unless `color-scheme` is set, and a different look on every platform. It is the single most common "the agent forgot" defect.

**Bad.**
```tsx
<select name="plan">
  <option>Starter</option>
  <option>Team</option>
</select>
```

**Good.**
```tsx
<Select name="plan" defaultValue="team">
  <SelectTrigger className="w-56"><SelectValue placeholder="Choose a plan" /></SelectTrigger>
  <SelectContent>
    <SelectItem value="starter">Starter</SelectItem>
    <SelectItem value="team">Team</SelectItem>
  </SelectContent>
</Select>
```

**Check.** Static: any `<select>` without `appearance-none` (or a CSS rule that resets `appearance` for it). Visual: open every dropdown in light and dark and confirm the list uses the same surface, radius, font and hover colour as other popovers.

## NC-02 · Date and time inputs use the project's picker, not the browser's
Severity: error · Check: static

**Rule.** Never use `<input type="date">`, `datetime-local`, `month` or `week`. Use the `DatePicker` / `DateRangePicker` recipes (Popover + Calendar). For time, use the `TimePicker` recipe; a native `type="time"` is acceptable only when restyled with tokens.

**Why.** The calendar popup of a native date input is browser chrome. It is blue in Chrome, absent in some desktop Safari versions, ignores the page font, cannot show disabled dates or ranges, and formats the value by OS locale rather than the product's.

**Bad.**
```tsx
<input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
```

**Good.**
```tsx
<Field label="Due date">
  <DatePicker value={due} onValueChange={setDue} placeholder="Pick a date" />
</Field>
```

**Check.** Static: any `<input type="date|datetime-local|month|week">`; `type="time"` without restyling. Visual: open the calendar at 375px and in dark mode; it must fit the viewport and match the popover surface.

## NC-03 · File inputs are hidden behind a styled trigger or dropzone
Severity: error · Check: static

**Rule.** Never show a raw `<input type="file">`. Keep the real input for accessibility but hide it visually (`sr-only`) and drive it from a styled button or dropzone that shows accepted types, size limit, the chosen file names, upload progress and a remove action. Use the `FileUpload` recipe.

**Why.** The native control renders "Choose file / No file chosen" in the OS font and language, cannot be resized, and gives no feedback about what was selected beyond a truncated name.

**Bad.**
```html
<input type="file" name="avatar">
```

**Good.**
```tsx
<FileUpload files={files} onFilesChange={setFiles}
  prompt="Drop your logo here or browse" hint="PNG or JPG, up to 2 MB"
  accept="image/png,image/jpeg" maxSize={2 * 1024 * 1024} />
```

**Check.** Static: `<input type="file">` that is not visually hidden and has no `::file-selector-button` styling. Visual: select a file, select an oversized file, remove it; each step shows a styled state.

## NC-04 · Range sliders are styled
Severity: warning · Check: static

**Rule.** Use the `Slider` recipe, or style `::-webkit-slider-runnable-track`, `::-webkit-slider-thumb`, `::-moz-range-track` and `::-moz-range-thumb` with tokens. Show the current value next to the slider.

**Why.** Default sliders differ per browser (blue in Chrome, grey in Firefox, white knob in Safari) and the thumb is below the 24px minimum target size.

**Bad.**
```html
<input type="range" min="0" max="100">
```

**Good.**
```tsx
<Slider value={[volume]} onValueChange={([v]) => setVolume(v)} max={100} aria-label="Volume" />
<output className="tabular-nums text-sm text-muted-foreground">{volume}%</output>
```

**Check.** Static: `<input type="range">` with no thumb styling or `accent-color` in the project. Visual: drag with mouse, arrow keys and touch.

## NC-05 · Colour inputs use a themed picker
Severity: warning · Check: static

**Rule.** Do not show `<input type="color">`. Use the `ColorPicker` recipe: preset swatches plus a hex field in a Popover. If the full OS picker is needed, keep the native input hidden and open it from a styled swatch button.

**Why.** The native colour well is a small bevelled rectangle that opens an OS dialog; neither can be themed, and the dialog differs completely between platforms.

**Bad.**
```html
<input type="color" value="#0f766e">
```

**Good.**
```tsx
<ColorPicker label="Label colour" value={labelColour} onValueChange={setLabelColour}
  presets={project.labelColours} />
```

**Check.** Static: visible `<input type="color">`. Visual: pick a preset, type a hex value, type an invalid value.

## NC-06 · Checkboxes, radios and switches use tokens
Severity: warning · Check: static

**Rule.** Use the `Checkbox`, `RadioGroup` and `Switch` recipes. At the very least set `accent-color: var(--primary)` globally so native boxes take the brand colour. Checked, indeterminate, focus-visible and disabled states must all be styled.

**Why.** Default checkboxes are 13px, system blue, and stay light in dark mode. They are the second most visible default after `<select>`.

**Bad.**
```html
<input type="checkbox" id="terms"> <label for="terms">I agree</label>
```

**Good.**
```tsx
<div className="flex items-center gap-2">
  <Checkbox id="terms" checked={agreed} onCheckedChange={setAgreed} />
  <Label htmlFor="terms">I agree to the terms of service</Label>
</div>
```

**Check.** Static: native checkbox/radio with no `accent-color` in the project and no restyling. Visual: check, uncheck, tab to it, view disabled, view in dark mode.

## NC-07 · No `alert()`, `confirm()` or `prompt()`
Severity: error · Check: static

**Rule.** Never call the browser dialog functions. Report outcomes with a toast (`Toaster` recipe) or an inline message; ask for confirmation with `ConfirmDialog` / `useConfirm()`; collect a value with a `Dialog` containing a labelled field.

**Why.** These dialogs are drawn by the browser with the site's origin in the title, block the whole tab, cannot be styled or translated consistently, and browsers let users suppress them, after which `confirm()` silently returns false.

**Bad.**
```ts
if (confirm('Are you sure?')) { await deleteProject(id); alert('Deleted!'); }
```

**Good.**
```ts
const ok = await confirm({
  title: `Delete "${project.name}"?`,
  description: 'All 14 tasks and their files will be removed. This cannot be undone.',
  confirmLabel: 'Delete project', destructive: true,
});
if (ok) { await deleteProject(id); toast.success('Project deleted'); }
```

**Check.** Static: calls to `alert(`, `confirm(`, `prompt(` (including `window.` prefixed). Visual: trigger every destructive action and confirm a styled dialog appears.

## NC-08 · Tooltips are components, not `title` attributes
Severity: warning · Check: static

**Rule.** Do not use `title="…"` to explain a control. Use the `Tooltip` recipe, and give icon-only controls an `aria-label`. `title` stays valid on `<iframe>` and `<abbr>`.

**Why.** The native tooltip appears after about a second, in the OS style, never on touch devices and never on keyboard focus, so the people who most need the hint do not get it.

**Bad.**
```tsx
<button title="Archive"><ArchiveIcon /></button>
```

**Good.**
```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="ghost" size="icon" aria-label="Archive conversation"><Archive /></Button>
  </TooltipTrigger>
  <TooltipContent>Archive</TooltipContent>
</Tooltip>
```

**Check.** Static: `title=` on HTML elements. Visual: hover and Tab to each icon button; the tooltip appears in both cases.

## NC-09 · Scrollbars follow the theme
Severity: info · Check: static

**Rule.** Set `scrollbar-color` and `scrollbar-width` from tokens on the root (plus `::-webkit-scrollbar*` for older WebKit) and set `color-scheme`. For scroll areas inside cards, menus and dialogs use the `ScrollArea` recipe or the same token scrollbar. Never hide scrollbars on content that scrolls.

**Why.** A default light-grey scrollbar inside a dark panel is a bright stripe down the edge of the design. Windows shows classic 17px scrollbars everywhere, so this is visible to most desktop users even when the author's Mac hides it.

**Bad.**
```css
.sidebar { overflow-y: auto; }
```

**Good.**
```css
:root { scrollbar-color: var(--border) transparent; scrollbar-width: thin; color-scheme: light; }
.dark { color-scheme: dark; }
```

**Check.** Static: scroll containers exist but no scrollbar styling anywhere. Visual: check on Windows or with "always show scrollbars" enabled, in dark mode.

## NC-10 · Autofill does not repaint inputs
Severity: info · Check: static

**Rule.** Override `:-webkit-autofill` so autofilled inputs keep the token background and text colour (inset `box-shadow` of the input background plus `-webkit-text-fill-color`). The override is in the tokens recipe.

**Why.** Chrome paints autofilled fields pale blue or yellow with black text. On a dark form the login fields, the first thing a returning user sees, turn into bright rectangles.

**Bad.**
```css
input { background: var(--background); color: var(--foreground); }
```

**Good.**
```css
input:-webkit-autofill {
  -webkit-text-fill-color: var(--foreground);
  box-shadow: 0 0 0 1000px var(--background) inset;
  caret-color: var(--foreground);
}
```

**Check.** Static: inputs exist but `:-webkit-autofill` is never styled. Visual: let the browser autofill a login form in dark mode.

## NC-11 · Dropdowns and selects: anatomy and behaviour
Severity: error · Check: visual

**Rule.** Every select-like popup must: open on click, Enter, Space and ArrowDown; move with arrow keys, jump with type-ahead, close on Escape and return focus to the trigger; render in a portal above dialogs; flip when it would leave the viewport; cap its height (about 320px) and scroll inside; be at least as wide as its trigger; mark the selected item with a check; show a highlighted state for the keyboard-focused item that is the same as hover.

**Why.** Hand-rolled dropdowns usually handle only the mouse. The gaps appear as lists clipped by `overflow: hidden` parents, menus hidden under modals, and options unreachable by keyboard.

**Bad.**
```tsx
{open && <ul className="absolute bg-white">{options.map((o) => <li onClick={() => pick(o)}>{o}</li>)}</ul>}
```

**Good.**
```tsx
<SelectContent position="popper" sideOffset={4} className="max-h-80 min-w-(--radix-select-trigger-width)">
  {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
</SelectContent>
```

**Check.** Visual: operate each dropdown with the keyboard only; open one near the bottom edge of the viewport and one inside a dialog; open one with 50+ options.

## NC-12 · Date pickers: anatomy and behaviour
Severity: error · Check: visual

**Rule.** A date picker shows the chosen date in the trigger in the product's date format (never raw ISO), marks today, marks the selection with the primary colour, greys out and blocks dates outside the allowed range, has previous/next month buttons with accessible names, supports arrow-key day navigation, starts the week on the locale's first day, and closes on selection (single date) or on the second click (range). Ranges show the span between the two dates. Offer presets ("Last 7 days") where ranges are common.

**Why.** A calendar that merely renders a grid still fails users if they can pick an invalid date, cannot tell which day is today, or see `2026-03-09` in the field.

**Bad.**
```tsx
<DayPicker selected={date} onSelect={setDate} />   {/* unstyled, always visible, no trigger */}
```

**Good.**
```tsx
<DatePicker value={date} onValueChange={setDate}
  disabledDays={{ before: new Date() }} locale="en-GB" placeholder="Pick a date" />
```

**Check.** Visual: open, navigate months, pick a date with the keyboard, try a disabled date, check 375px width and dark mode.

## NC-13 · Comboboxes and menus
Severity: warning · Check: visual

**Rule.** Use the `Combobox` recipe when a list has more than about 10 options or is loaded from a server: it filters as the user types, shows a loading row while fetching and a "No results for '…'" row when empty. Menus (`DropdownMenu`) group related items with separators, right-align keyboard shortcuts, put destructive items last in the destructive colour, and align icons in a fixed-width column so labels line up.

**Why.** Scrolling a 200-item select is slow, and a filter with no empty state looks broken. Menus with ragged icon alignment or a red "Delete" in the middle read as unfinished.

**Bad.**
```tsx
<Select>{countries.map((c) => <SelectItem value={c.code}>{c.name}</SelectItem>)}</Select>  {/* 249 items */}
```

**Good.**
```tsx
<Combobox options={countries} value={country} onValueChange={setCountry}
  placeholder="Select country" searchPlaceholder="Search countries" emptyMessage="No country matches" />
```

**Check.** Visual: type a query with no match; open on a slow connection; check menu icon and shortcut alignment.
