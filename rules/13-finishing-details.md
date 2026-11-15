---
topic: finishing-details
prefix: FD
title: Finishing details
when: Setting up the document head or root layout, adding images, toasts, modals or overlays, creating error pages, or preparing a project for review or launch.
---

# Finishing details

These are the things nobody asks for and everybody notices when missing: the blank favicon, the tab titled "Vite + React", the link that unfurls as a grey box in Slack, the unstyled 404, the image that shoves the text down as it loads. None is hard. They are missed because the agent considers the feature done when the main view renders. Treat this file as a pre-flight list.

## FD-01 · Favicon and app icons
Severity: warning · Check: static

**Rule.** Provide a favicon set: `favicon.ico` (32px) and an SVG icon (which can adapt to dark mode with a media query inside the SVG), a 180px `apple-touch-icon.png`, and a web manifest with 192 and 512px icons if the app is installable. Derive it from the brand mark in `design.md`; if there is no logo, use the product initial on the primary colour. Remove the framework's default icon.

**Why.** The favicon is how users find the tab among twenty. The default globe, or the Vite or Next logo, says the project is a scaffold.

**Bad.**
```html
<head><title>Ledgerly</title></head>   <!-- no icon; /favicon.ico returns 404 -->
```

**Good.**
```html
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
```

**Check.** Static: no icon link and no favicon/icon file. Visual: look at the browser tab in light and dark browser themes.

## FD-02 · Title and description on every page
Severity: error · Check: static

**Rule.** Each page has a unique `<title>` in the form "Page name · Product" (50 to 60 characters, most specific part first) and a `<meta name="description">` of one or two sentences (up to about 155 characters) that says what the page offers. In Next.js export `metadata` with `title: { default, template: '%s · Product' }` in the root layout and a title per route. Replace every scaffold default.

**Why.** The title is the tab label, the bookmark name, the history entry and the search result headline. "Create Next App" in production is the most visible leftover there is.

**Bad.**
```html
<title>Vite + React + TS</title>
```

**Good.**
```tsx
export const metadata: Metadata = {
  title: { default: 'Ledgerly: invoices that chase themselves', template: '%s · Ledgerly' },
  description: 'Send invoices, automate reminders and see who is late. Built for freelancers and small studios.',
};
```

**Check.** Static: missing or default `<title>`, missing description, root layout without `metadata`. Visual: open three pages and read the tab titles.

## FD-03 · Social preview tags and image
Severity: warning · Check: static

**Rule.** Add Open Graph and Twitter tags: `og:title`, `og:description`, `og:image` (1200×630 PNG or JPG, under about 300 KB, absolute URL, with `og:image:alt`), `og:url`, `og:type`, `twitter:card="summary_large_image"`. The image shows the product name and a one-line value statement in the brand type and colours, readable at thumbnail size. Set `<link rel="canonical">` and `theme-color`.

**Why.** Links get shared in chat and social apps. Without these tags the preview is a bare URL or a random cropped image.

**Bad.**
```html
<meta name="description" content="Invoicing for freelancers">   <!-- no og:* at all -->
```

**Good.**
```html
<meta property="og:title" content="Ledgerly: invoices that chase themselves">
<meta property="og:description" content="Automated reminders and payment matching for freelancers.">
<meta property="og:image" content="https://ledgerly.example/og.png">
<meta property="og:image:alt" content="Ledgerly dashboard showing three overdue invoices">
<meta name="twitter:card" content="summary_large_image">
```

**Check.** Static: missing `og:title`, `og:description` or `og:image`. Visual: paste the URL into a link preview debugger or a chat app.

## FD-04 · Images reserve their space
Severity: warning · Check: static

**Rule.** Every `<img>` has `width` and `height` attributes matching its intrinsic ratio (CSS can still resize it), or sits in a box with `aspect-ratio`. Use `object-fit: cover` for crops, `loading="lazy"` and `decoding="async"` below the fold, `fetchpriority="high"` on the main hero image, and modern formats at the displayed size (not a 4000px photo in a 300px slot). Avatars and thumbnails have a fallback (initials on `--muted`) for missing or broken images.

