---
topic: copy
prefix: CP
title: Copy and microcopy
when: Writing any text a user will read - headings, button labels, form labels, error messages, empty states, toasts, placeholder data, meta descriptions.
---

# Copy and microcopy

The words are part of the interface. A button labelled "Submit", an error saying "Something went wrong" and a card full of lorem ipsum are unfinished UI in the same way an unstyled dropdown is. Write the real text as you build; if the facts are unknown (what the product does, what an error means), find out from the code, the README or the owner rather than filling the gap with filler. Take tone and vocabulary from `design.md`.

## CP-01 · No lorem ipsum
Severity: error · Check: static

**Rule.** Never leave lorem ipsum or any other dummy Latin in source. Where final copy is not available, write realistic draft copy for this product and mark it in your report to the owner as draft; a plausible sentence can be reviewed, placeholder Latin can only be replaced.

**Why.** Lorem ipsum hides whether the layout works with real sentence lengths, and it ships to production more often than anyone admits.

**Bad.**
```tsx
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
```

**Good.**
```tsx
<p>Reminders go out 3, 7 and 14 days after the due date. You can change the schedule per client.</p>
```

**Check.** Static: "lorem ipsum", "dolor sit amet", "consectetur".

## CP-02 · No filler names, labels or sample data
Severity: warning · Check: static

**Rule.** Do not ship "Your Company", "Feature One", "Card title", "Text goes here", "John Doe", "Acme Inc", "test@test.com" or bracketed stand-ins like "[Your tagline]". Sample and seed data should look like the product's real data: varied names from more than one culture, plausible amounts, dates relative to today, statuses in realistic proportions, a couple of edge cases (a very long name, an overdue item).

**Why.** Filler makes a product look like a template with the stickers still on. Uniform sample data ("User 1, User 2") hides layout problems that varied data exposes.

**Bad.**
```ts
const customers = [{ name: 'John Doe', email: 'test@test.com' }, { name: 'Jane Doe', email: 'test2@test.com' }];
```

**Good.**
```ts
const customers = [
  { name: 'Dana Okafor', company: 'Northwind Studio', email: 'dana@northwind.co', owed: 4200, daysLate: 31 },
  { name: 'Mateus Albuquerque-Fernandes', company: 'Fernandes & Filhos Lda.', email: 'mateus@ffilhos.pt', owed: 380.5, daysLate: 0 },
];
```

**Check.** Static: filler phrase list. Visual: read the sample data; it should be believable for the domain.

## CP-03 · No vague messages
Severity: info · Check: static

**Rule.** Replace "Click here", "Submit", "OK", "Something went wrong", "An error occurred", "Invalid input", "No data", "Oops!" with text that names the thing. Links describe their destination ("Read the API docs"); messages name the object and the state ("No invoices match 'north'").

**Why.** Vague text makes the user do the interpretation. Screen-reader users who navigate by a list of links hear "click here, click here, click here".

**Bad.**
```tsx
<a href="/docs">Click here</a> for docs.  <p>Something went wrong.</p>
```

**Good.**
```tsx
<a href="/docs">Read the setup guide</a>  <p>We couldn't send the invoice: the client's email address bounced. Check the address and resend.</p>
```

**Check.** Static: phrase list. Manual: read each message out of context; it should still make sense.

## CP-04 · Buttons say what they do
Severity: warning · Check: visual

**Rule.** Button labels are a verb plus the object, in sentence case, one to three words: "Create project", "Send invoice", "Delete 3 files". The label on a confirmation dialog's primary button repeats the action ("Delete project"), never "Yes" / "OK"; the secondary is "Cancel". A button that opens further steps ends with an ellipsis only if more input is required ("Export…"). Keep the same verb for the same action everywhere (not "Remove" here and "Delete" there for the same thing).

**Why.** People read the buttons, not the dialog body. "Are you sure? [Yes] [No]" requires reading the question; "[Cancel] [Delete project]" does not.

**Bad.**
```tsx
<DialogTitle>Are you sure?</DialogTitle> <Button>No</Button> <Button>Yes</Button>
```

**Good.**
```tsx
<DialogTitle>Delete "Website redesign"?</DialogTitle>
<Button variant="ghost">Cancel</Button> <Button variant="destructive">Delete project</Button>
```

**Check.** Visual: read only the buttons on each screen and dialog. Each one should tell you what will happen.

## CP-05 · Errors say what happened and what to do
Severity: error · Check: visual

**Rule.** An error message has two parts: what went wrong, in the user's terms, and the next step. No error codes, stack traces, or raw server messages as the main text (a code may follow in small print for support). Do not blame the user ("You entered an invalid…"); do not apologise at length. Field errors state the requirement ("Use at least 12 characters"), not the failure ("Password invalid").

**Why.** "Error 422: Unprocessable Entity" tells a user nothing they can act on, so they leave.

**Bad.**
```ts
toast.error(err.message);   // "Request failed with status code 409"
```

**Good.**
```ts
toast.error('That project name is already taken. Choose a different name.');
```

**Check.** Visual: trigger each error path (validation, conflict, network off, permission denied, server 500) and read the message as a first-time user.

## CP-06 · Empty states teach
Severity: warning · Check: visual

**Rule.** An empty state's title says what is missing ("No invoices yet"); the description says what the area is for or why it is empty, in one sentence; the button is the action that fills it. For filtered-empty, echo the query and offer to clear it ("No clients match 'zx'. Clear search"). Avoid jokes and exclamation marks unless `design.md` sets a playful voice.

**Why.** The empty state is the onboarding for that feature. "No data" teaches nothing.

**Bad.**
```tsx
<EmptyState title="Nothing here!" description="It's pretty empty in here…" />
```

**Good.**
```tsx
<EmptyState icon={Receipt} title="No invoices yet"
  description="Invoices you create appear here with their payment status."
  action={<Button>Create invoice</Button>} />
```

**Check.** Visual: view every empty state; a new user should know what the screen is for and what to press.

## CP-07 · Consistent voice, case and formats
Severity: warning · Check: visual

**Rule.** Use sentence case for headings, buttons, labels and menu items (capitalise the first word and proper nouns only). One term per concept across the product (workspace or team, not both). Address the user as "you"; the product as "we" sparingly. No exclamation marks in routine UI. Numbers, currency, dates and times are formatted with `Intl` for the user's locale, with relative time for recent events ("4 minutes ago") and absolute dates on hover or for older ones. Use real typographic characters: curly quotes and apostrophes, an ellipsis character, a multiplication sign for dimensions.

**Why.** Title Case On Every Label reads as shouting and slows scanning; mixed terms make users wonder whether two words mean two things.

**Bad.**
```tsx
<h2>Manage Your Team Members!</h2> <Button>Add New Member</Button> <p>Created: 2026-03-09T14:22:00Z</p>
```

**Good.**
```tsx
<h2>Team members</h2> <Button>Add member</Button> <p>Created <time dateTime={iso} title={full}>4 minutes ago</time></p>
```

**Check.** Visual: scan all headings and buttons on a page for case; search the copy for synonyms of the product's core nouns.
