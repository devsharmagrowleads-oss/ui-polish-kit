---
topic: landing-pages
prefix: LP
title: Landing pages and conversion
surface: marketing
when: Building or changing a marketing site, landing page, homepage, hero, pricing page, feature or product page, signup or lead-capture form, waitlist, or any page whose job is to explain the product and get a visitor to act.
---

# Landing pages and conversion

A landing page has one job: a visitor who has never heard of the product understands what it is, believes it, and takes the next step. Agent-built landing pages look busy and convert badly: a vague headline over a gradient, three icon cards, a testimonial from "Sarah K.", a pricing table with four equal plans and no answer to "is this for me?". These rules apply only to marketing surfaces (BR-06); product screens inside an app follow the activation topic instead. They build on the UX laws (UX-02, UX-05, UX-09) and on the slop rules for heroes and cards (SL-07, SL-08).

## LP-01 · The hero says what, for whom, and what to do
Severity: error · Check: visual

**Rule.** Without scrolling, at 375px and 1440px, the first screen shows: a headline that names what the product does in plain words (not a slogan, SL-07); one supporting sentence saying who it is for and the main outcome; one primary call to action that names the action ("Start free trial", "Book a demo") plus at most one secondary; and a visual of the actual product (LP-04). Keep the headline under about ten words and the supporting line under about 25.

**Why.** Visitors decide in seconds whether to stay. "Supercharge your workflow" says nothing; "Invoicing that chases late payments for you" tells the right people to keep reading.

**Bad.**
```html
<section class="hero"><h1>Supercharge your workflow</h1><p>The all-in-one platform for modern teams.</p>
  <a href="/signup">Get started</a><a href="/learn">Learn more</a><a href="/demo">Watch video</a></section>
```

**Good.**
```html
<section class="hero"><h1>Invoicing that chases late payments for you</h1>
  <p>For freelancers and small studios: send an invoice in a minute, and Ledgerly sends the reminders.</p>
  <a class="button" href="/signup">Start free trial</a> <a href="/demo">See a 2-minute demo</a>
  <img src="/images/app-invoice.webp" alt="The Ledgerly invoice editor" width="1200" height="760"></section>
```

**Check.** Visual: show the first screen to someone for five seconds; they can say what the product does, who it is for and what the button will do.

## LP-02 · One goal per page, asked for at every decision point
Severity: warning · Check: visual

**Rule.** Each landing page has one conversion goal (sign up, book a demo, join the waitlist) and every primary button on it serves that goal, with the same label. Repeat the call to action where a visitor is likely to decide: after the hero, after the proof section, after pricing, and at the end. Remove or demote competing exits (newsletter signup, social links, unrelated navigation) on dedicated campaign pages. On phones, keep the primary action reachable: a sticky bottom bar or a header button once the hero has scrolled away.

**Why.** Several goals split attention and lower each one's rate (UX-02, UX-05). A visitor convinced halfway down the page should not have to scroll back to the top to act.

**Bad.**
```html
<a href="/signup">Start free trial</a> … <a href="/newsletter">Subscribe</a> … <a href="/demo">Talk to sales</a> … <a href="/signup">Try it</a>
```

**Good.**
```html
<a class="button" href="/signup">Start free trial</a> … <a class="button" href="/signup">Start free trial</a> … <a class="button" href="/signup">Start free trial</a>
```

**Check.** Visual: list every primary button on the page; they share one destination and one label. At 375px, the primary action is never more than one swipe away.

## LP-03 · Proof sits next to the claim
Severity: warning · Check: visual

**Rule.** Back each major claim with evidence placed right beside it: customer logos (real, with permission, AS-04), testimonials with full name, role, company and photo, specific numbers with their source and date ("4,200 studios", "paid 11 days sooner on average, 2025 customer data"), ratings from named review sites, security and compliance badges you actually hold. Never invent any of it (CP-02, SL-11): if the owner has no proof yet, use the founder's story or a transparent beta note instead.

**Why.** Claims without evidence read as marketing; specific, attributed proof is what makes a visitor believe. Fake testimonials are spotted quickly and destroy trust in everything else on the page.

**Bad.**
```html
<blockquote>"This changed everything for our team!" <cite>Sarah K.</cite></blockquote>
```

**Good.**
```html
<figure><blockquote>"Our average payment time went from 34 days to 19."</blockquote>
  <figcaption><img src="/people/dana-okafor.webp" alt="" width="40" height="40"> Dana Okafor, studio lead, Northwind Studio</figcaption></figure>
```

**Check.** Visual: every testimonial names a real person and company; every number has a source; the owner has confirmed each one (record it in `design.md`).

## LP-04 · Show the real product
Severity: warning · Check: visual

**Rule.** Use real product screenshots or short recordings, cropped to the part that proves the point of the section, at native resolution, in a frame that matches the site's theme, with alt text describing what they show. Prefer one large, specific image per feature over icon grids (SL-08). Abstract illustrations, 3D blobs and stock photos of people at laptops do not count as showing the product (SL-12, AS-05). Keep screenshots current when the UI changes.

**Why.** People buy what they can see. A screenshot answers "what will I actually use?" faster than any paragraph, and it shows the product is real.

