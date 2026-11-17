---
topic: visual-hierarchy
prefix: VH
title: Visual hierarchy
when: Laying out any page, section, card, dashboard or detail view; styling headings, labels, values and secondary text; deciding what a screen should draw the eye to first; reviewing a screen that looks flat, busy or "all the same".
---

# Visual hierarchy

Hierarchy is the order in which a screen is read. Agent-built screens usually have the right content and no order: every heading is bold, every label as loud as its value, every section the same weight, so the eye has nowhere to land. Professional interfaces decide what is read first, second and third, and use size, weight, colour, space and position to enforce it. This topic builds on the type scale (TY-05, TY-08), spacing (SP-03) and colour (CO-04) rules; it is about using them to rank content.

## VH-01 · Each view has one focal point
Severity: warning · Check: visual

**Rule.** Decide, before styling, the single most important thing on each view: the page title and primary action on an app screen, the headline and call to action on a landing page, the key number on a dashboard. Make it the strongest element by at least two of: size, weight, contrast, colour, space around it, position (top left in apps, top centre or left in heroes). Everything else is visibly weaker. Write the focal point of each main view in `design.md` or the task notes so it survives later edits.

**Why.** When nothing dominates, users read the screen item by item and miss the point of it. A clear focal point makes a page feel designed rather than assembled.

**Bad.**
```tsx
<h1 className="text-xl font-bold">Invoices</h1>
<div className="grid grid-cols-4 gap-4">{kpis.map((k) => <Kpi key={k.id} {...k} className="text-xl font-bold" />)}</div>
```

**Good.**
```tsx
<header className="flex items-end justify-between"><h1 className="text-3xl font-semibold">Invoices</h1><Button>Create invoice</Button></header>
<Kpi label="Outstanding" value="$48,210" className="text-4xl" /><div className="grid grid-cols-3 gap-4 text-muted-foreground">…</div>
```

**Check.** Visual: blur or shrink each screenshot to thumbnail size; one element should still be clearly first, and it should be the one you meant.

## VH-02 · Levels differ enough to be seen
Severity: warning · Check: visual

**Rule.** Adjacent heading levels differ by at least a 1.2× size step (1.25 or more on marketing pages), the page title is at least 1.75× the body size in apps and 2.5× or more in a landing-page hero, and a level that is not bigger is distinguished by weight or colour instead. Do not use two sizes that differ by 1 or 2px: pick from the scale (TY-05) so levels are obvious. Section headings need more space above than below (SP-03) so they attach to their content.

**Why.** 18px and 16px read as the same size, so a heading at 18px looks like a mistake rather than a level. Users rely on these steps to skim.

**Bad.**
```css
h1 { font-size: 20px; } h2 { font-size: 18px; } h3 { font-size: 17px; } body { font-size: 16px; }
```

**Good.**
```css
h1 { font-size: var(--text-3xl); } h2 { font-size: var(--text-xl); } h3 { font-size: var(--text-base); font-weight: 600; }
```

**Check.** Visual: list the heading sizes on one page; each step must be visible at arm's length. Cross-check the scale in the token file.

## VH-03 · Three levels of text emphasis
Severity: warning · Check: visual

**Rule.** Text has three emphasis levels, each a token: primary (`--foreground`, for content and headings), secondary (`--muted-foreground`, for supporting text, metadata, descriptions) and disabled or placeholder. Use colour and weight to de-emphasise before reducing size: a date or a helper text gets the secondary colour at body size rather than shrinking to 11px. Every level still meets 4.5:1 contrast (AX-09), so secondary is a mid grey from the tinted neutral scale (CO-02), never an opacity hack on top of an unknown background.

**Why.** If all text is the same colour, metadata competes with content; if secondary text is tiny or too faint, it is unreadable. Colour is the quietest way to rank text without breaking the layout.

**Bad.**
```tsx
<p className="font-bold">Northwind Studio</p><p className="font-bold">Last invoice 3 Mar</p><p className="text-[10px] opacity-40">Net 30</p>
```

**Good.**
```tsx
<p className="font-medium">Northwind Studio</p><p className="text-sm text-muted-foreground">Last invoice 3 Mar · Net 30</p>
```

**Check.** Visual: in each screenshot, every piece of text is clearly primary or secondary; measure secondary text contrast in both themes.