**Why.** Without dimensions the browser allocates zero height, then pushes the page down when the image arrives; users lose their place or tap the wrong thing.

**Bad.**
```html
<img src="/screens/dashboard.png" alt="Dashboard">
```

**Good.**
```html
<img src="/screens/dashboard.webp" alt="Overdue invoices grouped by client" width="1280" height="800" loading="lazy" decoding="async">
```

**Check.** Static: `<img>` without both dimensions or an aspect ratio. Visual: throttle the network and reload; text does not move as images load.

## FD-05 · A designed 404 page
Severity: info · Check: static

**Rule.** Provide a not-found page (`404.html`, `app/not-found.tsx`, or the framework equivalent) that keeps the site header and navigation, says plainly that the page does not exist, and offers a way forward: a link home, search, or the most likely destinations. Match the product's tone; no stack traces, no stock illustration of a lost astronaut.

**Why.** Broken links happen. The host's default "404 Not Found" in Times New Roman ejects the user from the product.

**Bad.**
```text
Cannot GET /pricng
```

**Good.**
```tsx
export default function NotFound() {
  return <EmptyState icon={Compass} title="We can't find that page" headingLevel="h2"
    description="The link may be old or mistyped. Check the address, or head back to your invoices."
    action={<Button asChild><Link href="/invoices">Go to invoices</Link></Button>} />;
}
```

**Check.** Static: no 404 or not-found file. Visual: visit a nonsense URL.

## FD-06 · Error pages and boundaries
Severity: warning · Check: visual

**Rule.** Add an error boundary at the app root and around independent regions (`error.tsx` per route segment in Next.js), plus styled 500 and offline states. The fallback keeps navigation, explains in plain language that something failed on our side, offers "Try again" (re-render) and a way out, and logs the technical detail instead of showing it.

**Why.** An uncaught render error in React unmounts the whole tree and leaves a white screen with no explanation.

**Bad.**
```tsx
export default function Page() { const data = use(fetchInvoices()); … }   // throws: blank page
```

**Good.**
```tsx
'use client';
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return <EmptyState icon={CloudOff} title="Invoices didn't load" headingLevel="h2"
    description="This is a problem on our side. Your data is safe." action={<Button onClick={reset}>Try again</Button>} />;
}
```

**Check.** Visual: throw an error in a component deliberately and load the page.

## FD-07 · Toasts are placed, timed and stacked
Severity: warning · Check: visual

**Rule.** Use one toast system (`Toaster` recipe, sonner) mounted once. Position bottom-right on desktop and top-centre or bottom-centre on phones, clear of fixed bars. Success and info dismiss after 4 to 6 seconds and pause on hover and focus; errors and toasts with actions stay until dismissed. Stack at most three. Each toast is one short sentence, optionally with one action (Undo, View). Toasts are for transient confirmation: never for form validation, never for anything the user must read to proceed.

**Why.** A toast that covers the button the user is about to press, or an error that vanishes after two seconds, is worse than none.

**Bad.**
```ts
toast('Success!'); toast('Error'); toast('Error'); toast('Error');
```

**Good.**
```ts
toast.success('Invoice INV-2041 sent to dana@northwind.co', { action: { label: 'View', onClick: () => router.push('/invoices/2041') } });
```

**Check.** Visual: trigger several toasts quickly, at 375px and 1440px; hover one; trigger an error and wait.

## FD-08 · Modals and overlays behave
Severity: error · Check: visual

**Rule.** Use the `Dialog` recipe. A modal has a title (`DialogTitle`, required for the accessible name), a close button, closes on Escape and backdrop click (except when it would lose unsaved input), traps focus, locks background scroll without shifting the page (`scrollbar-gutter: stable`), and returns focus on close. Width is `min(100% - 2rem, 32rem)` by default; height is capped at `100dvh - 2rem` with the body scrolling and the header and footer fixed. The scrim uses the `--overlay` token. On phones, tall dialogs become bottom sheets. Never stack modal on modal; never open a modal on page load.

