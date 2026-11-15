---
topic: ai-slop
prefix: SL
title: AI-slop blocklist
when: Designing a landing page, hero, feature section, dashboard, card grid or any new visual direction; choosing backgrounds, gradients, shadows, icons or decorative elements.
---

# AI-slop blocklist

These patterns are not wrong in themselves. They are the first thing a language model produces when asked for "a modern UI", so they appear on thousands of generated sites and now signal "nobody designed this". Each entry says what to do instead. The general instruction: make choices that follow from this product's `design.md` (its audience, tone and brand), not from the average of all landing pages.

## SL-01 · No purple/indigo-to-blue gradients
Severity: error · Check: static

**Rule.** Do not use violet, purple or indigo gradients running to blue, cyan or pink (`from-purple-500 to-blue-500`, `#6366f1 → #8b5cf6`), as backgrounds, buttons, borders or blobs. Default to flat surfaces from the tokens. If the brand in `design.md` has a gradient, build it from the brand tokens and use it in one place.

**Why.** It is the single most recognised marker of generated UI. It also fights with any real brand colour placed on top of it.

**Bad.**
```tsx
<section className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
```

**Good.**
```tsx
<section className="border-b bg-secondary text-secondary-foreground">
```

**Check.** Static: gradient utilities or `*-gradient()` values whose stops combine a purple/indigo hue with blue, cyan, pink or a second purple.

## SL-02 · No gradient text
Severity: warning · Check: static

**Rule.** Headings and labels are a solid foreground colour. Do not use `bg-clip-text text-transparent` or `background-clip: text`. For emphasis use weight, size, the display typeface, or the primary colour on one or two words.

**Why.** Gradient text has uneven contrast along its length, breaks text selection and high-contrast modes, and is a stock hero-section effect.

**Bad.**
```tsx
<h1 className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Ship faster</h1>
```

**Good.**
```tsx
<h1 className="font-display text-5xl tracking-tight">Close the books in <span className="text-primary">two days</span>, not ten</h1>
```

**Check.** Static: `bg-clip-text` with `text-transparent`; `background-clip: text`.

## SL-03 · No emoji as icons
Severity: warning · Check: static

**Rule.** Do not put emoji in buttons, headings, navigation, feature lists, badges, toasts or empty states. Use icons from the project's one icon set (lucide-react in the recipes), sized and coloured by tokens. Emoji are acceptable only as user-generated content or where `design.md` makes them part of the brand voice.

**Why.** Emoji are drawn by the OS: different on Apple, Windows, Android and Linux, full-colour regardless of theme, misaligned with the text baseline, and announced verbosely by screen readers ("rocket").

**Bad.**
```tsx
<h3>🚀 Fast deploys</h3> <button>✨ Generate</button> <li>✅ Unlimited projects</li>
```

**Good.**
```tsx
<h3 className="flex items-center gap-2"><Rocket className="size-5 text-primary" aria-hidden /> Deploys in under 40 seconds</h3>
<li className="flex gap-2"><Check className="size-4 text-success" aria-hidden /> Unlimited projects</li>
```

**Check.** Static: pictographic characters in markup and UI strings.

## SL-04 · One icon set
Severity: warning · Check: static

**Rule.** Import icons from exactly one library, at one stroke width, on a fixed size grid (16px in dense UI, 20px default, 24px for standalone). If the set lacks an icon, draw or adapt one in the same style rather than importing a second library. Brand logos come from one logo source.

**Why.** Lucide's 2px rounded strokes next to Font Awesome's filled glyphs next to Heroicons' 1.5px outlines look like three different products.

**Bad.**
```tsx
import { Search } from 'lucide-react';
import { FaUser } from 'react-icons/fa';
import { BellIcon } from '@heroicons/react/24/outline';
```

**Good.**
```tsx
import { Search, User, Bell } from 'lucide-react';
```

**Check.** Static: more than one icon library (or more than one `react-icons` sub-set) imported in source.

## SL-05 · Glass is an exception, not a surface style
Severity: warning · Check: static

