# Examples: before and after

The same "new invoice" screen twice. Open each `index.html` in a browser; no build step.

| | `before/` | `after/` |
| --- | --- | --- |
| Static check | `node audit/cli.mjs examples/before`: fails, score 0, about 160 findings across 50 rules | `node audit/cli.mjs examples/after`: passes, 100/100, no findings |
| At 375px | page is 1100px wide and scrolls sideways | single-column layout, 44px controls, menu button |
| Dark mode | none | token-based, follows the OS, switchable |

`before/` is what an agent commonly produces unprompted: system font, purple-to-blue gradient, gradient headline, emoji icons, glass cards, three identical lorem-ipsum feature cards, placeholders instead of labels, and every native control left at the browser default (select, date, time, file, range, colour, checkbox, radio), plus `alert()` and `confirm()`.

`after/` follows the rules: brand intake recorded in `design.md`, tokens in `styles/tokens.css`, IBM Plex chosen for a finance tool, labelled fields with inline validation, a themed calendar popover, a dropzone, a styled slider and swatches, a real dialog and toast, focus rings, reduced-motion support, favicon, meta and social tags, a 404 page.

Each folder also has `src/InvoiceForm.tsx`: the same screen in React + Tailwind, the sloppy way and with the kit's recipes. These files are not wired to a build; they show the component-level patterns and exercise the checker's JSX and Tailwind detectors.

One honest limitation: the static `after` page uses the restyled native `<select>` pattern (the `NativeSelect` recipe), so its open option list is still drawn by the OS, following `color-scheme`. In a React project use the `Select` recipe, as `after/src/InvoiceForm.tsx` does, so the list is themed too.

Both folders are test fixtures: `tests/checker.test.mjs` asserts that `before` fails with the expected rule IDs and that `after` produces no findings.
