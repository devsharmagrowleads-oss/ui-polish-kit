# UI polish: core rules

Apply these whenever you create or change user-interface code (pages, components, styles, copy). Agents fail at UI predictably: browser-default controls, the same font and purple gradient, uneven spacing, missing states, no dark mode, placeholder copy. This is the short version; the topic files below hold the detail (rule, reason, bad and good example, check). Read the relevant topic file **before** writing the code it covers.

Kit root: `{{KIT}}` (contains `rules/`, `recipes/`, `audit/`).

## Workflow, in this order

1. **Intake.** Find `design.md` in the project. If it does not exist, look for brand colours, fonts, logo and tone in the repo, ask the owner for what is missing, and write `design.md` from `{{KIT}}/templates/design.md`, with a `Surface:` line. Everything later follows it. (BR)
2. **Tokens.** Define colour, spacing, radius, shadow, type, z-index and motion tokens for light and dark before writing any component. Start from `{{KIT}}/recipes/react-tailwind-shadcn/tokens/tokens.css`. (TK, CO, DM)
3. **Build.** Use tokens and the recipes in `{{KIT}}/recipes/` only. Design the 375px layout first. (all topics)
4. **Self-audit.** Run the static checker, screenshot the result at 375 / 768 / 1440px in light and dark, look at the screenshots, fix what fails, re-check. Only then report the task as done, with the score. (SA)

## Non-negotiables

1. **No browser-default controls.** Never ship a bare `<select>`, `<input type="date|time|file|range|color">`, default checkbox/radio, `title=` tooltip, `alert()`/`confirm()`/`prompt()`, default scrollbar or autofill colour. Every control uses the project's tokens; dropdowns, date pickers, comboboxes and menus use the recipes. (NC)
2. **Tokens only.** No hex/rgb literals, raw palette utilities (`bg-blue-600`), or arbitrary values (`p-[13px]`, `z-[999]`) outside the token file. (TK)
3. **Deliberate typography.** Fonts come from `design.md`; if it names none, choose a pairing that fits the product from the list in the typography topic and record it. Never fall back to Inter, Roboto, Poppins, Geist or a system stack by habit. One type scale, real line-height, 45–75 character lines. (TY)
4. **One spacing scale.** Every padding, margin and gap is a step on the 4px scale; the same kind of component always uses the same padding; space inside a group is smaller than space between groups. (SP)
5. **No AI-slop defaults.** No purple/indigo-to-blue gradients, gradient text, emoji as icons, glass on every surface, three identical feature cards, glow shadows, everything centred, everything fully rounded, invented dashboard metrics, or generic hero copy. (SL)
6. **Every state exists.** Each interactive element has hover, focus-visible, active and disabled; each data view has loading (skeleton), empty, error and success. (ST)
7. **Forms are complete.** Visible labels, validation on blur with the message under the field, correct input types and autocomplete, a submit button that shows progress and cannot double-submit. (FM)
8. **Mobile is designed, not shrunk.** No horizontal scroll at 320px, 44px touch targets, tables and navigation have a small-screen form. (RS)
9. **Dark mode comes from tokens**, with `color-scheme` set; never from `filter: invert` or per-element `dark:` overrides. (DM)
10. **Accessible by construction.** 4.5:1 text contrast, visible `:focus-visible` ring, full keyboard operation, semantic elements, labels on icon buttons, `prefers-reduced-motion` respected. (AX, MO)
11. **Finished, not demo-ware.** Favicon, real `<title>` and description, social preview image, 404 page, images with dimensions and alt, one icon set, a z-index scale. (FD)
12. **Usable.** One focal point and one primary action per view; progress in multi-step flows. (UX, VH)
13. **Real words.** No lorem ipsum or filler names; buttons say what they do; errors say what happened and what to do next. (CP)

## Modern Web Guidance

These rules set the look; Modern Web Guidance picks the browser feature. Before a dialog, popover, menu, form validation, animation or performance fix, run `npx -y modern-web-guidance@latest search "<pattern>"`, then `retrieve "<id>"`, and use the native API and fallback it gives, styled with tokens, instead of custom JS or a library. If it suggests a control an NC rule restricts, NC wins unless tokens fully style it everywhere.

## Topic files (read on demand)

{{TOPICS}}

## Checking your work

- Static check: `node {{KIT}}/audit/cli.mjs .` (add `--json` for machine output). It reports `file:line`, rule ID, severity and a score; exit code 1 means fail. Fix every error, then warnings.
- Visual audit and scoring procedure: `{{KIT}}/audit/PROCEDURE.md`. Full checklist of every rule: `{{KIT}}/audit/CHECKLIST.md`.
- Exceptions need a reason beside them: `ui-polish-ignore-next-line <RULE-ID>: reason`, or a `rules` entry in `ui-polish.config.json`.

Do not say a UI task is complete until the static check passes and you have looked at the screenshots.