**Rule.** Do not apply `backdrop-blur` with translucent backgrounds to cards, panels, modals and inputs as a house style. Use solid token surfaces (`bg-card`, `bg-popover`). Blur is acceptable on at most one layer that genuinely overlaps scrolling content, such as a sticky header, with an opaque fallback.

**Why.** Translucent panels over a gradient make text contrast depend on whatever is behind them, cost compositing time on low-end devices, and are part of the same generated look as the gradient itself.

**Bad.**
```tsx
<div className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl">…</div>   {/* every card */}
```

**Good.**
```tsx
<div className="rounded-lg border bg-card shadow-sm">…</div>
<header className="sticky top-0 z-(--z-sticky) border-b bg-background/85 backdrop-blur supports-[not(backdrop-filter)]:bg-background">…</header>
```

**Check.** Static: four or more uses of `backdrop-blur` / `backdrop-filter: blur()` in the project.

## SL-06 · No glows or coloured shadows
Severity: warning · Check: static

**Rule.** Shadows express elevation only: neutral, low opacity, offset downward, from the four shadow tokens. No `0 0 40px` coloured glows, neon outlines, coloured drop shadows under buttons (`shadow-purple-500/50`) or glowing text. Most surfaces need a border or a shadow, not both, and flat is a valid choice.

**Why.** Glows mean nothing (they are not elevation or state) and they smear on light backgrounds. They exist in generated UI because "futuristic" prompts produce them.

**Bad.**
```tsx
<button className="shadow-[0_0_30px_rgba(139,92,246,0.6)] shadow-purple-500/50">Get started</button>
```

**Good.**
```tsx
<Button className="shadow-xs">Start free trial</Button>
```

**Check.** Static: zero-offset coloured `box-shadow` / `text-shadow`, `shadow-[0_0_…]`, palette-coloured shadow utilities.

## SL-07 · No generic hero copy
Severity: warning · Check: static

**Rule.** Headlines state what the product does, for whom, with a specific outcome. Ban list: "Supercharge your…", "Unlock the power of…", "Revolutionize…", "Elevate your…", "Seamless", "next-level", "cutting-edge", "all-in-one platform", "Build faster, ship faster", "Welcome to our website", "Transform the way you…". If the product is unknown, ask for it or read the README; do not invent a slogan.

**Why.** These phrases fit every product, so they describe none. A visitor learns nothing in the five seconds a hero gets.

**Bad.**
```tsx
<h1>Supercharge your workflow</h1><p>The all-in-one platform to unlock your team's potential.</p>
```

**Good.**
```tsx
<h1>Invoices that chase themselves</h1>
<p>Ledgerly sends reminders, matches payments to invoices and tells you who is 30 days late. Freelancers get paid 11 days sooner on average.</p>
```

**Check.** Static: phrase list. Manual: cover the logo; if the headline could sit on a competitor's site unchanged, rewrite it.

## SL-08 · Not three identical feature cards
Severity: warning · Check: visual

**Rule.** Do not default to a row of three equal cards, each with an icon in a tinted square, a two-word title and one sentence. Structure the content by what it is: a comparison becomes a table, a process becomes numbered steps, a main benefit gets a large block with a real screenshot while secondary ones become a compact list. Vary size by importance. The same applies to the page skeleton "hero, three cards, testimonials, pricing, CTA".

**Why.** The three-card row is the layout models produce for any list of three things, so it carries no information about priority and makes every page look like the same template.

**Bad.**
```tsx
<div className="grid grid-cols-3 gap-8">{features.map((f) => <Card><IconBox /><h3>{f.title}</h3><p>{f.text}</p></Card>)}</div>
```

**Good.**
```tsx
<div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
  <FeatureLead title="Reconcile a month in one pass" screenshot={reconcileShot} />
  <ul className="flex flex-col divide-y">{secondary.map((f) => <FeatureRow key={f.id} {...f} />)}</ul>
</div>
```

**Check.** Visual: on each page, look for repeated identical blocks. Ask what the most important item is and whether the layout shows it.

