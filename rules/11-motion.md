---
topic: motion
prefix: MO
title: Motion
when: Adding transitions, animations, hover effects, page or overlay entrances, loading indicators or scroll effects.
---

# Motion

Motion in an interface has three jobs: confirm that an action registered, show where something came from or went, and keep the user oriented while the layout changes. Motion that does none of these is decoration, and decoration that moves is a distraction. Generated UI tends to both extremes: no transitions at all (states snap), or fade-up-on-scroll on every section and a bouncing arrow. Keep it short, purposeful and optional.

## MO-01 · Transition specific properties, never `all`
Severity: info · Check: static

**Rule.** Name the properties: `transition-colors`, `transition-opacity`, `transition-transform`, or `transition-[color,background-color,border-color,box-shadow]`. Animate only `opacity` and `transform` for movement; never animate `width`, `height`, `top`, `left` or `margin` (use transforms, or grid-row tricks for height).

**Why.** `transition: all` animates everything that happens to change, including layout properties on resize and theme switch, which causes jank and a slow colour crawl when toggling dark mode.

**Bad.**
```css
.card { transition: all 0.3s; }
```

**Good.**
```css
.card { transition: box-shadow var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-out); }
```

**Check.** Static: `transition: all`, `transition-property: all`, `transition-all`.

## MO-02 · Durations are short
Severity: warning · Check: static

**Rule.** Use the duration tokens: `--duration-fast` 120ms for hover, press, focus, toggles and colour changes; `--duration-base` 180ms for popovers, menus, tooltips and small reveals; `--duration-slow` 280ms for dialogs, drawers and large surfaces. Nothing in the interface transitions for longer than about 400ms. Exits are faster than entrances (about 75%).

**Why.** A 700ms hover fade makes the product feel slow on every interaction; users perceive anything over about 300ms as waiting.

**Bad.**
```tsx
<button className="transition-colors duration-700">Save</button>
```

**Good.**
```tsx
<button className="transition-colors duration-(--duration-fast) ease-out">Save changes</button>
```

**Check.** Static: transition durations of 600ms or more. Visual: interact quickly with menus and dialogs; nothing lags behind the pointer.

## MO-03 · Respect `prefers-reduced-motion`
Severity: warning · Check: static

**Rule.** Include a global reduced-motion rule that removes animation and transition durations, and write large movements (slides, zooms, parallax, auto-playing carousels) so they become a simple fade or nothing when the user asks for reduced motion. In JS animation libraries read `useReducedMotion()` or wrap the app in `MotionConfig reducedMotion="user"`.

**Why.** Large or continuous motion triggers nausea and dizziness for people with vestibular disorders; the OS setting exists so they can turn it off.

**Bad.**
```css
.hero-art { animation: float 6s ease-in-out infinite; }
```

**Good.**
```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
}
```

**Check.** Static: the project animates but never references `prefers-reduced-motion`. Visual: enable "Reduce motion" in the OS (or DevTools Rendering) and reload.

## MO-04 · No looping attention-seekers
Severity: info · Check: static

**Rule.** Do not use infinite animations (`animate-bounce`, pulsing buttons, wiggling icons, shimmering borders, rotating gradients) on static content. Looping is reserved for real progress: a spinner or skeleton shimmer while something loads, and it stops when loading ends. Anything that moves for more than five seconds must be pausable.

**Why.** Peripheral motion pulls the eye involuntarily and never lets go; it makes the surrounding text harder to read.

**Bad.**
```tsx
<ChevronDown className="animate-bounce" />  <Button className="animate-pulse">Upgrade</Button>
```

**Good.**
```tsx
<ChevronDown aria-hidden />  <Button>Upgrade to Team</Button>
```

**Check.** Static: `animate-bounce`. Visual: leave the page idle for ten seconds; nothing is moving.

## MO-05 · Easing matches direction
Severity: warning · Check: visual

**Rule.** Things entering or responding to the user use an ease-out curve (fast start, gentle stop): `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`. Things moving between two on-screen positions use ease-in-out. Things leaving use ease-in or a plain fast fade. Never use `linear` except for continuous rotation and progress bars, and avoid the default `ease` and springy overshoot unless `design.md` calls for a playful tone.

**Why.** Ease-out feels responsive because most of the movement happens immediately. Linear motion looks mechanical; bounce on a settings panel reads as a toy.

**Bad.**
```css
.menu { transition: transform 300ms linear; }
```

**Good.**
```css
.menu { transition: opacity var(--duration-base) var(--ease-out), transform var(--duration-base) var(--ease-out); }
```

**Check.** Visual: record a screen capture at half speed of a menu and a dialog opening; movement decelerates into place.

## MO-06 · Animate only what helps
Severity: warning · Check: visual

**Rule.** Good uses: state changes on controls (colour, 1px press), overlays appearing from their trigger (fade plus 4 to 8px translate or 0.97 scale), items entering or leaving a list, accordion open and close, progress, drag feedback. Do not: fade or slide every section in on scroll, animate page load of static content, stagger a list of twenty items, animate text character by character, add parallax, or count numbers up from zero.

**Why.** Scroll-triggered reveals delay content the user scrolled to see and replay as noise on every visit; they are a stock generated-landing-page effect.

**Bad.**
```tsx
{sections.map((s, i) => <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2 }} />)}
```

**Good.**
```tsx
<PopoverContent className="origin-(--radix-popover-content-transform-origin) animate-pop-in">…</PopoverContent>
```

**Check.** Visual: for each animation, state which of the three jobs it does (feedback, origin, orientation). Remove the ones with no answer.

## MO-07 · Layout stays stable while things move
Severity: warning · Check: visual

**Rule.** Hover and focus effects never change an element's box size (no border-width or font-weight change on hover; reserve the border with a transparent one). Appearing elements (validation messages, banners, loaded content) either have reserved space or push content in one direction with a short height transition. Overlays are positioned outside the flow. Scroll position is preserved across updates.

**Why.** A row that grows 2px on hover makes the whole list shimmer as the pointer moves; content that jumps as a banner appears causes mis-clicks.

**Bad.**
```css
.tab:hover { font-weight: 700; border-bottom: 3px solid var(--primary); }
```

**Good.**
```css
.tab { border-bottom: 2px solid transparent; }
.tab:hover, .tab[aria-selected="true"] { border-bottom-color: var(--primary); color: var(--foreground); }
```

**Check.** Visual: sweep the pointer across lists, tabs and nav; nothing shifts. Trigger each inline message and watch neighbouring content.
