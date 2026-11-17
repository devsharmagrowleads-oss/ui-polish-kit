---
topic: activation
prefix: AC
title: Activation and first run
surface: app
when: Building what a new user sees after signup (first run, onboarding, setup checklist, tours), empty screens, invite flows, or the home screen for returning users.
---

# Activation and first run

In a product app the equivalent of a landing page's conversion is activation: a new user reaching the moment where the product proves its worth (the first invoice sent, the first report built) before they lose interest. Agent-built apps are designed for a full database: a new account lands on a dashboard of zeros and empty charts, then a ten-step modal tour. These rules apply only to app surfaces (BR-06). They build on empty states (ST-03, CP-06), progress (UX-09) and the peak-end rule (UX-12).

## AC-01 · The first screen is designed for a new account
Severity: error · Check: visual

**Rule.** Design the first screen a brand-new user sees as its own state, not the full dashboard with zeros. It names the one most valuable first action ("Create your first invoice") as the primary button, offers a faster alternative where there is one (import from CSV or another tool, start from a template, explore with sample data), and hides charts, KPIs and tables that have nothing to show yet. Once the user has real data, the normal screen takes over.

**Why.** A dashboard of "0", "$0.00" and empty charts tells a new user nothing and suggests the product is broken. The first minute decides whether they come back.

**Bad.**
```tsx
<Dashboard>{kpis.map((k) => <Kpi key={k.id} label={k.label} value="0" />)}<RevenueChart data={[]} /></Dashboard>
```

**Good.**
```tsx
{hasInvoices ? <Dashboard /> : (
  <FirstRun title="Send your first invoice" description="Most people send one in under a minute."
    primary={<Button asChild><a href="/invoices/new">Create invoice</a></Button>}
    secondary={<><a href="/import">Import from CSV</a> <a href="/demo-data">Explore with sample data</a></>} />)}
```

**Check.** Visual: sign up with a fresh account (or clear the seed data) and screenshot every main screen; none shows a wall of zeros or empty charts.

## AC-02 · Reach the first success fast
Severity: warning · Check: visual

**Rule.** Identify the activation moment for the product (write it in `design.md`) and remove everything between signup and that moment that is not strictly needed: defer profile, team, billing and preference questions until after it; pre-fill with defaults (UX-11); let users try with sample data before connecting their own; keep any required setup to three steps or fewer with visible progress (UX-09). Celebrate the moment with a clear confirmation and the next step (UX-12), not confetti alone.

**Why.** Every screen before the first success is a place to quit. Users who reach value early stay; users asked for their company size, role and avatar first often never see it.

**Bad.**
```tsx
<Onboarding steps={['Profile', 'Company', 'Team size', 'Invite colleagues', 'Connect bank', 'Pick a theme', 'Done']} />
```

**Good.**
```tsx
<Onboarding steps={['Your business name', 'First invoice']} />   {/* team, bank and theme come later, from the setup checklist */}
```

**Check.** Visual: from signup, count the screens and fields before the activation moment; each one must be necessary for it.

## AC-03 · A setup checklist for the rest
Severity: warning · Check: visual

**Rule.** Put deferred setup into a short checklist (three to six items) on the home screen: each item says the benefit ("Connect your bank so payments mark invoices paid"), links straight to the place to do it, ticks itself when done (detected, not self-reported), and shows progress ("2 of 5 done", UX-09). Order items by value. The checklist can be dismissed and stays dismissed; it disappears by itself once complete, after confirming completion.

**Why.** A checklist turns setup into visible progress the user can finish on their own schedule, and keeps the important steps from being forgotten once the first-run screen is gone.

**Bad.**
```tsx
<Banner>Finish setting up your account!</Banner>
```

**Good.**
```tsx
<SetupChecklist title="Get paid faster" done={2} total={5} onDismiss={dismiss}>
  <ChecklistItem done href="/invoices/new">Send your first invoice</ChecklistItem>
  <ChecklistItem href="/settings/bank">Connect your bank so payments mark invoices paid</ChecklistItem>…
</SetupChecklist>
```