## SL-09 · Radius is restrained and consistent
Severity: warning · Check: visual

**Rule.** Use the radius scale from tokens: small (controls inside controls, 4px), medium (inputs, buttons, 6px), large (cards, dialogs, 8px), and full only for pills, avatars and switches. An inner element's radius is smaller than its container's (outer radius minus the padding between them). Do not round everything to `rounded-2xl` / `rounded-3xl`, and do not mix sharp and very round corners on one screen.

**Why.** Large radii on every element make dense UI look inflated and waste corner space; mismatched nested radii leave visibly uneven gaps.

**Bad.**
```tsx
<div className="rounded-3xl p-2"><img className="rounded-3xl" … /><button className="rounded-full">…</button></div>
```

**Good.**
```tsx
<div className="rounded-lg border p-2"><img className="rounded-md" … /><Button>…</Button></div>
```

**Check.** Visual: list the distinct radii on a screen (three at most, plus full); check nested corners.

## SL-10 · Not everything is centred
Severity: warning · Check: visual

**Rule.** Left-align body text, forms, lists, tables, settings and dashboards (start-align in RTL). Centre only short, self-contained blocks: a hero headline of one or two lines, an empty state, a confirmation dialog. Never centre paragraphs longer than two lines or form fields.

**Why.** Centred text has a ragged left edge, so each line starts in a different place and reading slows. A fully centred page has no alignment line to anchor the layout.

**Bad.**
```tsx
<section className="text-center"><h2>…</h2><p>{fourSentenceParagraph}</p><form className="mx-auto">…</form></section>
```

**Good.**
```tsx
<section className="grid gap-10 lg:grid-cols-2"><div><h2>…</h2><p className="max-w-prose">…</p></div><form>…</form></section>
```

**Check.** Visual: find every `text-center`; each must be a short block.

## SL-11 · No stock dashboard filler
Severity: warning · Check: visual

**Rule.** A dashboard shows what this product's user needs to decide or do next. Do not generate the stock set: four KPI cards ("Total Revenue $45,231.89 +20.1%"), a decorative line chart, "Recent Sales" with avatar initials. Derive metrics from the product's domain (ask or read the data model), give each number a unit, a period and a comparison that is true for the sample data, and leave out a chart when a number or a table answers the question better.

**Why.** Invented vanity metrics fill space and demonstrate nothing. Reviewers recognise the template immediately.

**Bad.**
```tsx
<StatCard title="Total Revenue" value="$45,231.89" delta="+20.1% from last month" />   {/* product is a ticketing tool */}
```

**Good.**
```tsx
<StatCard title="Open tickets" value={128} hint="34 waiting on us for more than 24 h" action={<Link href="/tickets?overdue=1">Review overdue</Link>} />
```

**Check.** Visual: for each dashboard element, name the decision it supports. If none, remove it.

## SL-12 · No decorative noise
Severity: info · Check: visual

**Rule.** Remove decoration that carries no content: blurred colour blobs behind the hero, dot or grid backgrounds, floating shapes, sparkle icons, "New" pills above every headline, animated gradient borders, a rotating logo marquee of invented companies, fake testimonials and star ratings. Use real product screenshots, real customer logos or nothing. Whitespace is a finish, not an absence.

**Why.** Each of these is filler a model adds to make a page look "designed". Together they bury the content and, for testimonials and logos, they are fabrication.

**Bad.**
```tsx
<div className="absolute -top-40 size-96 rounded-full bg-purple-500/30 blur-3xl" />
<span className="rounded-full border px-3 py-1">✨ Introducing v2.0</span>
```

**Good.**
```tsx
<section className="mx-auto grid max-w-6xl gap-12 px-6 py-(--space-section) lg:grid-cols-2">
  <HeroCopy /> <ProductScreenshot src={dashboardShot} alt="Overdue invoices grouped by client" />
</section>
```

**Check.** Visual: for every decorative element, delete it mentally. If nothing is lost, delete it in the code.
