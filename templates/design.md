# Design: <product name>

The brand and interface decisions for this project. AI agents and people building UI here must follow this file. If a decision is missing, add it here first (with a date in the decisions log), then build. Replace every `<…>`; write "none" or "assumed: <reason>" rather than leaving a blank.

## Product and audience
- What it is, in one sentence: <…>
- Who uses it, on what device, how often: <…>
- The main job a user comes to do: <…>

## Personality
- Three adjectives: <…>, <…>, <…>
- It is not: <e.g. playful, corporate, flashy>
- References we like (and what about them): <url: why>, <url: why>
- A reference we do not want to resemble: <url: why>

## Colour
| Role | Light | Dark | Source |
| --- | --- | --- | --- |
| Primary | <hex / oklch> | <…> | <logo / owner / assumed> |
| Primary foreground | <…> | <…> | contrast on primary: <ratio> |
| Neutral tint (hue) | <…> | <…> | |
| Destructive / success / warning / info | <…> | <…> | |
| Chart series (if any) | <…> | <…> | |

Measured contrast pairs (must be at least 4.5:1 for text): foreground on background <…>; muted-foreground on background <…>; primary-foreground on primary <…>.

## Typography
- Headings: <family, weights>. Body and UI: <family, weights>. Data and code: <family>.
- Why these: <one sentence>
- Loaded via: <next/font | self-hosted | Google Fonts link>
- Scale: <sizes in use, e.g. 12 14 16 18 20 24 30 36>

## Shape, elevation, density
- Radius base: <e.g. 8px>; full radius only for <pills, avatars>
- Elevation: <flat with borders | subtle shadows>
- Density: <compact (data tool) | standard | spacious (marketing)>; default control height <40px>

## Themes
- Supported: <light | dark | both, default follows OS>
- If light-only or dark-only, why: <…>

## Iconography and imagery
- Icon set: <one set, e.g. lucide>, stroke <2px>, sizes <16 / 20 / 24>
- Imagery: <real product screenshots | photography style | illustration style>; avoid <stock photos, generic 3D shapes>
- Logo files: <paths>; favicon source: <path>

## Voice and tone
- Rules: <e.g. plain, brief, sentence case, no exclamation marks, British spelling>
- Vocabulary: we say <workspace>, never <team/org>
- Examples: button "<Send invoice>"; error "<We couldn't send it: the address bounced. Check it and resend.>"; empty state "<No invoices yet>"

## Do not
- <e.g. no gradients, no emoji, no purple, no drop shadows on cards>

## Decisions log
- <YYYY-MM-DD>: <decision, who agreed>
