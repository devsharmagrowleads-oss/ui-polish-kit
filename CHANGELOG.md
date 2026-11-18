# Changelog

All notable changes to ui-polish-kit. Versions follow [semantic versioning](https://semver.org); the release notes on GitHub have the full detail and links.

## Unreleased

- `screenshot.mjs --states`: captures the first control on hover and the first three keyboard focus stops, and records each element's transition and focus-ring styles in `report.json`, so the Polish "motion" dimension can be scored from evidence. `NO RING` flags focus stops with no visible indicator.
- `CHANGELOG.md` (this file).
- npm package metadata, so the kit can be run as `npx ui-polish-kit`.
- The landing page reached Polish 80 from an independent reviewer (63 → 70 → 80) without invented proof; motion was scored for the first time, from `--states` evidence.
- Eval repeatability: a second full run moved kit results by at most 1 point (baseline runs by up to 8). A second set of independent reviewers on the React app agreed within 2 points (75, 75, 73).

## 0.3.2 (2026-11-17)

- The Polish target was reached by an independent reviewer: the sample dashboard went 48 → 73 → 75 → 80 over four passes. Independent reviewers agree within 3 points; self-scoring runs 9–12 points high.
- `POLISH.md` lists what usually holds a page below 80: missing captured states, no first-run screen, no proof on marketing pages, clipped phone navigation. The worked example moved to `audit/POLISH-EXAMPLE.md`.
- Codex works with the kit through `AGENTS.md` (landing page 57 → 98). The core now tells agents never to stop at the brand intake in a non-interactive run.
- Checker: no UI files is an error instead of a silent pass; unused stylesheets are skipped and listed; AX-02's `focus-within` look-back stays inside the component; sites with published Markdown/MDX posts are detected as marketing; `--link-screenshots`.

## 0.3.1 (2026-11-17)

- Requires an independent Polish score before the elevate target counts as met; reports label who scored.
- About 42 false positives fixed after running the checker on four real open-source frontends (29 from AX-02); Open Graph image routes are no longer scanned as UI; surface detection recognises shops and landing pages.
- Fixes from an independent `/ui-elevate` run on a React app: field-wrapper labels, early-return headings, `::after` focus rings, router catch-all 404s, missing `og:image` files.
- Screenshot tool: `--storage-state` and `--init` for pages behind a sign-in; REDIRECTED and DARK = LIGHT warnings; file names keep the query string; writes `polish.template.json`.
- React recipes verified in Vite 8 + Tailwind 4 + React 19 (app-shell overflow and sidebar fixes); FirstRun paths can be in-page actions.
- GitHub Action (`action.yml`) with PR annotations, a job summary and the HTML report; CI for the kit itself.

## 0.3.0 (2026-11-17)

- Surface types (`marketing`, `app`, `both`): topics for one kind of product are skipped on the other.
- New topics: UX laws (UX), visual hierarchy (VH), launch assets with an owner-facing asset inventory (AS), landing pages and conversion (LP, marketing only), activation and first run (AC, app only).
- `/ui-elevate`: a premium pass for a working UI, with the Polish score (11 dimensions scored from screenshots) and a shareable HTML report.
- Marketing section and app recipes in React and plain HTML/CSS.

## 0.2.0 (2026-11-16)

- Data tables, charts, navigation, icons and internationalisation topics; HTML/CSS recipes.
- Modern Web Guidance for browser features.

## 0.1.0 (2026-11-15)

- First release: rules, React recipes, the static checker and the visual audit procedure, for Claude Code, Codex, Cursor, Windsurf, Copilot and Gemini CLI.