**Check.** Visual: complete one item in another tab and reload; it is ticked. Dismiss the checklist and reload; it stays gone.

## AC-04 · Empty states show the way forward
Severity: warning · Check: visual

**Rule.** Every list, table, board and chart has a designed empty state (ST-03) that distinguishes "nothing yet" from "nothing matches your filters" and "you don't have access". The first kind explains what will appear here and why it is useful, in one sentence, with a primary action to create the first item and, where useful, import or a sample. The second offers to clear the filters. Use a small, on-brand illustration or icon, never a large stock image.

**Why.** Empty screens are where new users spend their first minutes. A blank table or "No data" is a dead end; a good empty state is the shortest onboarding there is.

**Bad.**
```tsx
{rows.length === 0 && <p>No data</p>}
```

**Good.**
```tsx
{rows.length === 0 && (filtered
  ? <EmptyState title="No invoices match these filters" action={<Button variant="outline" onClick={clearFilters}>Clear filters</Button>} />
  : <EmptyState title="No clients yet" description="Add a client once and reuse their details on every invoice."
      action={<Button asChild><a href="/clients/new">Add client</a></Button>} />)}
```

**Check.** Visual: screenshot every main list empty, and filtered to nothing; each has its own message and action.

## AC-05 · Help in context, not tours
Severity: warning · Check: visual

**Rule.** Prefer contextual help to product tours: an inline hint next to a feature the first time it is relevant, a short description in the empty state, a "?" link to the right help article. If a tour is genuinely needed, keep it to three steps or fewer, start it only on request or on first visit to that screen, make it skippable at every step and never show it again once dismissed (remember this per user, on the server). Never block the interface with a modal tour on first login.

**Why.** Users skip modal tours, then miss the information. Help shown at the moment of need is read and remembered.

**Bad.**
```tsx
useEffect(() => { startTour(allTwelveSteps); }, []);   // on every login, blocking the screen
```

**Good.**
```tsx
{!seen('reminders-hint') && <InlineHint onDismiss={() => markSeen('reminders-hint')}>Reminders go out 3, 7 and 14 days after the due date. <a href="/help/reminders">Change the schedule</a></InlineHint>}
```

**Check.** Visual: sign in twice as a new user; nothing blocks the screen on the second visit, and every hint can be dismissed for good.

## AC-06 · Invite and share when there is something to share
Severity: info · Check: visual

**Rule.** Ask users to invite teammates or share their work after they have created something worth sharing, not during signup: offer "Invite your accountant" after the first invoice, "Share this report" when a report is built. Make the invite form accept several emails at once, show pending invites with resend and revoke actions, and let invitees land straight on the shared item with context about who invited them.

**Why.** An invite asked for before the product has proved itself is ignored; one offered at the moment of value is what spreads a product inside a company.

**Bad.**
```tsx
<SignupStep title="Invite your team" required />
```

**Good.**
```tsx
{invoice.sent && <Callout>Want your accountant to see this? <Button variant="outline" onClick={openInvite}>Invite accountant</Button></Callout>}
```

**Check.** Visual: find each invite prompt; it appears after a success, never as a required signup step.

## AC-07 · Returning users land where they left off
Severity: info · Check: visual

**Rule.** After the first run, the home screen serves returning users: what needs attention now (overdue items, mentions, failed jobs), recently opened items, and the most frequent action. Restore the last workspace, filters and view (NV-06). When something changed since the last visit, say what ("3 invoices were paid since Monday"). Do not show onboarding content to users who have finished it.

**Why.** Activation is not a one-off; people come back if the product picks up where they were and tells them what matters today.

**Bad.**
```tsx
<Home><WelcomeBanner /><GettingStartedVideo /><AllFeaturesGrid /></Home>
```

**Good.**
```tsx
<Home><NeedsAttention items={overdue} /><RecentItems items={recent} /><Button asChild><a href="/invoices/new">Create invoice</a></Button></Home>
```

**Check.** Visual: sign in as a user with a week of activity; the home screen shows their work, not the welcome content.
