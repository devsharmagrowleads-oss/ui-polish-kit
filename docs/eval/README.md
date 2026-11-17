# Before and after: Claude Code with and without ui-polish-kit

Run on 2026-11-17 with `node scripts/eval/run.mjs`. Each prompt was given to Claude Code twice in an empty folder: once as is, once after `ui-polish install claude`. Both runs had the same tools (read, write, edit, search, and `node`; no `npx` or network lookups) and no user-level settings or plugins. Each result was scored by the kit's static checker (`audit/cli.mjs`, 0–100; 85 passes).

| Prompt | Score without | Score with kit | Errors | Warnings | Rules broken |
| --- | ---: | ---: | --- | --- | --- |
| dashboard | 51 | 94 | 12 → 0 | 4 → 3 | 11 → 4 |
| landing | 46 | 96 | 15 → 0 | 12 → 2 | 12 → 3 |
| signup | 36 | 96 | 15 → 0 | 4 → 2 | 14 → 3 |

Rule IDs broken:

- **dashboard**: without the kit: AS-03, BR-01, FD-01, FD-02, FD-03, FD-05, NC-09, NV-05, TK-01, TY-01, VH-07. With the kit: AS-02, BR-01, FD-03, FD-05. Fixed by the kit: AS-03, FD-01, FD-02, NC-09, NV-05, TK-01, TY-01, VH-07.
- **landing**: without the kit: AS-03, BR-01, FD-01, FD-03, FD-05, LP-07, NC-08, NV-05, SL-03, TK-01, TK-06, TY-01. With the kit: AS-02, FD-03, FD-05. Fixed by the kit: AS-03, BR-01, FD-01, LP-07, NC-08, NV-05, SL-03, TK-01, TK-06, TY-01.
- **signup**: without the kit: AS-03, BR-01, FD-01, FD-02, FD-03, FD-05, NC-01, NC-02, NC-10, NV-05, SL-01, TK-01, TY-01, TY-04. With the kit: AS-02, FD-03, FD-05. Fixed by the kit: AS-03, BR-01, FD-01, FD-02, NC-01, NC-02, NC-10, NV-05, SL-01, TK-01, TY-01, TY-04.

Prompts: [`scripts/eval/prompts.json`](../../scripts/eval/prompts.json). Raw numbers: [`results.json`](results.json).

**Limits.** One run per prompt, so individual numbers move between runs. The static checker sees code, not pixels: it cannot judge spacing rhythm or whether a page looks generic, which the kit's visual audit covers. The kit's own checker is the judge here, so the scores measure how well each result follows the kit's rules; the rule IDs above show what that means in practice.
