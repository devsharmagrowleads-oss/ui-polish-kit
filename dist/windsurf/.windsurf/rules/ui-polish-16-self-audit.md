---
trigger: model_decision
description: "Self-audit gate rules (ui-polish-kit). Before reporting any UI task as done, before opening a pull request that touches UI, or when asked to review or audit an interface."
---

# Self-audit gate (SA)

This is the short form. Before writing code in this area, read the full rules with reasons, bad/good examples and checks: `.ui-polish/rules/16-self-audit.md`.

- **SA-01 No UI task is done without the audit** (error). For every task that creates or changes rendered UI, run the gate before reporting completion: static checker (SA-02), screenshots (SA-03), interaction pass (SA-04), fixes, re-check, report (SA-05). If something prevents a step (the app cannot be started, no browser tool is available), say exactly which step was skipped and why; never imply it was done.
- **SA-02 The static checker passes** (error). Run `node <kit>/audit/cli.mjs .` from the project root. Fix every error, then every warning; read info findings and fix the ones that apply. A finding may be suppressed only when the code is deliberately correct, with `ui-polish-ignore-next-line <ID>: reason`, and each suppression is listed in the report. Do not lower `minScore`, switch rules off, or add excludes to get a pass.
- **SA-03 Screenshot it and look** (error). Start the app and capture each changed page at 375, 768 and 1440px wide, in light and dark: six screenshots per page (`node <kit>/audit/screenshot.mjs <url>` or your browser tool). Open every image and inspect it against the visual checklist: alignment and spacing rhythm, type hierarchy, contrast, overflow, anything default-looking, anything that resembles the slop list. Also capture the non-default states: empty, loading, error, a filled form with validation errors.
- **SA-04 Operate it** (error). In the running app: Tab through each changed page from top to bottom (focus always visible, order logical); open every dropdown, select, date picker, menu, tooltip, dialog and toast, in both themes, and at 375px; submit each form empty, with invalid data and with valid data; trigger loading and error states; resize from 320 to 1440px watching for overflow. Read the browser console: no errors or warnings from your code.
- **SA-05 Report with the score and the gaps** (warning). End the task with a short audit report: static score and counts; visual checklist score (`audit/PROCEDURE.md`); what you found and fixed; what remains and why; assumptions made (fonts, colours, copy marked as draft); steps you could not perform. Be specific and include the unflattering parts.
