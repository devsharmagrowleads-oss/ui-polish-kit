---
topic: brand-intake
prefix: BR
title: Brand intake
when: Starting UI work in a project for the first time, starting a new product, page or redesign, or whenever design.md is missing or does not answer a design question.
---

# Brand intake

Every generic-looking interface starts with a skipped question: what should this one look like? Without an answer the agent supplies the statistical average. Intake is a short step that happens before any UI code: find what the brand already is, ask for what is missing, and write the answers into `design.md` at the project root. From then on `design.md` and the token file decide; the agent's defaults do not. Template: `templates/design.md`.

## BR-01 · `design.md` exists before UI work starts
Severity: warning · Check: static

**Rule.** Before writing or changing interface code, check for `design.md` (also `DESIGN.md`, `docs/design.md`, `brand.md`). If it exists, read it and follow it. If it does not, do the intake in BR-02 and BR-03 and create it from `templates/design.md`. Do not start components first and "add the brand later".

**Why.** Retrofitting a brand onto built components means touching every file; deciding first means the components are right when written.

**Bad.**
```text
User: build the settings page.
Agent: (writes Inter + blue-600 + gray-50 immediately)
```

**Good.**
```text
User: build the settings page.
Agent: reads design.md → fonts: IBM Plex Sans; primary: #0f5e63; density: compact; tone: plain, no exclamation marks → builds with those tokens.
```

**Check.** Static: no design document found at the known paths (set `"designDoc"` in `ui-polish.config.json` if it lives elsewhere).

## BR-02 · Search the project before asking
Severity: error · Check: process

**Rule.** Look for existing brand decisions in this order and extract them: (1) brand guideline or style guide files (`brand*`, `*.pdf` in docs, Figma links in the README); (2) existing tokens: CSS custom properties, `tailwind.config.*`, `theme.*`, `components.json`; (3) logo and favicon files (sample their colours); (4) an existing live site or marketing page named in the README or `package.json` `homepage` (read its fonts and colours); (5) existing components, to continue their conventions; (6) README and product docs for audience and tone. Record where each value came from.

**Why.** The owner should not be asked for information that is already in the repository, and new UI must match what exists.

**Bad.**
```text
Agent: What colours would you like?   (tailwind.config.ts already defines brand.500 = #0f5e63)
```

**Good.**
```text
Agent: Found in the repo: primary #0f5e63 (tailwind.config.ts), logo public/logo.svg uses the same teal plus #f4b942,
fonts not specified anywhere. I need two answers before building: …
```

**Check.** Process: `design.md` cites a source for each value ("from tailwind.config.ts", "from logo.svg", "owner, 9 March").

## BR-03 · Ask for what is missing, with options
Severity: error · Check: process

**Rule.** Ask the owner only for what the repository could not answer, in one message, as specific questions with concrete options: (a) brand colours: hex values or "pick from these three palettes"; (b) fonts: the brand typeface, or a choice of two or three pairings from the typography topic that suit the product; (c) tone: three adjectives, or choose between example sentences; (d) two or three reference sites or apps they like, and one they do not; (e) audience and primary device; (f) light, dark or both; (g) density; (h) the surface: marketing site, product app or both (BR-06). If the owner is unavailable or says "you decide", choose deliberately, write each choice in `design.md` marked "assumed: reason", and list the assumptions in your final report.

**Why.** Open questions ("what style do you want?") get vague answers; options get decisions. Recorded assumptions can be corrected later; silent defaults cannot be found.

**Bad.**
```text
Agent: What design style would you like for your app?
```

**Good.**
```text
Agent: Before I build, three quick choices (reply with letters, or "you decide"):
1. Typeface: (a) IBM Plex Sans: precise, technical  (b) Figtree + Newsreader: calm, editorial  (c) you have a brand font: name it
2. Primary colour: (a) keep the teal from your logo #0f5e63  (b) the amber #f4b942  (c) other hex
3. Tone of UI text: (a) plain and brief  (b) friendly and conversational
```

**Check.** Process: the conversation or `design.md` shows the questions asked and the answers or the marked assumptions.

## BR-04 · `design.md` is complete and concrete
Severity: warning · Check: process

**Rule.** `design.md` contains, with actual values: product and audience (one paragraph); personality (three adjectives and what it is not); colours (primary, any secondary, neutrals' tint, semantic colours, with hex/OKLCH and measured contrast pairs); typography (families, weights, where each is used, the scale); shape (radius base), elevation (flat, bordered or shadowed), density; themes supported; iconography (the one set, stroke width); imagery (screenshots, photos or illustration style; what to avoid); voice and tone (rules plus three example strings: a button, an error, an empty state); references; a "do not" list; and a decisions log with dates. Then mirror the values into the token file.

**Why.** "Modern and clean" is not a specification. A value an agent can copy is.

**Bad.**
```md
# Design
Modern, clean, minimal. Use nice colors and good fonts.
```

**Good.**
```md
## Colour
- Primary: #0f5e63 (oklch 0.43 0.085 195), from logo. On white: about 7.5:1.
- Neutrals: tinted toward hue 195. Body text oklch(0.2 0.015 195).
## Typography
- IBM Plex Sans 400/500/600 for UI and body; IBM Plex Mono for amounts and IDs. No second display face.
## Voice
- Plain, brief, no exclamation marks. Button: "Send invoice". Error: "We couldn't send it: the address bounced." Empty: "No invoices yet".
```

**Check.** Process: every section of the template is filled with values, not adjectives; the token file matches.

## BR-05 · `design.md` is binding
Severity: error · Check: process

**Rule.** When `design.md` and your preference disagree, `design.md` wins. If a task cannot be done within it (a needed colour or component style is not covered), propose the addition, get the owner's agreement or mark it "assumed", update `design.md` and the tokens first, then build. Never introduce a new font, colour, radius or tone in a component without that step. When the owner changes direction, update `design.md` in the same change.

**Why.** The document is only useful if it stays true. One undocumented exception per task and it describes a product that no longer exists.

**Bad.**
```tsx
// design.md says: primary teal, IBM Plex Sans
<h1 className="font-[Poppins] text-violet-600">Welcome back</h1>
```

**Good.**
```md
## Decisions log
- 2026-03-12: added `--chart-1…4` for the new reports page (teal, amber, slate, rose); owner approved in chat.
```

**Check.** Process: diff the fonts, colours and radii used in changed files against `design.md`; any new value has a matching log entry.

## BR-06 · Record what kind of product it is
Severity: info · Check: static

**Rule.** Write the surface in `design.md` as a line `Surface: marketing`, `Surface: app` or `Surface: both`. Marketing means a website or landing page whose job is to explain and convert; app means a signed-in product (SaaS, dashboard, admin tool) whose job is to get work done; both means the repository holds both. If the repository does not make it obvious, ask the owner as part of the intake (BR-03). The checker and the topics use it: rules written only for marketing pages or only for apps apply only where they fit. A config `"surface"` setting overrides the file.

**Why.** A dashboard does not need a hero, social proof or a pricing table, and a landing page does not need a setup checklist. Without the surface written down, the agent either applies every rule or guesses.

**Bad.**
```md
## Product and audience
- What it is: invoicing for small studios
```

**Good.**
```md
## Product and audience
- Surface: app
- What it is: invoicing for small studios
```

**Check.** Static: `design.md` exists but has no `Surface:` line and the checker could not tell from the code whether the project is a marketing site or an app. The report prints the surface it used and where it came from.
