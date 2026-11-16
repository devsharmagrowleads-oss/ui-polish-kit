# Checklist: every rule

Generated from `rules/` by `scripts/build.mjs`. Do not edit. `static` rules are reported by `audit/cli.mjs`; `visual` rules are checked against screenshots and the running app; `process` rules are about how the work is done. Details for each ID are in the topic file.

## NC · Native controls (`rules/01-native-controls.md`)

- [ ] **NC-01** (error, static) Never ship a browser-default `<select>`
- [ ] **NC-02** (error, static) Date and time inputs use the project's picker, not the browser's
- [ ] **NC-03** (error, static) File inputs are hidden behind a styled trigger or dropzone
- [ ] **NC-04** (warning, static) Range sliders are styled
- [ ] **NC-05** (warning, static) Colour inputs use a themed picker
- [ ] **NC-06** (warning, static) Checkboxes, radios and switches use tokens
- [ ] **NC-07** (error, static) No `alert()`, `confirm()` or `prompt()`
- [ ] **NC-08** (warning, static) Tooltips are components, not `title` attributes
- [ ] **NC-09** (info, static) Scrollbars follow the theme
- [ ] **NC-10** (info, static) Autofill does not repaint inputs
- [ ] **NC-11** (error, visual) Dropdowns and selects: anatomy and behaviour
- [ ] **NC-12** (error, visual) Date pickers: anatomy and behaviour
- [ ] **NC-13** (warning, visual) Comboboxes and menus

## TK · Design tokens (`rules/02-design-tokens.md`)

- [ ] **TK-01** (error, static) No hard-coded colours outside the token file
- [ ] **TK-02** (warning, static) No Tailwind arbitrary values for spacing, type, radius or z-index
- [ ] **TK-03** (warning, static) Semantic colour utilities, not the raw palette
- [ ] **TK-04** (warning, static) Spacing values are on the 4px scale
- [ ] **TK-05** (error, static) A token file exists and is complete
- [ ] **TK-06** (warning, static) z-index comes from a scale
- [ ] **TK-07** (warning, visual) Name tokens by role, in two layers
- [ ] **TK-08** (warning, visual) Reuse the token; do not mint near-duplicates

## TY · Typography (`rules/03-typography.md`)

- [ ] **TY-01** (error, static) A real typeface is configured
- [ ] **TY-02** (warning, static) The font is chosen for this product, not by habit
- [ ] **TY-03** (warning, static) Fonts load without invisible text or layout shift
- [ ] **TY-04** (warning, static) One `<h1>`, no skipped heading levels
- [ ] **TY-05** (warning, visual) A real type scale with few sizes
- [ ] **TY-06** (warning, visual) Line height and line length are set for reading
- [ ] **TY-07** (warning, visual) Numbers are tabular and formatted
- [ ] **TY-08** (info, visual) Weight, tracking and case are used sparingly

## SP · Spacing and layout (`rules/04-spacing-layout.md`)

- [ ] **SP-01** (error, visual) One spacing scale, used for everything
- [ ] **SP-02** (error, visual) The same component always has the same padding
- [ ] **SP-03** (error, visual) Space shows relationship: inside less than outside
- [ ] **SP-04** (warning, visual) Elements share edges
- [ ] **SP-05** (error, visual) Content has a maximum width and a gutter
- [ ] **SP-06** (warning, visual) Layouts follow a grid
- [ ] **SP-07** (warning, visual) Density matches the product

## SL · AI-slop blocklist (`rules/05-ai-slop.md`)

- [ ] **SL-01** (error, static) No purple/indigo-to-blue gradients
- [ ] **SL-02** (warning, static) No gradient text
- [ ] **SL-03** (warning, static) No emoji as icons
- [ ] **SL-04** (warning, static) One icon set
- [ ] **SL-05** (warning, static) Glass is an exception, not a surface style
- [ ] **SL-06** (warning, static) No glows or coloured shadows
- [ ] **SL-07** (warning, static) No generic hero copy
- [ ] **SL-08** (warning, visual) Not three identical feature cards
- [ ] **SL-09** (warning, visual) Radius is restrained and consistent
- [ ] **SL-10** (warning, visual) Not everything is centred
- [ ] **SL-11** (warning, visual) No stock dashboard filler
- [ ] **SL-12** (info, visual) No decorative noise

## ST · Component states (`rules/06-component-states.md`)