**Bad.**
```html
<div class="feature"><span class="icon">⚡</span><h3>Lightning fast</h3><p>Blazing performance for your team.</p></div>
```

**Good.**
```html
<section class="feature"><h2>Reminders send themselves</h2><p>Set the schedule once; Ledgerly emails late clients and stops when they pay.</p>
  <img src="/images/reminder-schedule.webp" alt="Reminder schedule with three emails, 3, 7 and 14 days after the due date" width="1100" height="640"></section>
```

**Check.** Visual: each feature section shows the product doing what the heading says.

## LP-05 · Pricing is easy to choose from
Severity: warning · Check: visual

**Rule.** Show two to four plans, with one marked as recommended (UX-05); name plans by who they are for; show the price with currency and period ("$12 per user / month, billed yearly"); if there is a monthly/yearly toggle, show which is selected and the saving in money, not only percent; list the three to five differences that matter first, with a full comparison table below; state what happens after a trial and whether a card is needed; and give the enterprise or custom option a clear next step rather than a bare "Contact us".

**Why.** Pricing is where most visitors drop out. Equal-looking plans, hidden billing periods and unclear trial terms make people leave to "think about it".

**Bad.**
```html
<div class="plans"><div class="plan">Basic $9</div><div class="plan">Pro $29</div><div class="plan">Team $79</div><div class="plan">Enterprise</div></div>
```

**Good.**
```html
<div class="plans"><article class="plan"><h3>Solo</h3><p>$9 / month</p>…</article>
  <article class="plan recommended" aria-label="Studio, recommended"><p class="badge">Most popular</p><h3>Studio</h3><p>$29 / month, billed yearly ($348)</p>…</article>
  <article class="plan"><h3>Agency</h3><p>From $79 / month</p><a href="/demo">Book a call</a></article></div>
<p>14-day free trial. No card needed. Cancel any time.</p>
```

**Check.** Visual: a first-time visitor can pick a plan and say what they will pay, when, and what happens after the trial.

## LP-06 · Answer the objections before they leave
Severity: info · Check: visual

**Rule.** Near the final call to action, answer the questions that stop people: an FAQ of five to eight real questions (price changes, data export, security, cancelling, support hours, who it is not for), visible contact options (email or chat, response time), and the guarantee or refund policy if one exists. Write answers in two or three sentences; link out for detail. Use a disclosure pattern (`<details>`) so the list stays short.

**Why.** Unanswered doubts become "I'll come back later", which usually means never. Answering them on the page converts the hesitant visitors who are already persuaded.

**Bad.**
```html
<section><h2>FAQ</h2><h3>Is it good?</h3><p>Yes!</p><h3>Question two</h3><p>Answer two.</p></section>
```

**Good.**
```html
<section aria-labelledby="faq"><h2 id="faq">Questions before you start</h2>
  <details><summary>Can I export my invoices if I leave?</summary><p>Yes. Export everything as CSV or PDF at any time, including after you cancel.</p></details>…</section>
```

**Check.** Visual: list the five most likely reasons not to sign up; each is answered on the page.

## LP-07 · Legal and contact links are present
Severity: warning · Check: static

**Rule.** Every marketing page links, usually from the footer, to a privacy policy, terms of service, and a way to contact the company (email or contact page); add a cookie notice only if the site sets non-essential cookies, and an imprint where the law requires one. Forms that collect personal data link to the privacy policy next to the submit button. Ask the owner for the legal text (AS-01); never generate legal text and present it as final.

**Why.** Missing privacy and terms pages are a legal risk in most countries, make payment providers and app stores reject the product, and make a page look like a scam to careful visitors.

**Bad.**
```html
<footer><p>© 2026 Ledgerly</p></footer>
```

**Good.**
```html
<footer><nav aria-label="Legal"><a href="/privacy">Privacy</a> <a href="/terms">Terms</a> <a href="/contact">Contact</a></nav><p>© 2026 Ledgerly Ltd</p></footer>
```

**Check.** Static: on a marketing surface, no privacy route or file and no link mentioning privacy anywhere in the project. Visual: the footer has privacy, terms and contact links on every page, and they lead to real pages.

## LP-08 · Lead forms ask for as little as possible
Severity: warning · Check: visual

**Rule.** A signup, waitlist or demo form on a landing page asks only what is needed for the next step: email alone for a waitlist or trial, email plus name and company size for a demo. Offer single sign-on ("Continue with Google") where the product supports it. Put the form's promise next to the button ("No card needed", "We'll reply within a day"). Ask everything else later, inside the product (FM-06, UX-11). Confirm submission on the page with what happens next (UX-12).

**Why.** Every extra field costs a share of signups. A visitor will give an email to try something; they will not fill in eight fields to find out whether they like it.

**Bad.**
```html
<form><input name="first"><input name="last"><input name="email"><input name="phone"><input name="company"><input name="role"><input name="size"><button>Submit</button></form>
```

**Good.**
```html
<form><label for="email">Work email</label><input id="email" type="email" autocomplete="email" required>
  <button type="submit">Start free trial</button><p>No card needed. <a href="/privacy">How we use your email</a></p></form>
```

**Check.** Visual: count the fields in every lead form; each one has a reason the owner agreed to. Submit it and check the confirmation.
