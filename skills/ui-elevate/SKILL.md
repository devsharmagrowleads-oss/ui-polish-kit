---
name: "ui-elevate"
description: "Elevate a working interface to a premium, professionally designed one: baseline the static and Polish scores with screenshots, critique each page like a design lead, plan ranked improvements to hierarchy, typography, spacing, colour, surfaces, components, imagery, motion, copy, consistency and the conversion or activation journey, apply them within the brand, re-measure and produce a shareable HTML report. Use when asked to make a UI look premium, professional, polished, more designed or less generic, to redesign or remap an existing site or app, or to raise its Polish score."
argument-hint: "[pages, flows or URL to elevate]"
---

# UI elevate

Raise a working interface to a premium one. Follow `${CLAUDE_PLUGIN_ROOT}/audit/ELEVATE.md` exactly; the Polish rubric is `${CLAUDE_PLUGIN_ROOT}/audit/POLISH.md`. In short:

1. Intake: read `design.md` (surface, assets, brand). If it is missing or incomplete, do the brand intake and ask the owner for missing assets first. `design.md` stays binding.
2. Baseline: `node ${CLAUDE_PLUGIN_ROOT}/audit/cli.mjs . --json > .ui-polish-audit/before.json`; screenshots of every page in scope at 375, 768 and 1440px, light and dark, into `.ui-polish-audit/before/`; score the 11 Polish dimensions (0 to 4) from them into `polish-before.json`.
3. Critique each page like a design lead: focal point, hierarchy, rhythm, craft, journey (conversion for marketing, activation for apps). Every point cites a screenshot.
4. Plan: rank moves by the weakest Polish dimensions, system-level first (tokens, type scale, spacing, shared components). Show the plan, any brand changes and any missing assets to the owner.
5. Apply: tokens, then shared components (recipes), then pages. Keep the static check passing. No slop: premium means restraint.
6. Re-measure into `.ui-polish-audit/` (same file names), re-score into `polish.json`, then `node ${CLAUDE_PLUGIN_ROOT}/audit/cli.mjs . --polish .ui-polish-audit/polish.json --before .ui-polish-audit/before.json --html .ui-polish-audit/report.html`.
7. Done when the static check passes, Polish is at least 80 and no dimension is below 2. Report both scores before and after, what changed, what needs the owner, and the HTML report.

If arguments were given, they name the scope: $ARGUMENTS