- [ ] **ST-01** (error, visual) Every interactive element has hover, focus-visible, active and disabled
- [ ] **ST-02** (error, visual) Loading states keep the layout
- [ ] **ST-03** (error, visual) Empty states explain and offer the next action
- [ ] **ST-04** (error, visual) Errors are shown where they happen, with a way forward
- [ ] **ST-05** (warning, visual) Success is confirmed
- [ ] **ST-06** (info, visual) Optimistic updates for cheap, reversible actions
- [ ] **ST-07** (warning, visual) Selected, current and pressed are visible and exposed

## FM · Forms (`rules/07-forms.md`)

- [ ] **FM-01** (warning, static) Every input has a visible label
- [ ] **FM-02** (info, static) Inputs declare type, autocomplete and input mode
- [ ] **FM-03** (warning, visual) Validate at the right time
- [ ] **FM-04** (error, visual) Error messages sit under the field and say how to fix it
- [ ] **FM-05** (warning, visual) Field width matches the expected answer
- [ ] **FM-06** (warning, visual) Mark optional fields; ask for less
- [ ] **FM-07** (warning, visual) Password and number fields behave
- [ ] **FM-08** (error, visual) Submitting shows progress and cannot repeat
- [ ] **FM-09** (info, visual) Group, order and help

## RS · Responsive design (`rules/08-responsive.md`)

- [ ] **RS-01** (error, static) The viewport meta tag is present
- [ ] **RS-02** (warning, static) No fixed widths wider than a phone
- [ ] **RS-03** (warning, static) No horizontal scrolling at 320px
- [ ] **RS-04** (error, visual) The mobile layout is designed, not shrunk
- [ ] **RS-05** (error, visual) Touch targets are at least 44px
- [ ] **RS-06** (error, visual) Tables have a small-screen form
- [ ] **RS-07** (error, visual) Navigation has a small-screen form
- [ ] **RS-08** (warning, visual) Fluid media, viewport units and safe areas
- [ ] **RS-09** (warning, visual) Components respond to their container

## DM · Dark mode (`rules/09-dark-mode.md`)

- [ ] **DM-01** (warning, static) Dark values are defined for the tokens
- [ ] **DM-02** (info, static) No per-element `dark:` colour overrides
- [ ] **DM-03** (error, static) Never invert
- [ ] **DM-04** (info, static) `color-scheme` is set
- [ ] **DM-05** (error, visual) The dark palette is designed, not derived
- [ ] **DM-06** (warning, visual) Theme switching is correct

## AX · Accessibility (`rules/10-accessibility.md`)

- [ ] **AX-01** (error, static) A visible focus ring on everything focusable
- [ ] **AX-02** (error, static) Never remove an outline without replacing it
- [ ] **AX-03** (error, static) Images have alt text
- [ ] **AX-04** (error, static) Interactive things are real interactive elements
- [ ] **AX-05** (error, static) Zoom is never disabled
- [ ] **AX-06** (error, static) The document declares its language
- [ ] **AX-07** (warning, static) Icon-only controls have accessible names
- [ ] **AX-08** (warning, static) No positive `tabindex`
- [ ] **AX-09** (error, visual) Contrast meets AA
- [ ] **AX-10** (error, visual) Everything works from the keyboard
- [ ] **AX-11** (warning, visual) Semantic structure before ARIA
- [ ] **AX-12** (warning, visual) Not colour alone; announce changes
- [ ] **AX-13** (warning, visual) Works in forced-colours (high-contrast) mode

## MO · Motion (`rules/11-motion.md`)

- [ ] **MO-01** (info, static) Transition specific properties, never `all`
- [ ] **MO-02** (warning, static) Durations are short
- [ ] **MO-03** (warning, static) Respect `prefers-reduced-motion`
- [ ] **MO-04** (info, static) No looping attention-seekers
- [ ] **MO-05** (warning, visual) Easing matches direction
- [ ] **MO-06** (warning, visual) Animate only what helps
- [ ] **MO-07** (warning, visual) Layout stays stable while things move
- [ ] **MO-08** (info, visual) Page and view changes use view transitions

## CO · Colour (`rules/12-colour.md`)

- [ ] **CO-01** (error, visual) Build the palette from the brand colour
- [ ] **CO-02** (warning, visual) A tinted neutral scale does most of the work
- [ ] **CO-03** (error, visual) Semantic colours have fixed meanings and full pairs
- [ ] **CO-04** (warning, visual) The accent is rare
- [ ] **CO-05** (warning, visual) Data colours are a designed set
- [ ] **CO-06** (error, visual) Check every pair, in both themes

## FD · Finishing details (`rules/13-finishing-details.md`)