**Why.** Hand-rolled modals overflow small screens, scroll the page behind them, and strand keyboard focus.

**Bad.**
```tsx
{open && <div className="fixed left-1/2 top-1/2 w-[600px] -translate-x-1/2 -translate-y-1/2 bg-white p-8">…</div>}
```

**Good.**
```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader><DialogTitle>Rename project</DialogTitle><DialogDescription>The new name appears for everyone on the team.</DialogDescription></DialogHeader>
    …
    <DialogFooter><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">Rename</Button></DialogFooter>
  </DialogContent>
</Dialog>
```

**Check.** Visual: open each dialog at 375×667 with long content; press Escape; Tab around; check the page behind does not scroll or jump sideways.

## FD-09 · Layers follow the z-index scale
Severity: warning · Check: visual

**Rule.** Stack order, low to high: content, sticky headers (`--z-sticky`), dropdowns anchored in content (`--z-dropdown`), overlay scrims (`--z-overlay`), modals (`--z-modal`), popovers and selects opened from inside modals (`--z-popover`), toasts (`--z-toast`), tooltips (`--z-tooltip`). Render overlays in a portal at the end of `<body>`. Give self-contained components `isolation: isolate` so their internal `z-index: 1` cannot leak.

**Why.** Without an agreed order, the sticky header slides over the modal, or the select inside a dialog opens underneath it.

**Bad.**
```css
.header { position: sticky; z-index: 1000; }  .modal { z-index: 999; }
```

**Good.**
```css
.header { position: sticky; z-index: var(--z-sticky); }  .modal { z-index: var(--z-modal); }
```

**Check.** Static: TK-06. Visual: scroll with a sticky header while a dialog is open; open a select and a tooltip inside a dialog; trigger a toast over a dialog.

## FD-10 · No layout shift
Severity: warning · Check: visual

**Rule.** Reserve space for everything that arrives late: images and embeds (FD-04), web fonts (metric-matched fallback, TY-03), async content (skeletons with final dimensions, ST-02), banners and cookie notices (overlay or reserved slot, not inserted above content), and client-only widgets (fixed-size placeholder). Keep cumulative layout shift under 0.1.

**Why.** Content that moves after it appears causes mis-taps and makes a fast page feel unstable.

**Bad.**
```tsx
{banner && <div className="p-4">{banner.text}</div>}   {/* appears 800ms after load, pushes the page down */}
<main>…</main>
```

**Good.**
```tsx
<div className="min-h-12">{banner ? <Banner {...banner} /> : null}</div>
<main>…</main>
```

**Check.** Visual: record a throttled page load (DevTools Performance) and look for layout-shift markers; reload several times watching the top of the page.

## FD-11 · Content resilience: long, short, many, none
Severity: warning · Check: visual

**Rule.** Test every component with hostile content: a 60-character name with no spaces, a three-letter name, zero items, one item, 500 items, a missing image, a negative number, a right-to-left string. Single-line labels truncate with an ellipsis and expose the full text in a `Tooltip`; multi-line text clamps with `line-clamp-*`; flex children have `min-w-0`; long lists paginate or virtualise; counts handle singular and plural.

**Why.** Demo data is always the perfect length. Real names, real titles and real counts are what break layouts in production.

**Bad.**
```tsx
<div className="flex"><span>{user.name}</span><Badge>{count} items</Badge></div>   {/* long name pushes badge off-screen; "1 items" */}
```

**Good.**
```tsx
<div className="flex min-w-0 items-center gap-2">
  <span className="truncate">{user.name}</span>
  <Badge className="shrink-0">{count} {count === 1 ? 'item' : 'items'}</Badge>
</div>
```

**Check.** Visual: substitute the longest plausible value into each text slot and screenshot at 375px.
