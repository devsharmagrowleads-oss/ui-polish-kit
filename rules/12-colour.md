---
topic: colour
prefix: CO
title: Colour
when: Creating or changing the palette, choosing a primary or accent colour, colouring status, charts, badges or backgrounds.
---

# Colour

A palette is small and has structure: one neutral scale that does most of the work, one brand colour used sparingly, and a few semantic colours with fixed meanings. Generated palettes go wrong in two ways: they take the framework default (blue-600 on grey-50) or they add a new hue for every element. Start from the brand colour in `design.md`; if there is none, choose one with the owner and record it. Hard-coded values and raw palette utilities are covered by TK-01 and TK-03.

## CO-01 · Build the palette from the brand colour
Severity: error · Check: visual

**Rule.** Take the primary colour from `design.md`. Derive what you need from it in OKLCH: a hover/pressed step (lightness ±0.04 to 0.06), a tinted surface (`color-mix(in oklch, var(--primary) 10%, var(--background))`), and the `--ring`. Verify `--primary-foreground` on `--primary` is at least 4.5:1; if the brand colour is too light for white text, use dark text on it rather than changing the brand colour. If no brand colour exists, propose two or three options suited to the audience (not indigo or violet by default) and let the owner choose.

**Why.** A product whose primary is Tailwind's `blue-600` or shadcn's default near-black looks like the starter template, because it is.

**Bad.**
```css
:root { --primary: #3b82f6; }   /* nobody chose this */
```

**Good.**
```css
:root { --primary: oklch(0.43 0.085 195); --primary-foreground: oklch(0.985 0.005 195); --ring: oklch(0.55 0.1 195); }
/* design.md: "Primary: deep teal #0f5e63, from the logo. White text on it measures about 7.5:1." */
```

**Check.** Manual: the `--primary` value matches `design.md`; contrast of the foreground pair is recorded there.

## CO-02 · A tinted neutral scale does most of the work
Severity: warning · Check: visual

**Rule.** Neutrals carry 80 to 90% of the interface: page, cards, borders, text. Use one scale with a slight tint toward the brand hue (chroma about 0.003 to 0.02 in OKLCH), never pure `#000`, `#fff`-on-`#000`, or a hue-less grey next to a warm brand. Map roles to steps: background (lightest), muted/secondary surface, border, input border (3:1), muted text (4.5:1 at least), body text (not pure black: about L 0.2). Do not mix two neutral families (slate with stone).

**Why.** Pure grey beside a saturated brand colour looks dirty; tinted neutrals make the whole page feel like one material. Mixed grey families are visible as cold and warm patches.

**Bad.**
```css
:root { --background: #ffffff; --foreground: #000000; --border: #cccccc; --muted-foreground: #999999; }
```

**Good.**
```css
:root { --background: oklch(0.99 0.003 195); --foreground: oklch(0.2 0.015 195);
        --border: oklch(0.91 0.008 195); --muted-foreground: oklch(0.47 0.015 195); }
```

**Check.** Visual: sample the greys in a screenshot; they share one hue. Body text is not `#000`.

## CO-03 · Semantic colours have fixed meanings and full pairs
Severity: error · Check: visual

**Rule.** Define `--destructive` (red: errors, deletion), `--success` (green: completed, positive), `--warning` (amber: needs attention, reversible risk) and `--info` (blue or neutral: neutral notices), each with a `-foreground` that passes 4.5:1 and a way to make a soft surface (10 to 15% mix). Use each only for its meaning: red is never decoration, green never just "primary". Tune their lightness and chroma to sit with the brand rather than taking pure `#ff0000` / `#00ff00`. If the brand colour is red or green, pick semantic hues that stay distinguishable from it.

**Why.** When red marks both "delete" and "sale", users stop trusting it as a warning. Stock pure hues clash with any considered palette.

**Bad.**
```tsx
<Badge className="bg-red-500">New</Badge>  <p className="text-green-500">Total: $420</p>
```

**Good.**
```tsx
<Badge variant="secondary">New</Badge>
<p className="text-destructive">Payment failed. Update your card to keep the Team plan.</p>
```

**Check.** Visual: find every red, green and amber element; each must mean error, success or warning.

## CO-04 · The accent is rare
Severity: warning · Check: visual

**Rule.** The primary colour marks the one main action per view, the current selection, links and focus. As a rough proportion: 60% background neutral, 30% secondary surfaces and text, 10% or less brand colour. One filled primary button per section; other actions are outline, ghost or link. Do not colour large backgrounds, every icon, every heading or every card border with the brand colour.

**Why.** If everything is the accent colour, nothing is. Users find the next step by looking for the single coloured button.

**Bad.**
```tsx
<Button>Cancel</Button> <Button>Save draft</Button> <Button>Preview</Button> <Button>Publish</Button>   {/* four filled primaries */}
```

**Good.**
```tsx
<Button variant="ghost">Cancel</Button> <Button variant="outline">Save draft</Button> <Button>Publish</Button>
```

**Check.** Visual: blur the screenshot (or squint). The primary action should be the first thing you find, and only one thing per region should be that colour.

## CO-05 · Data colours are a designed set
Severity: warning · Check: visual

**Rule.** Charts and categorical labels use a dedicated set of chart tokens (`--chart-1` … `--chart-6`) chosen to be distinguishable from each other in both themes and for colour-blind viewers (vary lightness as well as hue; add direct labels or patterns). Use a single-hue ramp for sequential data and a two-hue diverging ramp for above/below data. Do not reuse the semantic red/green for arbitrary series, and do not use the library's default rainbow.

**Why.** Default chart palettes ignore the theme and put a red series next to a green one, which means "bad" and "good" to the reader and is indistinguishable to many.

**Bad.**
```tsx
<Line stroke="#8884d8" /> <Line stroke="#82ca9d" /> <Line stroke="#ff0000" />
```

**Good.**
```tsx
<Line stroke="var(--chart-1)" name="Organic" /> <Line stroke="var(--chart-2)" name="Paid" strokeDasharray="4 2" />
```

**Check.** Visual: view each chart in dark mode and in a colour-blindness simulation; series are still told apart and labelled.

## CO-06 · Check every pair, in both themes
Severity: error · Check: visual

**Rule.** After defining or changing tokens, measure contrast for each text-on-surface pair that the interface uses: foreground/background, card-foreground/card, muted-foreground on background, muted and card, primary-foreground/primary, each semantic foreground/its colour, and link colour on background. All must reach 4.5:1 (3:1 for large text and for `--input`/`--ring` against the surface). Record the measured ratios in `design.md`. Never place text on an image without a scrim or a solid plate.

**Why.** Contrast is a property of pairs, so it can only be verified at the token level; checking one component proves nothing about the next.

**Bad.**
```css
:root { --muted: oklch(0.96 0 0); --muted-foreground: oklch(0.7 0 0); }   /* about 2.4:1 */
```

**Good.**
```css
:root { --muted: oklch(0.965 0.006 195); --muted-foreground: oklch(0.47 0.015 195); }   /* about 6:1, recorded in design.md */
```

**Check.** Tool: compute each pair (DevTools, or any WCAG contrast calculator) in light and dark. Visual: read the smallest muted text on the darkest surface it appears on.
