---
topic: ux-laws
prefix: UX
title: UX laws
when: Designing any screen, flow or navigation; placing primary actions; deciding how many options, steps or fields to show; building multi-step forms, checkouts or onboarding; reviewing a page for usability before calling it done.
---

# UX laws

The laws of UX are findings from psychology and HCI research about how people perceive, decide and act on screens. Agents rarely break them on purpose; they break them by default: every option shown at once, three equal buttons, a phone field that rejects spaces, a five-step form with no sense of progress. Each rule below names the law, says what it means for an interface and gives a threshold you can check. Several laws are applied in more detail in other topics (proximity in SP-03, menu length in NV-07, touch targets in RS-05); this topic is the lens that ties them together. The names and research come from the published laws of UX (lawsofux.com, Jon Yablonski) and the original papers; the rules are written for this kit.

## UX-01 · Fitts's law: important targets are big and close
Severity: warning · Check: visual

**Rule.** Time to hit a target grows with distance and shrinks with size. Make the primary action the largest button in its group, placed where the eye already is: at the end of the form it submits, in the page header for page actions, in a sticky bar on long mobile pages. Pointer targets at least 24px, touch targets 44px (RS-05). Keep destructive actions at least a button's width from frequent ones, never beside Save, and confirm them (NC-07).

**Why.** A tiny Save link at the far side of a wide form is slow to hit and easy to miss; Delete next to Save gets clicked by accident. Users feel this as an interface that "fights them" without knowing why.

**Bad.**
```html
<form>…<div class="actions"><a class="text-xs">save</a> <button class="danger">Delete</button></div></form>
```

**Good.**
```html
<form>…
  <div class="actions"><button type="button" class="ghost danger">Delete invoice</button>
    <span class="spacer"></span><button type="button" class="secondary">Cancel</button><button type="submit">Save invoice</button></div>
</form>
```

**Check.** Visual: in each screenshot, find the primary action in under a second; measure target sizes on the 375px capture; check that no destructive button sits directly beside a frequent one.

## UX-02 · Hick's law: fewer, grouped choices
Severity: warning · Check: static

**Rule.** Decision time grows with the number of choices. Show at most seven or eight top-level navigation items (group the rest, NV-07), two or three pricing plans with one recommended, one primary and at most two secondary actions per view, and about seven menu options before grouping or adding search (NC-13). Put advanced options behind progressive disclosure.

**Why.** Every extra item is read, compared and rejected each time the screen is used. Long flat lists also hide the few items most people need.

**Bad.**
```html
<nav><a href="/">Home</a><a href="/a">Analytics</a><a href="/r">Reports</a><a href="/i">Invoices</a><a href="/c">Customers</a>
  <a href="/p">Products</a><a href="/t">Taxes</a><a href="/x">Exports</a><a href="/s">Settings</a><a href="/h">Help</a></nav>
```

**Good.**
```html
<nav aria-label="Primary"><a href="/invoices">Invoices</a><a href="/customers">Customers</a><a href="/products">Products</a>
  <a href="/reports">Reports</a></nav>
<nav aria-label="Account"><a href="/settings">Settings</a><a href="/help">Help</a></nav>
```

**Check.** Static: a `<nav>` outside the footer with more than eight top-level links (breadcrumbs, pagination and table-of-contents navs are skipped). Visual: count the choices on each screen; is one option clearly recommended where a choice is hard?

## UX-03 · Jakob's law: follow the conventions people already know
Severity: warning · Check: visual

**Rule.** Users expect your product to work like the others they use. Keep the conventions: logo top left, linking home; navigation along the top or left; search at the top; account menu and cart top right; links that look like links; a dialog close button at top right plus Escape; the primary dialog button on the right. Break one only with evidence, recorded in `design.md`.

**Why.** Every unfamiliar placement costs a moment of searching and a little trust. "Creative" navigation is the most common way a polished-looking site becomes hard to use.

**Bad.**
```html
<header><nav class="center">…</nav><img src="/logo.svg" alt="Ledgerly" class="logo-right"></header>
```

**Good.**
```html
<header><a href="/" class="logo"><img src="/logo.svg" alt="Ledgerly home"></a><nav aria-label="Primary">…</nav>
  <button type="button" aria-label="Search">…</button><button type="button" aria-label="Account menu">…</button></header>
```

**Check.** Visual: on the 1440px capture, the logo is top left and links home, navigation and search are where a first-time user would look, and body links are distinguishable from text without hovering.

## UX-04 · Miller's law: chunk information
Severity: warning · Check: visual

