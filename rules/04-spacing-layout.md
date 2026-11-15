---
topic: spacing-layout
prefix: SP
title: Spacing and layout
when: Laying out a page or section, setting padding, margin or gap, building cards, lists, grids, sidebars or page containers.
---

# Spacing and layout

Inconsistent padding is the defect people notice without being able to name: the page feels "off". It comes from choosing each value locally. Spacing is a system: one scale, fixed padding per component type, and a rule for how much space separates things by how related they are. Static checks only catch off-scale values (TK-02, TK-04); everything else here has to be checked by looking at screenshots.

## SP-01 · One spacing scale, used for everything
Severity: error · Check: visual

**Rule.** All padding, margin and gap values come from the 4px scale (Tailwind steps 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24). In practice a screen uses a small subset: 4 and 8px inside controls, 12 and 16px inside cards and between form rows, 24 and 32px between groups, 48 to 96px between page sections. Prefer `gap` on a flex or grid parent over margins on children.

**Why.** A scale turns hundreds of spacing decisions into a handful, so equal relationships get equal space everywhere.

**Bad.**
```tsx
<div className="mt-[18px] mb-5 px-7"><h3 className="mb-[10px]">Members</h3><ul className="space-y-[7px]">…</ul></div>
```

**Good.**
```tsx
<section className="flex flex-col gap-4 p-6"><h3>Members</h3><ul className="flex flex-col gap-2">…</ul></section>
```

**Check.** Static: TK-02 and TK-04. Visual: measure the gaps in a screenshot; there should be no more than five or six distinct values on a screen.

## SP-02 · The same component always has the same padding
Severity: error · Check: visual

**Rule.** Fix padding per component type and reuse it: every card `p-6` (`p-4` on mobile), every dialog `p-6`, every table cell `px-4 py-3`, every page section the same vertical padding (`py-(--space-section)`), every page the same horizontal gutter. Encode these in the component, never at each call site.

**Why.** When one card is `p-4` and its neighbour `p-6`, their contents do not align and the grid looks broken even though each card is fine alone.

**Bad.**
```tsx
<Card className="p-4">…</Card> <Card className="p-6">…</Card> <Card className="px-5 py-3">…</Card>
```

**Good.**
```tsx
function Card({ className, ...props }) { return <div className={cn('rounded-lg border bg-card p-4 sm:p-6', className)} {...props} />; }
```

**Check.** Visual: in a full-page screenshot, compare the inner padding of sibling cards, panels and sections. Search the code for the same component with different padding overrides.

## SP-03 · Space shows relationship: inside less than outside
Severity: error · Check: visual

**Rule.** The gap between related items is smaller than the gap between groups, and the step is obvious (at least 1.5×). Label to its input: 6 to 8px. Field to field: 16 to 24px. Form section to section: 32 to 48px. A heading sits closer to the content it introduces than to the content above it. Padding inside a container is not larger than the space separating that container from its siblings by default; a card's inner padding (24px) with 16px between cards is the usual upper bound.

**Why.** Proximity is how people read grouping. Equal gaps everywhere turn a form into an undifferentiated list; a heading floating midway between two paragraphs belongs to neither.

**Bad.**
```tsx
<h2 className="my-8">Notifications</h2>     {/* equal space above and below */}
<label className="mb-6">Email</label><input className="mb-6" />
```

**Good.**
```tsx
<h2 className="mt-12 mb-4">Notifications</h2>
<div className="flex flex-col gap-1.5"><Label>Email</Label><Input /></div>
```

**Check.** Visual: squint at the screenshot. Groups must be distinguishable by whitespace alone, without borders.

## SP-04 · Elements share edges
Severity: warning · Check: visual

**Rule.** Content in a column starts on one left edge: page title, section headings, card edges, table edge and form fields all line up with the container gutter. Icons align optically with the text beside them (`items-center`, fixed-size icon box). Text in adjacent columns shares baselines. Do not centre some blocks and left-align others in the same column.

**Why.** Every extra alignment line adds visual noise. A heading indented 8px from the cards under it is noticed as untidy even by people who cannot say why.

**Bad.**
```tsx
<h1 className="pl-2">Projects</h1>
<div className="px-6"><Table /></div>
<div className="mx-auto w-fit"><Pagination /></div>
```

**Good.**
```tsx
<div className="mx-auto flex max-w-6xl flex-col gap-6 px-(--space-gutter)">
  <h1>Projects</h1> <Table /> <Pagination className="justify-end" />
</div>
```

**Check.** Visual: draw vertical lines down the left edges in the screenshot. A typical page has two or three alignment lines, not eight.

## SP-05 · Content has a maximum width and a gutter
Severity: error · Check: visual

**Rule.** Wrap page content in a container with a `max-width` (about 1152 to 1280px for app and marketing pages, 640 to 768px for forms and settings, 65ch for prose), centred, with a horizontal gutter of 16px on phones rising to 24 to 32px. Full-bleed backgrounds are fine; their content still sits in the container.

**Why.** Without a maximum, a 27-inch monitor stretches a form across 2000px. Without a gutter, text touches the screen edge on phones.

**Bad.**
```tsx
<main className="w-full"><form className="w-full">…</form></main>
```

**Good.**
```tsx
<main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">…</main>
```

**Check.** Visual: screenshot at 1920px and at 375px. Content is neither stretched nor touching the edges.

## SP-06 · Layouts follow a grid
Severity: warning · Check: visual

**Rule.** Build multi-column layouts with CSS grid and a consistent gap (16 or 24px). Columns in a row have equal heights (`items-stretch`), and cards align their internal rows (title, body, footer pinned to the bottom) with `grid-rows` or `flex-col` plus `mt-auto`. Use `repeat(auto-fill, minmax(280px, 1fr))` for card collections so the column count follows the width. Do not hand-set widths in percentages to fake columns.

**Why.** Cards of unequal height with buttons at different vertical positions look like a broken template. Percent widths with margins overflow at intermediate sizes.

**Bad.**
```tsx
<div className="flex flex-wrap">{plans.map((p) => <div className="m-2 w-[31%]">…</div>)}</div>
```

**Good.**
```tsx
<div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
  {plans.map((p) => <PlanCard key={p.id} plan={p} className="flex flex-col" />)}
</div>
```

**Check.** Visual: card bottoms and call-to-action buttons line up across a row at 768, 1024 and 1440px.

## SP-07 · Density matches the product
Severity: warning · Check: visual

**Rule.** Decide density from the use recorded in `design.md` and keep it consistent. Data-heavy tools (tables, admin, trading, IDE-like apps): 32 to 36px rows, 14px text, 8 to 12px cell padding. Standard SaaS: 40px controls, 16px text, 16 to 24px card padding. Marketing and consumer: 44 to 48px controls, generous section spacing (96px and more). Never mix a marketing-density hero with a dense table in one view without a clear transition.

**Why.** Agents default to marketing spacing everywhere, so a table shows six rows per screen and users scroll to do their job; or they pack a landing page like a spreadsheet.

**Bad.**
```tsx
<tr className="h-20"><td className="p-8 text-lg">INV-2041</td>…</tr>   {/* 6 rows visible */}
```

**Good.**
```tsx
<tr className="h-10"><td className="px-3 py-2 text-sm tabular-nums">INV-2041</td>…</tr>
```

**Check.** Visual: count how many rows or items are visible at 1440×900 and ask whether a daily user could work at that density.
