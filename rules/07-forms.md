---
topic: forms
prefix: FM
title: Forms
when: Building or editing any form, input, sign-in or sign-up screen, settings page, search box, filter bar or inline edit.
---

# Forms

Forms are where users do the work and where they give up. The common generated form has placeholders instead of labels, validates everything on submit with a red banner, makes every input full width, and has a submit button that can be clicked five times. Use the `Field`, `Input`, `Button` recipes: they wire labels, hints, errors and busy states correctly by default.

## FM-01 · Every input has a visible label
Severity: warning · Check: static

**Rule.** Each input, select and textarea has a visible `<label>` connected by `for`/`htmlFor` and `id` (or wrapping). The label sits above the field, is always visible, and names the data ("Work email"), not an instruction. Placeholders are optional examples of format (`name@company.com`), never the label. Where a visible label is impossible (a search box with a search icon button), use `aria-label`.

**Why.** A placeholder vanishes on the first keystroke, so users cannot check what a filled field was for; it is low-contrast by design, and many screen readers skip it. Clicking a connected label also focuses the field, which matters on touch screens.

**Bad.**
```tsx
<input type="email" placeholder="Email" />
```

**Good.**
```tsx
<Field label="Work email" hint="We'll send the invoice here.">
  <Input type="email" autoComplete="email" placeholder="name@company.com" />
</Field>
```

**Check.** Static: inputs with no associated label, `aria-label` or `aria-labelledby`. Visual: fill the form completely; every field is still identifiable.

## FM-02 · Inputs declare type, autocomplete and input mode
Severity: info · Check: static

**Rule.** Set the right `type` (`email`, `tel`, `url`, `password`, `search`), `autocomplete` token (`email`, `name`, `given-name`, `street-address`, `postal-code`, `cc-number`, `current-password`, `new-password`, `one-time-code`) and `inputmode` (`numeric`, `decimal`) on every field, plus `name`. Disable `autocapitalize` and `spellcheck` on emails, usernames and codes.

**Why.** These attributes choose the phone keyboard, let browsers and password managers fill the form in one tap, and stop "John@Example.Com " autocorrections.

**Bad.**
```tsx
<input type="text" placeholder="Phone" />  <input type="password" />
```

**Good.**
```tsx
<Input type="tel" name="phone" autoComplete="tel" inputMode="tel" />
<Input type="password" name="password" autoComplete="current-password" />
```

**Check.** Static: email, password and tel inputs without `autocomplete`. Visual: open the form on a phone and check the keyboard for each field.

## FM-03 · Validate at the right time
Severity: warning · Check: visual

**Rule.** Do not show an error while the user is still typing a field for the first time. Validate a field when it loses focus (on blur); once a field is in the error state, re-validate on every change so the error clears the moment it is fixed. Validate everything again on submit, focus the first invalid field and scroll it into view. Constraints that can be shown ahead of time (password rules, character limit) appear as hints before any error.

**Why.** Errors on the first keystroke ("Invalid email" after typing "j") punish users for not being finished. Errors only on submit make them hunt for what went wrong.

**Bad.**
```tsx
<input onChange={(e) => setError(isEmail(e.target.value) ? '' : 'Invalid email')} />
```

**Good.**
```tsx
<Input onBlur={() => setTouched(true)} onChange={(e) => { setEmail(e.target.value); if (touched) validate(e.target.value); }}
  aria-invalid={touched && !!error} />
```

**Check.** Visual: type one character in each field (no error), tab away with an invalid value (error), fix it (error clears while typing), submit empty (focus jumps to the first error).

## FM-04 · Error messages sit under the field and say how to fix it
Severity: error · Check: visual

**Rule.** A field error is rendered directly below its input, in the destructive colour with an icon, linked with `aria-describedby` and `aria-invalid="true"`; the input border changes too. The text states the problem and the fix in the user's terms ("Enter a date after 12 March", not "Invalid input"). A summary at the top is an addition for long forms, never a replacement. Server errors map back to their fields.

**Why.** A banner saying "Please fix the errors below" with no markers forces a search. Colour alone fails for colour-blind users; without `aria-describedby` a screen reader announces nothing.

**Bad.**
```tsx
{errors.length > 0 && <div className="text-red-500">Form has errors</div>}
```

**Good.**
```tsx
<Field label="Start date" error={errors.start && 'Choose a start date after 12 March 2026.'}>
  <DatePicker value={start} onValueChange={setStart} placeholder="Pick a date" />
</Field>
```

**Check.** Visual: trigger each validation error. The message is adjacent to the field, specific, and announced when the field is focused with a screen reader.

## FM-05 · Field width matches the expected answer
Severity: warning · Check: visual

**Rule.** Size inputs to their content: postcode about 8 characters wide, CVC 4, year 6, phone 16, email and name 320 to 400px, free text full width of a constrained form column. Use a `<textarea>` (3 rows or more, vertically resizable) for multi-sentence answers. Forms are a single column, 400 to 640px wide; put two fields side by side only when they form one unit (first and last name, city and postcode).

