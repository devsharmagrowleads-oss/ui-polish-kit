---
topic: self-audit
prefix: SA
title: Self-audit gate
when: Before reporting any UI task as done, before opening a pull request that touches UI, or when asked to review or audit an interface.
---

# Self-audit gate

An agent that has not looked at its output does not know what it built. Code that compiles can still render a white dropdown on a dark page, a headline wrapping to five lines on a phone, or a dialog under its own backdrop. This gate makes looking mandatory. The full procedure, checklist and scoring are in `audit/PROCEDURE.md`; this file states what must be true before you say "done".

## SA-01 · No UI task is done without the audit
Severity: error · Check: process

**Rule.** For every task that creates or changes rendered UI, run the gate before reporting completion: static checker (SA-02), screenshots (SA-03), interaction pass (SA-04), fixes, re-check, report (SA-05). If something prevents a step (the app cannot be started, no browser tool is available), say exactly which step was skipped and why; never imply it was done.

**Why.** "Done" without verification transfers the checking to the owner, which is the work they delegated.

**Bad.**
```text
Agent: I've implemented the billing page with a clean, modern design. Let me know if you'd like changes!
```

**Good.**
```text
Agent: Billing page built. Static check: 0 errors, 0 warnings, score 100. Screenshots at 375/768/1440 in light and dark
reviewed; fixed two issues found there (plan cards overflowed at 375px; muted text failed contrast in dark).
Not verified: card-declined state, because the test payment API is not configured locally.
```

**Check.** Process: the final message contains checker results and a statement of what was looked at.

## SA-02 · The static checker passes
Severity: error · Check: process

**Rule.** Run `node <kit>/audit/cli.mjs .` from the project root. Fix every error, then every warning; read info findings and fix the ones that apply. A finding may be suppressed only when the code is deliberately correct, with `ui-polish-ignore-next-line <ID>: reason`, and each suppression is listed in the report. Do not lower `minScore`, switch rules off, or add excludes to get a pass.

**Why.** The checker finds the mechanical defects (default controls, literals, missing meta) in seconds, leaving attention for what only eyes can judge.

**Bad.**
```json
{ "rules": { "NC-01": "off", "TK-01": "off", "AX-02": "off" }, "minScore": 40 }
```

**Good.**
```text
$ node .ui-polish/audit/cli.mjs .
0 errors, 0 warnings, 1 info
Score 100/100 (minimum 85, fail on error)  PASS
```

**Check.** Process: exit code 0 from the checker on the final state of the code, with no new suppressions lacking a reason.

## SA-03 · Screenshot it and look
Severity: error · Check: process

**Rule.** Start the app and capture each changed page at 375, 768 and 1440px wide, in light and dark: six screenshots per page (`node <kit>/audit/screenshot.mjs <url>` or your browser tool). Open every image and inspect it against the visual checklist: alignment and spacing rhythm, type hierarchy, contrast, overflow, anything default-looking, anything that resembles the slop list. Also capture the non-default states: empty, loading, error, a filled form with validation errors.

**Why.** Layout, spacing and colour problems are invisible in source and obvious in a picture. Dark mode and 375px are where most defects are, and they are the two views nobody checks.

**Bad.**
```text
Agent: The layout should be responsive since I used Tailwind's responsive classes.
```

**Good.**
```text
Agent: At 375px light: nav collapses to menu button; hero headline wraps to 3 lines (ok); plan cards stack.
At 375px dark: "Most popular" badge text unreadable on the tinted surface: fixed by using text-accent-foreground.
```

**Check.** Process: screenshots exist for the three widths and two themes, and the report mentions specific observations from them.

## SA-04 · Operate it
Severity: error · Check: process

**Rule.** In the running app: Tab through each changed page from top to bottom (focus always visible, order logical); open every dropdown, select, date picker, menu, tooltip, dialog and toast, in both themes, and at 375px; submit each form empty, with invalid data and with valid data; trigger loading and error states; resize from 320 to 1440px watching for overflow. Read the browser console: no errors or warnings from your code.

**Why.** Popups, focus and validation only exist after interaction; a static screenshot of the closed state proves nothing about the open one.

**Bad.**
```text
Agent: (screenshots the page once at 1440px with all menus closed)
```

**Good.**
```text
Agent: Opened the plan select and billing-date picker in dark mode at 375px: both use the popover surface and fit
the viewport. Tabbed the form: focus ring visible on every control, Escape closes the picker and returns focus.
```

**Check.** Process: the report names the overlays opened and the keyboard pass.

## SA-05 · Report with the score and the gaps
Severity: warning · Check: process

**Rule.** End the task with a short audit report: static score and counts; visual checklist score (`audit/PROCEDURE.md`); what you found and fixed; what remains and why; assumptions made (fonts, colours, copy marked as draft); steps you could not perform. Be specific and include the unflattering parts.

**Why.** The owner needs to know what was verified in order to know what to look at. An unqualified "all done" hides exactly the gaps this kit exists to close.

**Bad.**
```text
Agent: Everything looks great and is fully responsive and accessible!
```

**Good.**
```text
Static: 100/100, 0 errors, 0 warnings. Visual: 27/29 checks pass.
Fixed: native select in filters → Select; 3 hard-coded greys → tokens; missing empty state on /clients.
Remaining: SL-08 (feature section is still three equal cards: needs real screenshots from you);
AX-09 (chart axis labels 3.9:1 in dark). Assumed: Figtree + Newsreader, recorded in design.md.
```

**Check.** Process: the final message has the four parts: scores, fixed, remaining, assumptions/unverified.
