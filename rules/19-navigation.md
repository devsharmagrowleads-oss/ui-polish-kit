---
topic: navigation
prefix: NV
title: Navigation and page structure
when: Building the app shell, header, sidebar, tabs, breadcrumbs or page header; adding a new page or route; deciding where a page's title and main actions go.
---

# Navigation and page structure

An interface is easy when people always know where they are, how they got there and what they can do next. Agents build each page on its own, so the header changes between pages, the current item is not marked, actions move around, and the back button forgets filters. Build one shell and one page-header pattern, mark the current location, and keep navigation state in the URL. For the small-screen form of navigation see RS-07; for link and button semantics see AX-04.

## NV-01 · The current location is always marked
Severity: error · Check: visual

**Rule.** The navigation item for the current page carries `aria-current="page"` and a visible state that is not colour alone (weight, an indicator bar, a filled background), with at least 3:1 contrast. Section parents of the current page are marked too. Tabs use `aria-selected`. The page `<title>` and the `<h1>` name the same place.

**Why.** Without a marked current item users cannot answer "where am I?" after following a link or reloading, and screen-reader users hear a list of links with no indication of which page they are on.

**Bad.**
```tsx
<a href="/invoices" className={isActive ? 'text-primary' : ''}>Invoices</a>
```

**Good.**
```tsx
<a href="/invoices" aria-current={isActive ? 'page' : undefined}
  className="aria-[current=page]:bg-accent aria-[current=page]:font-semibold">Invoices</a>
```

**Check.** Visual: open each page directly by URL; exactly one nav item is marked and the title matches it.

## NV-02 · Landmarks and a skip link
Severity: warning · Check: static

**Rule.** Every page has one `<header>`, one `<main>` holding the page's content, a `<nav>` with an `aria-label` for each navigation block ("Primary", "Breadcrumbs", "Account"), and a `<footer>` if there is one. The first focusable element is a "Skip to content" link that becomes visible on focus and jumps to `<main>`.

**Why.** Landmarks let screen-reader users jump straight to the content or the menu instead of tabbing through forty header links on every page. A page without `<main>` gives them nowhere to jump.

**Bad.**
```html
<body><div class="top">…</div><div class="content">…</div></body>
```

**Good.**
```html
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header>…<nav aria-label="Primary">…</nav></header>
  <main id="main" tabindex="-1">…</main>
</body>
```

**Check.** Static: an HTML document with a `<body>` and no `<main>`. Visual: press Tab once on each page; the skip link appears and works.

## NV-03 · One page-header pattern
Severity: warning · Check: visual

**Rule.** Every page starts the same way: breadcrumbs when the page is deeper than two levels (NV-04), then the `<h1>`, an optional one-line description, and the page's actions on the inline end, primary action last and filled, secondary actions outlined, the rest in a "More" menu. Tabs that switch views of the same object sit directly under the header. The header keeps the same spacing and position on every page.

**Why.** When the "New invoice" button is top-right on one page and bottom-left on the next, users search for it every time, and the product looks assembled from separate templates.

**Bad.**
```tsx
<h2 className="text-center">Invoices</h2> … <Button className="mt-10">Create</Button>
```

**Good.**
```tsx
<PageHeader title="Invoices" description="Sent, paid and overdue invoices for this workspace."
  actions={<><Button variant="outline">Export CSV</Button><Button>New invoice</Button></>} />
```

**Check.** Visual: flip through every top-level page; title and actions stay in the same place.

## NV-04 · Breadcrumbs for depth
Severity: info · Check: visual

**Rule.** Pages three or more levels deep show breadcrumbs: `<nav aria-label="Breadcrumbs">` around an `<ol>`, each ancestor a link, the current page last and marked `aria-current="page"`. Separators are decorative (CSS, hidden from screen readers). On narrow screens collapse the middle into a "…" menu and keep the first and last two items; never truncate the current page's name.

**Why.** Deep pages (Settings › Billing › Invoices › INV-2041) are reached from search and links, not from the menu, so the breadcrumb is the only way up and the only sign of where the page sits.

**Bad.**
```tsx
<div>Settings / Billing / Invoices / INV-2041</div>
```

**Good.**
```tsx
<nav aria-label="Breadcrumbs"><ol className="breadcrumbs">
  <li><a href="/settings">Settings</a></li><li><a href="/settings/billing">Billing</a></li>
  <li><a href="/settings/billing/invoices/2041" aria-current="page">INV-2041</a></li>
</ol></nav>
```

**Check.** Visual: open a deep page by URL; the trail leads back up and reads as a path.

## NV-05 · Links go places, buttons do things
Severity: error · Check: static

**Rule.** Anything that changes the URL is an `<a href>` (it can be opened in a new tab, copied and bookmarked). Anything that acts on the page is a `<button type="button">`. Never `href="#"`, `href="javascript:…"`, or an `<a>` without `href` used as a button, and never a button that only navigates.

**Why.** `href="#"` scrolls to the top, adds a history entry and announces "link" for something that is not one; a button that navigates breaks middle-click, "open in new tab" and the browser's link preview.

**Bad.**
```html
<a href="#" onclick="archive()">Archive</a> <button onclick="location.href='/settings'">Settings</button>
```

**Good.**
```html
<button type="button" onclick="archive()">Archive</button> <a href="/settings">Settings</a>
```

**Check.** Static: `href="#"` or `href="javascript:`. Visual: middle-click every navigation item.

## NV-06 · View state lives in the URL
Severity: warning · Check: visual

**Rule.** The selected tab, filters, search query, sort and page are reflected in the URL (path or query string), so reload, back, forward and sharing a link all return to the same view. Moving between pages keeps the user's scroll position on back. Dialogs that represent a place (a record's detail) can have their own URL; confirmations do not.

**Why.** A dashboard that forgets its filters on reload, or whose back button skips the tab the user was on, makes people redo work and makes links useless for sharing with a colleague.

**Bad.**
```tsx
const [tab, setTab] = useState('overview'); const [status, setStatus] = useState('all');
```

**Good.**
```tsx
const [params, setParams] = useSearchParams();
const tab = params.get('tab') ?? 'overview'; const status = params.get('status') ?? 'all';
```

**Check.** Visual: set a tab, filter and sort, reload, then press back; the same view returns.

## NV-07 · The menu is short and grouped
Severity: warning · Check: visual

**Rule.** Primary navigation has at most about seven items, ordered by use, with group labels for more; settings, help and the account menu sit apart from the work areas. Each item has an icon and a text label (IC-04); a collapsed sidebar keeps the icons with tooltips and remembers its state. Navigation labels are nouns for places ("Invoices"), not verbs.

**Why.** Twelve top-level items with no grouping force users to read the whole list every time, and an icon-only sidebar of unfamiliar glyphs is a guessing game.

**Bad.**
```tsx
<nav>{allFeatures.map((f) => <a key={f.href} href={f.href}><f.icon /></a>)}</nav>
```

**Good.**
```tsx
<nav aria-label="Primary"><NavGroup label="Work"><NavItem icon={Inbox} href="/inbox">Inbox</NavItem>…</NavGroup>
  <NavGroup label="Workspace"><NavItem icon={Settings} href="/settings">Settings</NavItem></NavGroup></nav>
```

**Check.** Visual: count top-level items; collapse the sidebar and reload.