**Why.** Width is a hint about the expected answer. A 900px postcode field looks wrong and makes the page harder to scan; multi-column forms cause skipped fields.

**Bad.**
```tsx
<form className="grid grid-cols-3 gap-4">{fields.map((f) => <input className="w-full" />)}</form>
```

**Good.**
```tsx
<form className="flex max-w-lg flex-col gap-5">
  <Field label="Street address"><Input autoComplete="street-address" /></Field>
  <div className="flex gap-4">
    <Field label="City" className="flex-1"><Input autoComplete="address-level2" /></Field>
    <Field label="Postcode" className="w-32"><Input autoComplete="postal-code" /></Field>
  </div>
</form>
```

**Check.** Visual: at 1440px, no single-line input is wider than about 400px unless it holds long text; at 375px, side-by-side pairs stack or still fit.

## FM-06 · Mark optional fields; ask for less
Severity: warning · Check: visual

**Rule.** Remove every field the product does not need now. When most fields are required, mark only the optional ones with "(optional)" after the label; when most are optional, mark the required ones with an asterisk plus a legend and `required` / `aria-required`. Never rely on the asterisk alone without a legend, and never mark both.

**Why.** Each extra field lowers completion. A page of red asterisks is noise; "(optional)" is unambiguous text.

**Bad.**
```tsx
<label>Name *</label> <label>Email *</label> <label>Company *</label> <label>Phone</label>
```

**Good.**
```tsx
<Field label="Name" required>…</Field> <Field label="Email" required>…</Field>
<Field label="Phone" optional hint="Only used if we can't reach you by email.">…</Field>
```

**Check.** Visual: for each field, ask what breaks if it is removed. Check that marking is consistent across all forms.

## FM-07 · Password and number fields behave
Severity: warning · Check: visual

**Rule.** Passwords: a show/hide toggle button with `aria-label` and `aria-pressed`; requirements listed before typing and ticked off live; `autocomplete="new-password"` on sign-up, `current-password` on sign-in; paste allowed; no "confirm password" field when a show toggle exists. Numbers: use `type="text"` with `inputmode="numeric"` or `decimal` for codes, card numbers, quantities and money (avoid `type="number"` unless a stepper is wanted), accept pasted formatted values, show the unit or currency as an adornment, and right-align amounts.

**Why.** `type="number"` changes value on scroll, shows tiny unstyled spinners, and rejects "1,200". Blocking paste breaks password managers.

**Bad.**
```tsx
<input type="number" placeholder="Amount" /> <input type="password" onPaste={(e) => e.preventDefault()} />
```

**Good.**
```tsx
<Field label="Amount">
  <div className="relative"><span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">£</span>
    <Input inputMode="decimal" className="pl-7 text-right tabular-nums" value={amount} onChange={onAmount} /></div>
</Field>
```

**Check.** Visual: paste "1,200.50" into each amount field; scroll the page with the cursor over a number field; use a password manager on sign-in.

## FM-08 · Submitting shows progress and cannot repeat
Severity: error · Check: visual

**Rule.** The submit button is a real `<button type="submit">` inside a `<form>` (Enter submits). On submit it enters the loading state (ST-02), further clicks are ignored, and fields are not cleared. On success, confirm (ST-05) and move on; on failure, keep all input, show the error (FM-04) and re-enable the button. Do not disable the submit button to signal invalid input: leave it enabled and show what is missing when pressed. Label it with the action ("Create account"), never "Submit".

**Why.** A permanently disabled button with no explanation is a dead end; an unguarded one creates duplicate orders.

**Bad.**
```tsx
<div onClick={handleSubmit} className="btn">Submit</div>
```

**Good.**
```tsx
<form onSubmit={handleSubmit} noValidate>
  …
  <Button type="submit" loading={pending}>Create account</Button>
</form>
```

**Check.** Visual: press Enter in a field; double-click submit on a throttled connection; submit with the server returning 500 and confirm input is preserved.

## FM-09 · Group, order and help
Severity: info · Check: visual

**Rule.** Order fields the way people think about the task; group related fields under a short heading or `<fieldset>` with `<legend>`; split forms longer than about seven fields into titled sections or steps with progress. Put help text under the label as a hint, not in a tooltip. Destructive or secondary actions (Cancel, Delete) are visually quieter and separated from the primary button. Radio buttons for two to five exclusive options, a select or combobox above that, a switch only for settings that apply immediately.

**Why.** A long undivided form looks like more work than it is, and help hidden in tooltips is not read.

**Bad.**
```tsx
<form>{twentyFields}<button>Save</button><button>Delete account</button></form>
```

**Good.**
```tsx
<form className="flex flex-col gap-10">
  <fieldset className="flex flex-col gap-5"><legend className="text-lg font-semibold">Profile</legend>…</fieldset>
  <fieldset className="flex flex-col gap-5"><legend className="text-lg font-semibold">Notifications</legend>…</fieldset>
  <div className="flex justify-end gap-3"><Button variant="ghost" type="button">Cancel</Button><Button type="submit">Save changes</Button></div>
</form>
```

**Check.** Visual: read only the headings and labels top to bottom; the task should make sense.