## VH-04 · Values are louder than their labels
Severity: info · Check: visual

**Rule.** In KPI tiles, detail views, summaries and description lists the data is what people came for, so the value is the strong element and the label the quiet one: label in secondary colour at small or body size, value in primary colour, larger or heavier. Do not bold the labels ("**Status:** Paid") or put both at the same weight. When a label is obvious from the value (an email address, a date), drop the label and let format carry it.

**Why.** "Total: $4,210" with both parts the same weight is read as a sentence; with the value emphasised, the eye jumps straight to the number.

**Bad.**
```tsx
<dl><dt className="font-bold">Amount due:</dt><dd>$4,210.00</dd><dt className="font-bold">Due date:</dt><dd>14 Apr</dd></dl>
```

**Good.**
```tsx
<dl className="grid gap-1"><dt className="text-sm text-muted-foreground">Amount due</dt><dd className="text-2xl font-semibold tabular-nums">$4,210.00</dd></dl>
```

**Check.** Visual: in every tile, card and detail panel, the eye lands on the values before the labels.

## VH-05 · Layout follows how the page is scanned
Severity: warning · Check: visual

**Rule.** Text-heavy and app screens are scanned in an F-pattern: left-aligned headings, labels and the first words of each line carry the meaning, so align content to a left edge (SP-04), front-load headings and put filters and key columns on the left. Sparse marketing sections are scanned in a Z-pattern: logo top left, navigation and the secondary action top right, headline and supporting visual across the middle, primary call to action at the end of the diagonal. Do not centre long text (SL-10), and do not put the key action where the scan pattern never reaches (the far bottom right of a long app page).

**Why.** People do not read pages, they scan them. Putting the important parts on the scan path is the difference between "I found it at once" and "I didn't see that".

**Bad.**
```tsx
<section className="text-center"><h2>Billing</h2><p>{longExplanation}</p><table className="mx-auto">…</table><Button className="float-right">Upgrade</Button></section>
```

**Good.**
```tsx
<section><header className="flex items-center justify-between"><h2>Billing</h2><Button>Upgrade plan</Button></header>
  <p className="max-w-prose text-muted-foreground">{shortExplanation}</p><table>…</table></section>
```

**Check.** Visual: trace an F (apps) or Z (marketing sections) over the screenshot; the title, the key information and the primary action should lie on it.

## VH-06 · It passes the squint test
Severity: warning · Check: visual

**Rule.** Before calling a screen done, blur the screenshot (squint, or a 4 to 8px blur in an image tool) and check: the focal point is still first; groups are still distinguishable by space and shape; there are at most three or four distinct visual weights; nothing unimportant (a border, a badge, a decorative icon, a coloured background) is among the darkest or most saturated things on the screen. Fix by removing emphasis from the competing elements, not by adding more to the important one.

**Why.** Blurring removes the words, so only hierarchy is left. If the blurred page is a uniform grey or a field of equal blobs, users will feel that the page is flat or noisy.

**Bad.**
```tsx
<Card className="border-2 border-primary shadow-lg"><Badge>New</Badge><Icon className="text-primary" />…</Card>  {/* on every card */}
```

**Good.**
```tsx
<Card className="border">…</Card>   {/* emphasis saved for the one card that needs it */}
```

**Check.** Visual: compare each screenshot with a blurred copy; record the order in which elements appear and fix any mismatch with the intended order.

## VH-07 · Few font weights
Severity: warning · Check: static

**Rule.** A product uses at most three or four font weights in total, usually regular (400) for text, medium (500) for labels and controls, and semibold (600) or bold (700) for headings, plus at most one display weight on marketing pages. Weight is an emphasis level, not decoration: use the same weight for the same role everywhere (TY-08), and never use light weights (300 or lower) for body text or small sizes.

**Why.** Five or six weights on one product mean every component chose its own emphasis, so weight stops meaning anything; extra weights also cost font downloads.

**Bad.**
```tsx
<h2 className="font-extrabold">…</h2><p className="font-light">…</p><span className="font-black">…</span><label className="font-semibold">…</label><b className="font-bold">…</b>
```

**Good.**
```tsx
<h2 className="font-semibold">…</h2><p>…</p><label className="font-medium">…</label>
```

**Check.** Static: more than four distinct font weights used across the project's stylesheets and class names. Visual: weights mean the same thing on every screen.
