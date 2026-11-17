# UI elevate procedure

The audit (`audit/PROCEDURE.md`) makes an interface correct. Elevation makes it look and feel like a professional designer made it: the same product and content, remapped into a premium interface. Run it on a UI that already works, typically one a coding agent produced. It uses two scores: the static score from the checker, and the Polish score, judged from screenshots against `audit/POLISH.md`. Elevation is done when the static check passes, the Polish score is at least 80 and no Polish dimension scores below 2, as scored by an independent reviewer (`audit/POLISH.md`, Independent check).

Work in this order. Do not skip the baseline: the before/after comparison is how the owner sees what changed.

## 0. Ground rules

- **Stay inside the brand.** `design.md` is binding (BR-05). Elevation sharpens the brand; it does not replace it. If the best move needs a new font, colour or tone, propose it to the owner with the reason and wait, or mark it "assumed" and list it in the report.
- **Same product, same content.** Do not remove features, data or copy the owner wrote without asking. Rewrite placeholder or vague copy (CP), but keep the meaning.
- **Respect the surface** (BR-06). Marketing pages are judged on conversion (LP); product apps on activation (AC). Do not give a dashboard a hero or a landing page a setup checklist.
- **Nothing from the slop list** (SL). "Premium" is restraint and precision, not gradients, glass, glow and bigger shadows.
- **Ask about missing assets** (AS-01). A premium page needs the real logo, product screenshots and photos. Ask the owner once, with options, before designing around their absence.
- **No owner to ask?** Write each question under "Questions for the owner" in `design.md`, make a deliberate choice, mark it "assumed", and list the open questions in the report.
- **Light-only products.** If the product has no dark theme, adding one is a brand change: propose it, or mark it "assumed". If `design.md` says light-only, skip the dark captures and score the light theme.

## 1. Intake

1. Read `design.md`. If it is missing, or has no `Surface:` line or Assets table, do the brand intake (BR-01 to BR-06, AS-01): gather the answers and ask the owner now, but write `design.md` after the baseline in step 2, so the baseline measures the interface exactly as you found it.
2. Agree the scope with the owner: which pages or flows, and whether to apply the plan straight away or to show it first. The static check covers the whole project; if out-of-scope pages would block it, either fix their errors too or agree to scope the check with `include` in `ui-polish.config.json`, and report the whole-project score beside the scoped one. Default: show the plan (step 4) and apply after a yes; if the owner asked for a full elevation without review, apply it and report.

## 2. Baseline

Pages behind a sign-in: pass `--storage-state auth.json` (cookies and storage of a signed-in session) or `--init seed.js` (a script that runs before the app, e.g. to seed localStorage) to `screenshot.mjs`. The tool reports `REDIRECTED` when a capture landed on another page, such as the sign-in screen. For an app, capture a brand-new account as well as a populated one (a separate `--init` script, or a query such as `?first-run` that the file names keep), because the journey dimension needs both.

```bash
mkdir -p .ui-polish-audit/before
node <kit>/audit/cli.mjs . --json > .ui-polish-audit/before.json
node <kit>/audit/screenshot.mjs <urls…> --out .ui-polish-audit/before
```

Capture every page in scope at 375, 768 and 1440px, light and dark, plus overlays and the empty, loading and error states (`audit/PROCEDURE.md` step 2). Look at every image. Score each Polish dimension from these screenshots (`audit/POLISH.md`) into `.ui-polish-audit/polish-before.json`, then add it to the baseline:

```bash
node <kit>/audit/cli.mjs . --json --polish .ui-polish-audit/polish-before.json > .ui-polish-audit/before.json
```

## 3. Critique

For each page in scope, write a short critique the way a design lead would, in this shape:

```text
<page> (<surface>)
Focal point: what the eye lands on first, and what it should be.
Hierarchy: what competes, what is too loud, what is too quiet.
Rhythm: spacing and alignment problems, with measurements from the screenshot.
Craft: controls, states, icons, images, motion that feel unfinished.
Journey: for marketing, does the page pass the five-second test and ask for one thing; for apps, what a new and a returning user see.
Weakest Polish dimensions: <two or three IDs with scores>.
```

Base every point on a screenshot, and name it. Avoid "make it pop" or "more modern": say what is wrong and by how much.

## 4. Elevation plan

Turn the critique into a ranked list of moves. Rank by impact on the weakest Polish dimensions first, then by how many screens a move improves, then by effort. System-level moves (tokens, type scale, spacing scale, one shared component) come before page-level ones, because one change lifts every screen. For each move, give: what changes, where, which dimension and rule IDs it serves, and the expected effect.

Moves that reliably lift each dimension:

| Dimension | Moves |
| --- | --- |
| `hierarchy` | Pick one focal point per view and remove emphasis from everything competing with it (VH-01, VH-06); demote secondary actions to outline or ghost (UX-05); make values larger than labels (VH-04); add a consistent page header with title, description and one primary action (NV-03) |
| `typography` | Reduce to five or six sizes with a clear ratio (TY-05, VH-02); a larger, tighter display size for page titles and heroes (slight negative tracking); two or three weights with fixed roles (VH-07); 65-character measure for prose (TY-06); tabular numbers in tables and KPIs (TY-07) |
| `spacing` | Increase and standardise section spacing (SP-02); one gutter and max width (SP-05); align everything to shared edges (SP-04); group with whitespace instead of borders (SP-03); match density to the product (SP-07) |
| `colour` | Move to a tinted neutral scale (CO-02); cut accent use to primary actions and one highlight per view (CO-04); design the dark palette rather than inverting (DM-05); check contrast on every pair (CO-06) |
| `surfaces` | One elevation system: page, then card with a hairline border, then popover and dialog with soft, low-contrast shadows (TK-07); one radius scale (SL-09); remove glass and glow (SL-05, SL-06) |
| `components` | Replace every native control with a recipe (NC); design every state, including skeletons that keep the layout (ST-01 to ST-07); upgrade tables (DT) and forms (FM) to the recipes |
| `imagery` | Real product screenshots in quiet frames (LP-04); one icon set, sized and aligned to text (IC); the real logo for each theme (AS-04); remove stock and placeholder images (AS-05) |
| `motion` | 150 to 250 ms transitions on hover, press and overlays with ease-out entrances (MO-02, MO-05); immediate feedback on every action (UX-08); view transitions between pages (MO-08); reduced-motion fallbacks (MO-03) |
| `copy` | Headlines that say what the product does (LP-01, SL-07); buttons that name the action (CP-04); errors and empty states that say what next (CP-05, CP-06); front-load key words (UX-07) |
| `consistency` | Extract repeated patterns into shared components; one page-header pattern (NV-03); the same component with the same padding everywhere (SP-02); one voice (CP-07) |
| `journey` | Marketing: a hero that passes the five-second test, proof beside each claim, a repeated single call to action, a clear pricing choice (LP-01 to LP-05). App: a designed first run, a setup checklist, teaching empty states, a returning-user home (AC-01 to AC-07) |

Show the plan to the owner as a numbered list (move, why, screens affected, dimension), plus any brand changes that need their approval and any assets you still need from them.

## 5. Apply

1. Tokens and `design.md` first (approved brand changes, type scale, spacing, colour, radius, shadows).
   Recipes need their dependencies and an `@/` import alias: see `recipes/react-tailwind-shadcn/README.md` (Install), or use the plain HTML/CSS recipes, which need none.
2. Shared components next (page header, card, button variants, form field, table, empty state), using the recipes in `<kit>/recipes/`.
3. Then each page, in the plan's order.
4. After each group of moves, run the static checker; never trade a Polish gain for a static regression.

## 6. Re-measure

Before a second pass, move the previous captures to `.ui-polish-audit/pass-1/` so they are not overwritten. Re-capture the same pages, widths and themes into `.ui-polish-audit/` (same file names as the baseline, so the report can pair them), re-score the Polish dimensions into `.ui-polish-audit/polish.json`, and build the report:

```bash
node <kit>/audit/cli.mjs . --polish .ui-polish-audit/polish.json \
  --before .ui-polish-audit/before.json --html .ui-polish-audit/report.html
```

Then get the independent score: hand only `audit/POLISH.md` and the screenshot folder to a reviewer that did not do the work (a fresh agent or session, or a person), without your scores or plan, and keep their result as `.ui-polish-audit/polish-independent.json`. Build the report with `--polish .ui-polish-audit/polish-independent.json` and quote your own score beside it.

If the target is not met by the independent score (static check failing, Polish score under 80, or any dimension under 2), go back to step 4 with the weakest dimensions. Stop when it is met or when what remains needs the owner (assets, a brand decision, product data).

## 7. Report

Give the owner the HTML report (`.ui-polish-audit/report.html`: both scores with before/after, Polish by dimension, findings, paired screenshots) and this summary:

```text
UI elevate: <scope> (<surface>)
Static:  <before> → <after>/100   <PASS | FAIL>
Polish:  <before> → <after>/100   <band>; weakest: <dimension> <score>/4

What changed
- <move>: <screens>, <dimension>

Needs you
- <assets, approvals or decisions still open>

Assumptions
- <brand or content choices made without the owner, marked "assumed" in design.md>
```
