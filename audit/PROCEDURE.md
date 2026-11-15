# UI audit procedure

For an AI coding agent reviewing an interface it built or was asked to audit. Follow the steps in order. `<kit>` is the kit root named in your entry file (`.ui-polish` in an installed project, the plugin root in Claude Code). Rule IDs such as `NC-01` are explained in `<kit>/rules/` (rule, why, bad and good example, how to check); `<kit>/audit/CHECKLIST.md` lists every rule in one page.

The audit has two halves because they catch different things. The static checker reads source and finds mechanical defects with file and line. The visual pass looks at the rendered app and finds what source cannot show: spacing, hierarchy, overflow, contrast, popups, dark mode. A passing static check with no visual pass is not an audit.

## 0. Scope

Write down, before starting: which pages or components are in scope (for a self-audit: everything the task touched; for a requested audit: what the owner named, or every route); how to start the app (`package.json` scripts, README); and whether `design.md` exists. If it does, read it now: several checks compare the UI against it. If it does not, that is finding BR-01, and the first fix is to do the intake in `<kit>/rules/15-brand-intake.md`.

## 1. Static check

```bash
node <kit>/audit/cli.mjs .            # human-readable
node <kit>/audit/cli.mjs . --json     # machine-readable: findings[], counts, score, pass
```

Record the score and the counts. Do not fix anything yet unless the app will not start. Exit code 0 is pass, 1 is fail, 2 is a usage or config error.

How the static score works: start at 100; each error costs 5, each warning 2, each info 0.5; one rule can cost at most three times its weight however often it fires; pass requires zero errors and a score of at least 85 (`minScore`).

## 2. Run the app and capture screenshots

Start the dev server (or open the built files). For each page in scope capture six screenshots: widths 375, 768 and 1440, each in light and dark.

```bash
node <kit>/audit/screenshot.mjs http://localhost:3000/ http://localhost:3000/settings
# writes .ui-polish-audit/<page>-<width>-<theme>.png and report.json
# (horizontal overflow per viewport, console errors). Needs `playwright` or `playwright-core`
# in the project: npm i -D playwright-core  (uses installed Chrome or Edge).
```

If you have a browser tool instead (Playwright MCP, Chrome DevTools MCP, the Claude in Chrome extension, Cursor's browser), use it: resize to each width, switch theme (toggle the app's theme control, or emulate `prefers-color-scheme`, or add class `dark` / `data-theme="dark"` to `<html>`, whichever the app uses), take a full-page screenshot. If no browser is available, stop and tell the owner the visual half could not be run; do not guess.

Then capture the states that are not visible by default, at least at 375 and 1440: every dropdown, select, date picker, menu and dialog open; a form after submitting it empty; an empty list; a loading view (throttle the network); an error view (block the request or go offline).

**Look at every image.** Opening the file is the step; a screenshot nobody examined verifies nothing.

## 3. Visual checklist

Mark each item pass, fail or n/a. Items marked **[B]** are blockers: a fail on any of them fails the audit regardless of score. Note the screenshot and the element for each fail.

### At every width, both themes
1. **[B]** No browser-default control is visible: selects, date/time pickers, file inputs, checkboxes, radios, sliders, scrollbars, tooltips, alert/confirm boxes. Open each popup to check its list or calendar. (NC-01 to NC-13)
2. **[B]** No horizontal page scroll and nothing clipped or overlapping. (RS-02, RS-03)
3. **[B]** Text contrast: body, muted text, text on primary, text on tinted surfaces and placeholder-like labels are readable; borders of inputs are visible. (AX-09, CO-06)
4. Fonts are the ones in `design.md`, loaded (not a fallback), with a clear hierarchy of at most five or six sizes on screen. (TY-01, TY-02, TY-05)
5. Paragraph lines are 45 to 75 characters; headings do not wrap awkwardly. (TY-06)
6. Spacing uses few distinct values; the same component has the same padding everywhere; groups are separated by more space than items within them. (SP-01, SP-02, SP-03)
7. Left edges line up; content sits in a container with a gutter; card rows align. (SP-04, SP-05, SP-06)
8. Nothing from the slop list: purple-blue gradients, gradient text, emoji icons, glass panels, glow shadows, three identical feature cards, everything centred, oversized radii, invented metrics, decorative blobs. (SL-01 to SL-12)
9. Colour: one primary action per region; brand colour used sparingly; red/green/amber only for error/success/warning. (CO-03, CO-04)
10. One icon set, consistent size and stroke. (SL-04)
11. Copy is real and specific: no lorem ipsum, filler names, "Submit", "Something went wrong"; sentence case; numbers and dates formatted. (CP-01 to CP-07, TY-07)
12. Images have the right aspect ratio, are sharp, and none is broken. (FD-04)