**Rule.** Working memory holds a handful of items. Chunk anything longer: forms into titled sections of three to seven fields (FM-09), settings into groups, long lists into labelled sections, and long numbers into groups (card numbers in fours, phone numbers by local convention, thousands separators, TY-07). Never make users remember something from a previous screen: repeat it in a summary.

**Why.** A 20-field form with no grouping looks like a wall and gets abandoned; "4242424242424242" is hard to check, "4242 4242 4242 4242" is easy.

**Bad.**
```html
<form><label>Name<input></label><label>Email<input></label><label>Company<input></label><label>VAT<input></label>
  <label>Street<input></label><label>City<input></label><label>Card<input></label><label>Expiry<input></label>…</form>
```

**Good.**
```html
<form><fieldset><legend>You</legend>…3 fields…</fieldset><fieldset><legend>Company</legend>…2 fields…</fieldset>
  <fieldset><legend>Billing address</legend>…</fieldset><fieldset><legend>Payment</legend>…</fieldset></form>
```

**Check.** Visual: no form section, settings group or unlabelled list on screen has more than about seven items; long numbers are grouped.

## UX-05 · Von Restorff effect: one thing stands out
Severity: warning · Check: visual

**Rule.** The item that differs is the one noticed. Give each view or region exactly one dominant action (filled primary); make the rest secondary (outline) or tertiary (ghost, link). Mark one recommended pricing plan only. Keep the accent for the one thing needing attention (CO-04), and do not rely on colour alone for the difference (AX-12). If everything is highlighted, nothing is.

**Why.** Three filled buttons side by side make the user stop and read all three. A page where every card has a "New" badge teaches people to ignore badges.

**Bad.**
```html
<div class="actions"><button class="primary">Export</button><button class="primary">Share</button><button class="primary">Create invoice</button></div>
```

**Good.**
```html
<div class="actions"><button class="ghost">Export</button><button class="outline">Share</button><button class="primary">Create invoice</button></div>
```

**Check.** Visual: squint at each screenshot; exactly one element per region should pull the eye, and it should be the most important one.

## UX-06 · Gestalt: things that look alike behave alike
Severity: warning · Check: visual

**Rule.** People group what looks alike (similarity), what shares a container (common region) and what is close (proximity, SP-03). So: anything that looks like a button acts like one; links share one style; clickable cards have a hover state and an affordance, static cards do not; chips that look alike mean the same thing everywhere; related controls share a container, unrelated ones do not.

**Why.** If a heading looks like a link, people click it; if two chips look alike but one is a filter and the other a status, people misread the screen. Grouping by container lets users scan a page in blocks instead of item by item.

**Bad.**
```html
<h3 class="text-primary underline">Overdue invoices</h3>
<span class="chip">Paid</span> <button class="chip">Paid ×</button>   <!-- a status and a filter look identical -->
```

**Good.**
```html
<h3>Overdue invoices</h3>
<span class="status status-success">Paid</span> <button type="button" class="filter-chip" aria-pressed="true">Paid <span aria-hidden="true">×</span></button>
```

**Check.** Visual: list every style that looks clickable and confirm each one is; confirm that items grouped in one container belong together.

## UX-07 · Serial position: first and last are remembered
Severity: info · Check: visual

**Rule.** The first and last items in a series are remembered best. Put the most-used navigation items first and the next most important last; lead sections with the main point and close with the call to action; put the key word first in labels, headings and menu items. Do not bury the item most people need in the middle of a long row.

**Why.** Users scan, and what sits in the middle of a list or a sentence is skipped. Front-loading puts the information where attention already is.

**Bad.**
```html
<nav><a href="/about">About</a><a href="/blog">Blog</a><a href="/app">Open app</a><a href="/careers">Careers</a><a href="/press">Press</a></nav>
```

**Good.**
```html
<nav aria-label="Primary"><a href="/app">Open app</a><a href="/pricing">Pricing</a><a href="/blog">Blog</a><a href="/about">About</a></nav>
```

**Check.** Visual: read only the first two words of each heading, label and menu item; the meaning should survive.

## UX-08 · Doherty threshold: respond within 400 ms
Severity: warning · Check: visual

**Rule.** Users stay in flow when the interface answers within about 400 ms. Acknowledge every action within 100 ms (pressed state, ST-01) and show a result or progress within 400 ms: a pending button that keeps its width (FM-08), a skeleton (ST-02), or an optimistic update for cheap, reversible actions (ST-06). Past about a second, say what is happening; past ten seconds, show a determinate `<progress>`.

**Why.** Without an immediate response users click again, double-submit or assume the app is broken. Perceived speed matters as much as measured speed.

