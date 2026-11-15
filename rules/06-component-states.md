---
topic: component-states
prefix: ST
title: Component states
when: Building any interactive element (button, link, input, row, tab, card action) or any view that loads, lists, saves or deletes data.
---

# Component states

A generated component usually exists in one state: the default one, with data present. Real use spends its time in the others. A button is hovered, focused, pressed, busy or disabled; a list is loading, empty, failed or full. If a state is not designed, the user sees a frozen screen, a blank area, or a layout that jumps. Treat the state list as part of the component's definition: it is not done until each one renders.

## ST-01 · Every interactive element has hover, focus-visible, active and disabled
Severity: error · Check: visual

**Rule.** Each button, link, input, menu item, tab, clickable row or card defines four visible states beyond default: `hover` (a surface or colour shift), `focus-visible` (the ring, see AX-01), `active` (pressed: darker or 1px down) and `disabled` (reduced opacity, `cursor: not-allowed` or no pointer events, removed from hover). States must be distinguishable from each other, and hover styles apply only on hover-capable devices.

**Why.** Without hover, users cannot tell what is clickable; without active, a click feels unregistered; without disabled, users click dead buttons and conclude the app is broken.

**Bad.**
```tsx
<button className="rounded-md bg-primary px-4 py-2 text-primary-foreground">Save</button>
```

**Good.**
```tsx
<button className="h-10 rounded-md bg-primary px-4 text-primary-foreground transition-colors
  hover:bg-primary/90 active:bg-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring
  disabled:pointer-events-none disabled:opacity-50">Save changes</button>
```

**Check.** Visual: for each kind of control, hover it, Tab to it, hold the mouse down on it, and render it disabled. Four visibly different results.

## ST-02 · Loading states keep the layout
Severity: error · Check: visual

**Rule.** Anything that waits on the network shows progress in place. Content areas render skeletons shaped like the final content (same heights, same number of rows) using the `Skeleton` recipe; never a lone centred spinner on a blank page. Buttons that trigger async work use `loading` (spinner, `aria-busy`, same width, clicks blocked). Do not show a loader for waits under about 300ms; show a message for waits over 10 seconds.

**Why.** A spinner tells the user nothing about what is coming, and when content replaces it the whole page jumps. A button without a busy state invites double submission.

**Bad.**
```tsx
if (isLoading) return <div className="flex h-screen items-center justify-center"><Spinner /></div>;
```

**Good.**
```tsx
if (isLoading) return <ul className="flex flex-col gap-3">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-14 w-full" />)}</ul>;
<Button loading={isSaving} type="submit">Save changes</Button>
```

**Check.** Visual: throttle the network to Slow 3G and reload each view; nothing shifts when data arrives. Click each submit button twice quickly.

## ST-03 · Empty states explain and offer the next action
Severity: error · Check: visual

**Rule.** Every list, table, search result, inbox and dashboard panel has a designed empty state (the `EmptyState` recipe): an icon from the icon set, a title saying what is empty, one sentence saying why or what will appear, and the primary action to fill it. Distinguish "nothing yet" (first use) from "no results" (filters active: offer to clear them). Never render an empty table with only headers, or nothing at all.

**Why.** A blank panel is indistinguishable from a bug. The empty state is also the first screen every new user sees.

**Bad.**
```tsx
{projects.length === 0 && <p>No data</p>}
```

**Good.**
```tsx
{projects.length === 0 && (
  <EmptyState icon={FolderPlus} title="No projects yet"
    description="Projects group tasks, files and people. Create one to start tracking work."
    action={<Button onClick={openCreate}>Create project</Button>} />
)}
```

**Check.** Visual: load every view with an empty account and with a search that matches nothing.

## ST-04 · Errors are shown where they happen, with a way forward
Severity: error · Check: visual

**Rule.** Failed requests render an error state in the affected region (not only a console log or a generic toast): what failed, in plain words, and a retry action. Keep the user's input and scroll position. Field errors appear under the field (FM-04). Whole-page failures use an error boundary page with navigation intact. Use the destructive tokens plus an icon; never colour alone.

**Why.** Silent failure is the worst state: the user waits on a spinner forever or loses typed data on a re-render.

**Bad.**
```tsx
try { await save(form); } catch (e) { console.error(e); }
```

**Good.**
```tsx
{error && (
  <div role="alert" className="flex items-start gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
    <CircleAlert className="size-4 text-destructive" aria-hidden />
    <p>Couldn't load invoices. Check your connection and try again.</p>
    <Button variant="outline" size="sm" onClick={retry}>Retry</Button>
  </div>
)}
```

**Check.** Visual: block the API request in DevTools (or go offline) and trigger each load and each save.

## ST-05 · Success is confirmed
Severity: warning · Check: visual

**Rule.** Every action that changes data gives feedback within 100ms of completion: the changed item updates in place, and a toast or inline confirmation names what happened ("Invoice sent to dana@northwind.co"). Offer Undo for reversible destructive actions instead of a confirmation dialog. Do not navigate away silently, and do not show success before the server has confirmed unless the update is optimistic (ST-06).

**Why.** Without confirmation users repeat the action "to be sure", creating duplicates.

**Bad.**
```tsx
await archive(id); router.refresh();
```

**Good.**
```tsx
await archive(id);
toast.success('Conversation archived', { action: { label: 'Undo', onClick: () => unarchive(id) } });
```

**Check.** Visual: perform each create, update and delete; note what tells you it worked.

## ST-06 · Optimistic updates for cheap, reversible actions
Severity: info · Check: visual

**Rule.** For toggles, likes, reordering, renaming, checking off a task and similar low-risk actions, update the interface immediately, send the request in the background, and roll back with an explanatory toast if it fails. Do not use optimistic UI for payments, destructive deletes without undo, or anything whose failure the user must not miss.

**Why.** A 400ms spinner on every checkbox makes an app feel slow even when the server is fast.

**Bad.**
```tsx
const toggle = async () => { setBusy(true); await api.setDone(id, !done); await refetch(); setBusy(false); };
```

**Good.**
```tsx
const toggle = async () => {
  setDone(!done);                                   // immediate
  try { await api.setDone(id, !done); }
  catch { setDone(done); toast.error("Couldn't update the task. Your change was undone."); }
};
```

**Check.** Visual: with network throttling on, toggle items; the UI responds instantly. Then block the request and confirm the rollback and message.

## ST-07 · Selected, current and pressed are visible and exposed
Severity: warning · Check: visual

**Rule.** The current page in navigation, the selected tab, the active filter, the chosen row and a pressed toggle each have a persistent style distinct from hover, and the matching attribute: `aria-current="page"`, `aria-selected`, `aria-pressed`, `aria-checked`, `data-state`. Style from the attribute so the two cannot disagree.

**Why.** Navigation with no current indicator leaves users unsure where they are; a toggle that looks the same on and off is unusable.

**Bad.**
```tsx
<a href="/billing" className={path === '/billing' ? 'font-bold' : ''}>Billing</a>
```

**Good.**
```tsx
<a href="/billing" aria-current={path === '/billing' ? 'page' : undefined}
  className="rounded-md px-3 py-2 text-muted-foreground hover:bg-accent aria-[current=page]:bg-accent aria-[current=page]:text-accent-foreground">Billing</a>
```

**Check.** Visual: on every page, the navigation shows where you are; every toggle and tab shows its state without hovering.