### At 375px
13. **[B]** The layout is a real mobile layout: single column, readable sizes, sensible order, reduced padding. (RS-04)
14. **[B]** Navigation is usable (menu button or tab bar) and tables have a small-screen form. (RS-06, RS-07)
15. Touch targets are at least 44px with space between them. (RS-05)
16. Dialogs, popovers and the date picker fit the viewport. (FD-08, NC-12)

### Dark theme
17. **[B]** Every surface, popup and control is dark: no white rectangles, no light scrollbars, no light autofill. (DM-01, DM-04, NC-09, NC-10)
18. Layers are distinguishable (page, card, popover, dialog); borders visible; primary and status colours readable. (DM-05)
19. Logos, illustrations, charts and screenshots work on the dark background. (DM-06, CO-05)

### States (captured in step 2)
20. **[B]** Each interactive element shows hover, focus-visible, active and disabled. (ST-01, AX-01)
21. Loading uses skeletons or in-place indicators and does not shift the layout. (ST-02, FD-10)
22. Empty states explain and offer an action. (ST-03, CP-06)
23. Errors appear where they happen with a way forward; form errors sit under their fields. (ST-04, FM-04, CP-05)
24. Success is confirmed; toasts are placed and timed sensibly. (ST-05, FD-07)

### Document and finishing
25. Tab shows a real title and the favicon; a nonsense URL shows the designed 404. (FD-01, FD-02, FD-05)
26. The UI matches `design.md`: colours, fonts, radius, density, tone. (BR-05)

## 4. Interaction pass

27. **[B]** Keyboard only: Tab through each page. Focus is always visible, order is logical, Enter/Space activate, Escape closes overlays and focus returns to the trigger; nothing is unreachable. (AX-10, AX-04)
28. Forms: labels visible; validation on blur; submit shows progress and cannot double-submit; input preserved on failure. (FM-01, FM-03, FM-08)
29. Resize continuously from 320 to 1440px: nothing breaks between the three capture widths. Console shows no errors. (RS-03)

For contrast, measure rather than judge when in doubt: in a browser tool, read computed `color` and `background-color` of the element and compute the WCAG ratio; 4.5:1 for text, 3:1 for large text, input borders and focus rings.

## 5. Score

- **Static score**: from step 1 (0 to 100).
- **Visual score**: `round(100 × passed / (passed + failed))` over the 29 items, ignoring n/a.
- **Verdict: PASS** only if the static check passes, no **[B]** item fails, and the visual score is at least 90. Otherwise **FAIL**.

## 6. Fix

Fix in this order, because earlier fixes remove later findings:

1. Missing `design.md` and tokens (BR, TK-05): everything else depends on them.
2. Static errors, then blockers from the visual list.
3. Static warnings and remaining visual fails.
4. Info findings that apply.

Fix the cause, not the symptom: replace the native select with the recipe component rather than hiding it; move the literal into a token rather than adding an ignore comment. Use the recipes in `<kit>/recipes/`. Do not weaken the config to pass (SA-02). If a finding is a deliberate, correct exception, suppress it on that line with a reason: `// ui-polish-ignore-next-line TK-01: brand logo colours are fixed by the trademark`.

## 7. Re-check

Re-run step 1. Re-capture the screenshots for every page you changed and re-walk the failed checklist items plus the blockers. Repeat steps 6 and 7 until the verdict is PASS or what remains needs the owner (missing assets, a product decision).

## 8. Report

Give the owner this, and nothing vaguer:

```text
UI audit: <scope>
Static:  <score>/100 — <e> errors, <w> warnings, <i> info  (before: <score>/100)
Visual:  <score>/100 — <p> pass, <f> fail, <n> n/a          (before: <score>/100)
Verdict: PASS | FAIL

Fixed
- <rule ID> <what and where>

Remaining
- <rule ID> <what, where, and what is needed to fix it>

Assumptions and suppressions
- <choices made without the owner; ignore comments added, with reasons>

Not verified
- <steps or states that could not be checked, and why>
```
