# Polish score

The static score says whether the obvious defects are gone. It cannot say whether a screen looks designed. The Polish score covers that: eleven dimensions, each scored 0 to 4 by looking at the screenshots from the visual audit (`audit/PROCEDURE.md`, step 2) against the anchors below. It is a judgement, so it is made only from evidence: every score names the screenshots it is based on and one sentence on why.

Use it in `/ui-elevate` (`audit/ELEVATE.md`) before and after, and optionally at the end of any audit.

## How to score

1. Capture every page in scope at 375, 768 and 1440px in light and dark, plus the open overlays and the empty, loading and error states.
2. For each dimension, compare the screenshots with the anchors. Score the **weakest important screen**, not the best one: a polished home page does not lift a generic settings page. Use 1 and 3 for "between the anchors".
3. Score a dimension `null` only when it truly cannot apply (no images anywhere, for example). The journey dimension uses the anchors for the project's surface (BR-06); for `both`, score the weaker of the two.
4. Write the result to `.ui-polish-audit/polish.json` (format below) and pass it to the checker: `node <kit>/audit/cli.mjs . --polish .ui-polish-audit/polish.json`. The checker validates it and prints the Polish score next to the static score.

Polish score = round(100 × sum of scores ÷ (4 × number of scored dimensions)).

| Polish score | Reads as |
| --- | --- |
| 90 to 100 | Premium: could be shown as a reference for the category |
| 80 to 89 | Polished: a professional designer would sign it off with small notes |
| 60 to 79 | Competent: works and is tidy, but generic; looks built from a kit |
| below 60 | Generic: reads as a template or an unfinished build |

`/ui-elevate` is done when the static check passes, the Polish score is at least 80, and no dimension scores below 2.

## The dimensions

| ID | Dimension | Rules it draws on | 0: generic | 2: competent | 4: premium |
| --- | --- | --- | --- | --- | --- |
| `hierarchy` | Hierarchy and focal point | VH-01 to VH-06, UX-05 | Everything has the same weight; the eye has nowhere to land; several elements compete | Each screen has a clear title and a primary action, but secondary content is as loud as primary | One unmistakable focal point per view; three clear levels; values before labels; passes the squint test at thumbnail size |
| `typography` | Typography | TY-01 to TY-08, VH-02, VH-07 | Default or habit font; sizes 1 to 2px apart; long lines; many weights | A chosen typeface and a scale, used mostly consistently | Typeface suits the product; a confident scale with real contrast between levels; comfortable measure and leading; tabular numbers; deliberate tracking on display sizes |
| `spacing` | Spacing and layout | SP-01 to SP-07 | Padding varies card to card; no grid; cramped or randomly loose | One scale used; groups mostly readable; alignment mostly right | Clear rhythm: generous, consistent section spacing; groups obvious from whitespace alone; shared edges everywhere; density matches the product |
| `colour` | Colour | CO-01 to CO-06, SL-01, SL-06 | Raw palette, accent everywhere, gradients by habit, poor contrast | A brand colour and neutrals, semantic colours used correctly | A restrained palette built from the brand; tinted neutrals do most of the work; accent rare and meaningful; both themes designed, not inverted |
| `surfaces` | Surfaces, depth and shape | SL-05, SL-09, DM-05, TK-07 | Heavy shadows or glass on everything, mixed radii, borders and shadows fighting | Consistent radius and one elevation style | A clear, quiet layering system (page, card, popover, dialog) that reads in both themes; radius and borders consistent and restrained |
| `components` | Component craft | NC-01 to NC-13, ST-01 to ST-07, FM-01 to FM-09, DT-01 to DT-08 | Browser-default controls; missing hover, focus, empty or error states | Themed controls and the main states present | Every control themed and complete; every state designed, including loading, empty and error; tables and forms feel engineered |
| `imagery` | Imagery, icons and assets | AS-01 to AS-05, IC-01 to IC-06, LP-04 | Placeholder or stock images, emoji or mixed icon sets, framework favicon | One icon set; real logo and favicon; few or neutral images | Real product visuals and on-brand imagery, cropped and framed with care; icons sized and aligned to text; complete icon set and social image |
| `motion` | Motion and feedback | MO-01 to MO-08, UX-08 | No feedback, or bouncing, slow and decorative animation | Short transitions on hover and overlays; pending states on actions | Every action answers within 100 ms; motion is quick, purposeful and consistent; view transitions between pages; reduced motion respected |
| `copy` | Copy and content | CP-01 to CP-07, SL-07, LP-01 | Lorem ipsum, slogans, "Submit", "Something went wrong" | Real, specific copy; buttons mostly say what they do | Copy is short, concrete and in one voice; headings carry the meaning; every message says what happened and what next |
| `consistency` | Consistency | NV-03, SP-02, IC-02, TK-08, CP-07 | Each screen looks designed by someone else | Shared components, minor drift between screens | Every page uses the same header pattern, spacing, components and voice; nothing feels one-off |
| `journey` | Journey: conversion (marketing) or activation (app) | Marketing: LP-01 to LP-08. App: AC-01 to AC-07, UX-09, UX-12 | Marketing: vague hero, competing calls to action, no proof. App: a new account sees zeros and empty charts | Marketing: clear hero and call to action, some proof. App: designed empty states, a way to start | Marketing: passes the five-second test, proof beside each claim, pricing easy to choose from, the goal is asked for at each decision point. App: designed first run, fast path to the first success, setup checklist, helpful returning-user home |

## `polish.json`

```json
{
  "assessedAt": "2026-11-17",
  "pages": ["/", "/invoices", "/settings"],
  "dimensions": {
    "hierarchy":   { "score": 3, "note": "Invoices list has a clear title and action; settings sections all look equal.", "evidence": ["settings-1440-light.png"] },
    "typography":  { "score": 3, "note": "IBM Plex with a good scale; KPI labels too close in size to values.", "evidence": ["home-1440-light.png"] },
    "spacing":     { "score": 2, "note": "Card padding differs between home and invoices.", "evidence": ["home-375-light.png", "invoices-375-light.png"] },
    "colour":      { "score": 3, "note": "", "evidence": [] },
    "surfaces":    { "score": 3, "note": "", "evidence": [] },
    "components":  { "score": 4, "note": "", "evidence": [] },
    "imagery":     { "score": null, "note": "No imagery in scope.", "evidence": [] },
    "motion":      { "score": 2, "note": "", "evidence": [] },
    "copy":        { "score": 3, "note": "", "evidence": [] },
    "consistency": { "score": 2, "note": "", "evidence": [] },
    "journey":     { "score": 1, "note": "New account lands on a dashboard of zeros.", "evidence": ["home-empty-1440-light.png"] }
  }
}
```

Every dimension must be present. `score` is an integer from 0 to 4, or `null` for "does not apply" (give the reason in `note`). `evidence` lists screenshot file names from `.ui-polish-audit/`.
