---
topic: internationalisation
prefix: IN
title: Internationalisation and right-to-left
when: The product is or will be translated, supports right-to-left languages (Arabic, Hebrew, Persian, Urdu), shows dates, numbers, currencies or plurals, or sets fixed widths on text.
---

# Internationalisation and right-to-left

A layout built with `margin-left` and fixed-width buttons breaks the day it is translated: German labels overflow, Arabic needs the whole layout mirrored, and "1 items" appears everywhere. Most of the cost is avoided by writing direction-neutral CSS from the start and formatting with the `Intl` APIs. These rules apply to every product; the static check on physical properties runs only in projects that are already localised.

## IN-01 · Logical properties, not left and right
Severity: info · Check: static

**Rule.** Use logical properties for spacing, borders, radius and position: `margin-inline-start` not `margin-left`, `padding-inline`, `inset-inline-end`, `border-inline-start`, `text-align: start`; in Tailwind `ms-* me-* ps-* pe-* start-* end-* text-start rounded-s-*`. Physical properties are fine for things that do not flip with reading direction (a drop shadow offset, a chart's time axis).

**Why.** Logical properties mirror automatically when `dir="rtl"`, so one stylesheet serves both directions. Physical ones put the icon on the wrong side of the label and the close button on the wrong side of the dialog.

**Bad.**
```css
.alert-icon { margin-right: 0.5rem; } .drawer { left: 0; border-right: 1px solid var(--border); }
```

**Good.**
```css
.alert-icon { margin-inline-end: 0.5rem; } .drawer { inset-inline-start: 0; border-inline-end: 1px solid var(--border); }
```

**Check.** Static, in localised projects (an i18n library in package.json, a `locales/` folder, or `dir="rtl"` in the markup): physical left/right properties and Tailwind `ml- mr- pl- pr- left- right- text-left text-right` utilities. Visual: set `dir="rtl"` on `<html>` and look at every page.

## IN-02 · Text can grow and wrap
Severity: warning · Check: visual

**Rule.** Leave room for translations to be 30–40% longer (up to 200% for short labels): no fixed widths or heights on buttons, tabs, badges and nav items; let them wrap or grow; use `min-width` instead of `width`. Never put words in images, and never build sentences by concatenating translated fragments ("You have " + n + " new messages").

**Why.** "Save" is "Speichern" in German and "Enregistrer" in French; a 72px button truncates both. Concatenated fragments cannot be reordered, and many languages put the number or verb elsewhere in the sentence.

**Bad.**
```tsx
<button className="w-20">{t('save')}</button> <p>{t('you_have') + count + t('new_messages')}</p>
```

**Good.**
```tsx
<button className="min-w-20 px-4">{t('save')}</button> <p>{t('new_messages', { count })}</p>
```

**Check.** Visual: switch to a pseudo-locale (or German) and to 200% text size; no label is cut off or overlaps.

## IN-03 · Direction and language are declared; direction-aware icons flip
Severity: warning · Check: visual

**Rule.** Set `lang` and `dir` on `<html>` from the active locale, and `lang` on any block in another language. Icons that show direction (back and forward arrows, chevrons in breadcrumbs and pagination, "send", progress steps) mirror in right-to-left (`:dir(rtl)` with `scale: -1 1`, or `rtl:-scale-x-100`); icons that do not (play, search, clock, checkmarks, logos, phone numbers, code) do not flip.

**Why.** Without `dir="rtl"` the browser lays out Arabic text left-to-right with punctuation in the wrong place. A "next" arrow pointing left in an RTL layout points backwards.

**Bad.**
```html
<html lang="en"> … <a href="/next">التالي <svg class="icon">…arrow-right…</svg></a>
```

**Good.**
```html
<html lang="ar" dir="rtl"> … <a href="/next">التالي <svg class="icon icon-directional" aria-hidden="true">…</svg></a>
<style>.icon-directional:dir(rtl) { scale: -1 1; }</style>
```

**Check.** Visual: switch to an RTL locale; navigation, arrows and the reading order are mirrored and media controls are not.

## IN-04 · Format with Intl, pluralise with rules
Severity: error · Check: visual

**Rule.** Format numbers, currencies, percentages, dates, times, relative times and lists with `Intl.NumberFormat`, `Intl.DateTimeFormat`, `Intl.RelativeTimeFormat` and `Intl.ListFormat` for the user's locale; sort and compare text with `Intl.Collator`. Choose plural forms with `Intl.PluralRules` or ICU message syntax, never `count === 1 ? '' : 's'`. Store times in UTC and display them in the user's time zone, saying which when it matters.

**Why.** Many languages have more than two plural forms (Arabic has six); "1,234.50" is "1.234,50" in German; "03/04" is March in the US and April in the UK. Hand-rolled formatting is wrong somewhere for most users.

**Bad.**
```ts
`${n} file${n === 1 ? '' : 's'} · $${price.toFixed(2)} · ${date.getMonth() + 1}/${date.getDate()}`
```

**Good.**
```ts
t('files', { count: n }) + ' · ' + new Intl.NumberFormat(locale, { style: 'currency', currency }).format(price)
  + ' · ' + new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date)
```

**Check.** Visual: switch the browser locale; numbers, dates and plurals change correctly.

## IN-05 · Strings live outside the components
Severity: info · Check: process

**Rule.** In a product that is or will be translated, every user-facing string (labels, placeholders, errors, `aria-label`, `alt`, page titles, emails) comes from the message catalogue, with a key and a note for the translator where the context is not obvious. Keep whole sentences as one message with placeholders. Do not translate data (user names, product SKUs) or code.

**Why.** Strings left in components are found one at a time after launch, usually in error messages and accessibility labels that nobody sees in English testing.

**Bad.**
```tsx
<Button aria-label="Close">…</Button> <p>Something went wrong</p>
```

**Good.**
```tsx
<Button aria-label={t('dialog.close')}>…</Button> <p>{t('errors.saveFailed', { item: invoice.number })}</p>
```

**Check.** Process: search components for quoted user-facing text; switch to a pseudo-locale and look for untranslated strings.

## IN-06 · Fonts and line height cover every script
Severity: warning · Check: visual

**Rule.** The font stack covers every script the product ships: add a fallback family for Arabic, Hebrew, Devanagari, CJK and other scripts in use, loaded only for those locales (`unicode-range` subsets). Allow more line height for scripts with tall marks (Arabic, Devanagari, Thai: 1.6–1.8 for body). Do not use letter-spacing or uppercase transforms on scripts that have no case or join their letters.

**Why.** A Latin-only web font makes Arabic fall back to an unrelated system font at a different size; tight line height clips the marks above and below; letter-spacing breaks Arabic's joined letters apart.

**Bad.**
```css
body { font-family: "Instrument Sans", sans-serif; line-height: 1.4; } h2 { text-transform: uppercase; letter-spacing: 0.08em; }
```

**Good.**
```css
body { font-family: "Instrument Sans", "Noto Sans Arabic", sans-serif; }
:lang(ar) { line-height: 1.8; } :lang(ar) h2 { letter-spacing: normal; text-transform: none; }
```

**Check.** Visual: view each supported locale; text renders in the intended font without clipped marks.
