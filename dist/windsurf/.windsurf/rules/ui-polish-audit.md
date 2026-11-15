---
trigger: model_decision
description: "UI audit procedure (ui-polish-kit). Audit an interface: run the ui-polish static checker, screenshot the running app at mobile, tablet and desktop widths in light and dark, walk the checklist, score it, fix failures and re-check. Use when asked to review, audit, polish or QA a UI, when a UI looks generic or unfinished, and before reporting any UI task as done."
---

# UI audit

Follow the procedure in `.ui-polish/audit/PROCEDURE.md` exactly. In short:

1. Static check: `node .ui-polish/audit/cli.mjs .` (add `--json` for machine output). Record the score.
2. Start the app and capture every page in scope at 375, 768 and 1440px, in light and dark: `node .ui-polish/audit/screenshot.mjs <url>` or your browser tool. Capture open dropdowns, date pickers and dialogs, and the empty, loading and error states. Look at every image.
3. Walk the 29-item visual checklist in the procedure; mark pass, fail or n/a. Blocker items fail the audit on their own.
4. Keyboard pass, form pass, resize pass.
5. Score: static score from the checker; visual score = passed / (passed + failed). PASS needs a passing static check, no failed blocker and a visual score of at least 90.
6. Fix: design.md and tokens first, then errors and blockers, then warnings. Fix causes; do not weaken the config or add ignores without a reason.
7. Re-run the checker, re-capture, repeat until PASS or the remainder needs the owner.
8. Report: scores before and after, fixed, remaining, assumptions and suppressions, not verified.

Every rule ID is explained in `.ui-polish/rules/`; the one-page list is `.ui-polish/audit/CHECKLIST.md`.