- [ ] **FD-01** (warning, static) Favicon and app icons
- [ ] **FD-02** (error, static) Title and description on every page
- [ ] **FD-03** (warning, static) Social preview tags and image
- [ ] **FD-04** (warning, static) Images reserve their space
- [ ] **FD-05** (info, static) A designed 404 page
- [ ] **FD-06** (warning, visual) Error pages and boundaries
- [ ] **FD-07** (warning, visual) Toasts are placed, timed and stacked
- [ ] **FD-08** (error, visual) Modals and overlays behave
- [ ] **FD-09** (warning, visual) Layers follow the z-index scale
- [ ] **FD-10** (warning, visual) No layout shift
- [ ] **FD-11** (warning, visual) Content resilience: long, short, many, none

## CP · Copy and microcopy (`rules/14-copy.md`)

- [ ] **CP-01** (error, static) No lorem ipsum
- [ ] **CP-02** (warning, static) No filler names, labels or sample data
- [ ] **CP-03** (info, static) No vague messages
- [ ] **CP-04** (warning, visual) Buttons say what they do
- [ ] **CP-05** (error, visual) Errors say what happened and what to do
- [ ] **CP-06** (warning, visual) Empty states teach
- [ ] **CP-07** (warning, visual) Consistent voice, case and formats

## BR · Brand intake (`rules/15-brand-intake.md`)

- [ ] **BR-01** (warning, static) `design.md` exists before UI work starts
- [ ] **BR-02** (error, process) Search the project before asking
- [ ] **BR-03** (error, process) Ask for what is missing, with options
- [ ] **BR-04** (warning, process) `design.md` is complete and concrete
- [ ] **BR-05** (error, process) `design.md` is binding

## SA · Self-audit gate (`rules/16-self-audit.md`)

- [ ] **SA-01** (error, process) No UI task is done without the audit
- [ ] **SA-02** (error, process) The static checker passes
- [ ] **SA-03** (error, process) Screenshot it and look
- [ ] **SA-04** (error, process) Operate it
- [ ] **SA-05** (warning, process) Report with the score and the gaps

## DT · Data tables (`rules/17-data-tables.md`)

- [ ] **DT-01** (warning, static) Tables are real tables
- [ ] **DT-02** (warning, visual) Columns are aligned by what they hold
- [ ] **DT-03** (warning, visual) Sorting is visible and announced
- [ ] **DT-04** (info, visual) The header stays and rows have a set density
- [ ] **DT-05** (error, visual) Every table has its states
- [ ] **DT-06** (warning, visual) Paging shows where you are
- [ ] **DT-07** (warning, visual) Selection and row actions are predictable
- [ ] **DT-08** (info, visual) Long and missing values are handled

## CH · Charts and data visualisation (`rules/18-charts.md`)

- [ ] **CH-01** (warning, visual) The chart answers one question
- [ ] **CH-02** (warning, visual) Colour comes from chart tokens and means something
- [ ] **CH-03** (warning, visual) Label directly; axes have units
- [ ] **CH-04** (error, visual) Scales are honest
- [ ] **CH-05** (error, visual) Readable without colour or sight
- [ ] **CH-06** (warning, visual) Charts have states and fit their box
- [ ] **CH-07** (info, visual) Interaction adds detail, not decoration

## NV · Navigation and page structure (`rules/19-navigation.md`)

- [ ] **NV-01** (error, visual) The current location is always marked
- [ ] **NV-02** (warning, static) Landmarks and a skip link
- [ ] **NV-03** (warning, visual) One page-header pattern
- [ ] **NV-04** (info, visual) Breadcrumbs for depth
- [ ] **NV-05** (error, static) Links go places, buttons do things
- [ ] **NV-06** (warning, visual) View state lives in the URL
- [ ] **NV-07** (warning, visual) The menu is short and grouped

## IC · Icons (`rules/20-icons.md`)

- [ ] **IC-01** (warning, visual) Icon size follows the text beside it
- [ ] **IC-02** (warning, visual) One style, and fill means "on"
- [ ] **IC-03** (warning, static) Decorative icons are hidden; meaningful ones have text
- [ ] **IC-04** (warning, visual) Icon plus label by default
- [ ] **IC-05** (info, visual) Icons align with their text
- [ ] **IC-06** (info, visual) Icons are delivered efficiently

## IN · Internationalisation and right-to-left (`rules/21-internationalisation.md`)

- [ ] **IN-01** (info, static) Logical properties, not left and right
- [ ] **IN-02** (warning, visual) Text can grow and wrap
- [ ] **IN-03** (warning, visual) Direction and language are declared; direction-aware icons flip
- [ ] **IN-04** (error, visual) Format with Intl, pluralise with rules
- [ ] **IN-05** (info, process) Strings live outside the components
- [ ] **IN-06** (warning, visual) Fonts and line height cover every script
