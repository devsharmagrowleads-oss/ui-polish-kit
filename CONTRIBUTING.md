# Contributing

Thanks for helping. The most useful contributions are new rules for defects you have seen agents ship, detectors with a low false-positive rate, and recipes for controls the kit does not cover yet.

## Ground rules

- `rules/` is the only place rule text lives. Never edit `skills/`, `dist/`, `.claude-plugin/`, `audit/rules-index.json` or `audit/CHECKLIST.md` by hand: they are generated. Run `npm run build` and commit the result with your change. CI can enforce this with `npm run build:check`.
- No runtime dependencies in the checker, build or installer. Node 20+ standard library only.
- Run `npm test` before opening a pull request.

## Adding or changing a rule

1. Pick the topic file in `rules/` (`NN-topic.md`). Add the rule at the end of the file with the next number for that prefix; IDs are permanent, so never renumber existing rules.
2. Use exactly this shape. The build fails with a specific message if a part is missing or out of order.

   ````md
   ## NC-14 · Short imperative title
   Severity: error · Check: visual

   **Rule.** What to do, stated so it can be followed without interpretation. Under 900 characters: this paragraph is what the short per-agent digests show.

   **Why.** The consequence for a real user or for the codebase. Reasons make agents apply the rule to cases the example does not cover.

   **Bad.**
   ```tsx
   // the smallest example that shows the defect
   ```

   **Good.**
   ```tsx
   // the same thing done right, using tokens and recipes
   ```

   **Check.** How to verify it: what the static checker looks for, and what to look at in a screenshot or the running app.
   ````

3. If a topic only makes sense for one kind of product, add `surface: marketing` or `surface: app` to its frontmatter (the default is `all`). The checker skips those rules on projects of the other kind, and the entry files say so.
4. Severity: `error` for defects a user will hit or see immediately (default controls, broken keyboard access, unreadable text); `warning` for likely problems; `info` for advice.
5. Check: `static` only if you are adding a detector (next section). Otherwise `visual` (verified from screenshots or the running app) or `process` (about how the agent works).
6. Write for an LLM reader: be specific, give numbers and names, explain the reason, avoid "make it look good". If the rule mentions a recipe or another rule ID, the build verifies that the file and the ID exist.
7. If the rule belongs in the 41-item visual checklist, add it to `audit/PROCEDURE.md`. If it is important enough for the always-loaded core, edit `rules/_core.md`, and keep that file short: the entry files have a 12,000-character ceiling and the Windsurf files a 6,000-character one, both enforced by the build.

## Adding a static detector

1. Add the rule ID to `STATIC_RULE_IDS` in `audit/lib/run.mjs` and mark the rule `Check: static`. The build fails if the two disagree.
2. Implement it in `audit/lib/detect-file.mjs` (one file at a time) or `audit/lib/detect-project.mjs` (facts about the whole project). Call `report(ruleId, position, message)`; the message says what is wrong and what to do instead, in one line. Severity and title come from the rule file.
3. Keep false positives low. A detector should fire only on a pattern that is wrong in nearly every codebase. Use the helpers: comments are already masked, `findTags` / `attr` read tags in HTML, JSX, Vue and Svelte, `parseBlocks` / `declarations` read CSS, and `facts` holds project-wide knowledge (for example whether any stylesheet restyles `<select>`).
4. Tests, in `tests/checker.test.mjs`:
   - a case in "flags the incorrect twin" proving it fires;
   - a case in "does not flag correct or unrelated code" for the closest legitimate pattern;
   - if it should fire on the sloppy example, add the ID to the expected list for `examples/before` and add the defect there.
5. `examples/after` and `recipes/` must still produce zero findings. If your detector flags them, either they have a real defect (fix it) or the detector is too broad.

## Adding a recipe

Put it in `recipes/react-tailwind-shadcn/components/`. It must pass the kit's own checker (`node audit/cli.mjs recipes`), use only the token names in `tokens/tokens.css`, style every state (hover, focus-visible, active, disabled, invalid), use only `lucide-react` icons, and be listed in the recipes README. Reference it from the rule it supports.

## Adding an agent format

Formats are produced in `buildOutputs()` in `scripts/build.mjs` and installed by `scripts/install.mjs`. Check the agent's current documentation for the file location and frontmatter, add structural checks to `validateOutputs()`, add a case to the installer, and extend the tests in `tests/build.test.mjs`. Note in the pull request which documentation page you verified the format against.

## Reporting a false positive

Open an issue with the smallest snippet that triggers it, the rule ID and why the code is correct. A failing test case is even better.