**Bad.**
```tsx
<button onClick={async () => { await save(); setDone(true); }}>Save</button>   {/* nothing visible for 2 s */}
```

**Good.**
```tsx
<button type="submit" disabled={pending} aria-busy={pending}>{pending ? <><Spinner aria-hidden /> Saving…</> : 'Save'}</button>
```

**Check.** Visual: operate each action with network throttling ("Fast 4G" or slower); something visible must change within 400 ms of every click or keypress.

## UX-09 · Goal-gradient and Zeigarnik: show progress toward the goal
Severity: warning · Check: visual

**Rule.** People speed up near a goal and remember unfinished tasks. In any flow longer than one screen, show where the user is and what is left ("Step 2 of 4: Company details" or a labelled `<progress>`), name the next step on the button ("Continue to payment", not "Next"), tick off completed items in setup checklists, and save progress so the flow can be resumed. Merge steps rather than adding them.

**Why.** An open-ended flow feels endless and gets abandoned; a visible finish line and a named next step pull people through it.

**Bad.**
```html
<form><h2>Tell us more</h2>…<button type="submit">Next</button></form>
```

**Good.**
```html
<form aria-labelledby="step-title"><p id="step-label">Step 2 of 4: Company details</p>
  <progress max="4" value="2" aria-labelledby="step-label"></progress><h2 id="step-title">Company details</h2>…
  <button type="submit">Continue to billing</button></form>
```

**Check.** Visual: in every multi-step flow, the current step, the total and the next step are visible on each screen; reload midway and the entered data is still there.

## UX-10 · Postel's law: accept input the way people type it
Severity: warning · Check: static

**Rule.** Be liberal in what you accept, strict in what you store. Accept spaces, dashes and brackets in phone, card, IBAN and postcode fields and strip them before validating; accept emails with surrounding spaces; allow paste everywhere, including password and code fields; never block a keypress. A `pattern` on these fields must allow spaces (for example `[\d ]{13,19}` for card numbers).

**Why.** "Invalid phone number" for `+44 20 7946 0958` tells users they did something wrong when the form is at fault. Card numbers are printed in groups of four, so people type them that way.

**Bad.**
```html
<input type="tel" name="phone" autocomplete="tel" pattern="[0-9]{10}">
<input name="card" autocomplete="cc-number" pattern="\d{16}" maxlength="16">
```

**Good.**
```html
<input type="tel" name="phone" autocomplete="tel">   <!-- normalise on the server -->
<input name="card" autocomplete="cc-number" inputmode="numeric" pattern="[\d ]{13,19}" maxlength="19">
```

**Check.** Static: a `pattern` that does not allow spaces on a phone, card-number, IBAN or postcode field. Visual: type and paste each field the way it is printed on a card, a letter or a business card.

## UX-11 · Tesler's law: the product absorbs the complexity
Severity: info · Check: visual

**Rule.** Complexity cannot be removed, only moved: move it into the product. Pre-fill what you know (the user's name and company, country from the locale, today's date, the last-used option), offer defaults most users can accept, infer instead of asking (card type from the number, city from the postcode), and make fields optional where you can (FM-06).

**Why.** Each question you could have answered yourself costs the user time and is a chance for them to give up.

**Bad.**
```html
<fieldset><legend>Card type</legend>…Visa / Mastercard / Amex radios…</fieldset><label>Card number<input autocomplete="cc-number"></label>
```

**Good.**
```html
<label>Card number<input autocomplete="cc-number" inputmode="numeric"></label>   <!-- card type shown as an icon, detected from the number -->
```

**Check.** Visual: for each form field, ask "could the product have known or guessed this?" If yes, it should be pre-filled or removed.

## UX-12 · Peak-end rule: design the best moment and the ending
Severity: info · Check: visual

**Rule.** People judge an experience by its peak and its end. Design the peak of each flow (first invoice sent, order placed): a confirmation that says what happened and offers the next step (ST-05), not a bare "Success". Design the endings too: the last onboarding step, checkout confirmation, cancellation, the 404 page (FD-05). Make the worst moments, errors and failed payments, calm and helpful (CP-05).

**Why.** A flow that ends on a blank "Done" or a generic error is remembered as worse than it was, even if every step before worked.

**Bad.**
```tsx
{sent && <p>Success!</p>}
```

**Good.**
```tsx
{sent && <section role="status"><h2>Invoice INV-0142 sent to Dana Okafor</h2><p>We'll email you when it's opened.</p>
  <a href="/invoices/0142">View invoice</a> <a href="/invoices/new">Create another</a></section>}
```

**Check.** Visual: capture the final screen of every flow and the main error states; each should say what happened and offer the next step.
