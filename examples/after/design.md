# Design: Ledgerly (example)

The brand decisions the "after" page follows. In a real project the agent writes this file during brand intake (rules/15-brand-intake.md) before any UI code.

## Product and audience
- An invoicing tool that sends payment reminders automatically.
- Freelancers and small studios; used a few times a week, on laptop and phone.
- Main job: send an invoice in under a minute and see who is late.

## Personality
- Precise, calm, plain-spoken.
- It is not: playful, salesy, flashy.

## Colour
| Role | Light | Dark | Source |
| --- | --- | --- | --- |
| Primary | oklch(0.43 0.085 195), deep teal | oklch(0.78 0.1 190) | assumed: example brand |
| Primary foreground | oklch(0.985 0.005 195) | oklch(0.18 0.03 195) | near-white on teal, about 7:1 |
| Neutral tint | hue 195, chroma 0.004 to 0.015 | same hue | derived from primary |
| Destructive / success | oklch(0.5 0.19 27) / oklch(0.47 0.12 155) | lighter, see tokens | |

No gradients. Brand colour is used for the primary action, selection and focus only.

## Typography
- IBM Plex Sans 400/500/600 for all UI and body text; IBM Plex Mono for invoice numbers.
- Why: an accounting tool; Plex reads as precise and has true tabular figures.
- Loaded from Google Fonts with `display=swap`, three weights only.
- Scale: 12, 14, 16, 18, 24, 30px.

## Shape, elevation, density
- Radius base 8px (cards, dialogs), 6px controls, 4px small parts; full radius for pills only.
- Flat surfaces with 1px borders; shadows only on popovers, dialogs and toasts.
- Standard density: 40px controls on desktop, 44px on phones.

## Themes
- Light and dark, following the OS by default, switchable and remembered.

## Iconography and imagery
- One outline icon style, 2px stroke, 16 and 20px. No emoji.

## Voice and tone
- Plain, brief, sentence case, British spelling, no exclamation marks.
- Button: "Send invoice". Error: "Enter an amount greater than zero, for example 1,250.00." Confirmation: "Invoice INV-2042 sent to dana@northwind.co".

## Decisions log
- 2026-03-09: static example uses the restyled native select pattern; the React version uses the Select recipe.
