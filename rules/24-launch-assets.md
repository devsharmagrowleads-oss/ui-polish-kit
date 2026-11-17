---
topic: launch-assets
prefix: AS
title: Launch assets
when: Starting UI work in a project, doing the brand intake, setting up the document head or root layout, adding images, logos or icons, or preparing a site or app for review or launch.
---

# Launch assets

A coding agent can write every line of a page and still ship it without the things only the owner has: the logo in its light and dark versions, the icon the browser tab and home screen show, the image a link preview uses, real photos of the product or team. Agents fill those gaps silently with a framework logo, a grey placeholder or a random stock photo, and nobody notices until launch. This topic makes the agent take an inventory early, ask the owner for what is missing, and record the answer. The checker flags the gaps it can see (FD-01, FD-03 and the rules below); this topic is about asking before they become defects.

## AS-01 · Take an asset inventory and ask for what is missing
Severity: error · Check: process

**Rule.** During the brand intake (BR-02, BR-03), list each launch asset and whether the repository has it: logo (full and mark, light and dark), favicon (SVG plus 32px ICO), apple-touch-icon (180px PNG), manifest icons (192px and 512px), social preview image (1200×630), product screenshots or photography, and for marketing surfaces privacy and terms pages. Ask the owner for every missing item in one message, each with options: provide the file, let you generate a placeholder (from the logo or initials) marked "assumed", or skip with a reason. Record the answers in the Assets table of `design.md`.

**Why.** Missing assets are cheap to fix on day one and embarrassing on launch day. Asking once, with options, gets a decision instead of a silent placeholder that ships.

**Bad.**
```md
<!-- agent notes -->
No logo found; used the Vite logo for the favicon. Used picsum.photos for the team section.
```

**Good.**
```md
## Assets
| Asset | Status | Source |
| --- | --- | --- |
| Logo (light, dark, mark) | provided | /brand/logo-*.svg |
| Favicon + apple-touch-icon | generated from the mark | assumed: owner to confirm |
| Social preview 1200×630 | missing: owner sending by 3 Dec | |
| Team photos | skipped: section removed until photos exist | owner, 2026-11-17 |
```

**Check.** Process: `design.md` has an Assets table with a status for every row, and the final report lists any asset still missing or generated as a placeholder.

## AS-02 · A complete icon set
Severity: warning · Check: static

**Rule.** A favicon alone is not enough. Ship an SVG favicon (it can switch colour with `prefers-color-scheme`), a 32px `favicon.ico` for old browsers and feed readers, a 180×180 PNG `apple-touch-icon` with a solid background (iOS ignores transparency and paints it black), and, for apps that can be installed or pinned, 192px and 512px icons in the web app manifest, including a maskable one. Generate them all from one square source mark so they match.

**Why.** Without an apple-touch-icon, a site saved to an iPhone home screen shows a screenshot thumbnail; without manifest icons, Android and desktop installs show a generic letter.

**Bad.**
```html
<link rel="icon" href="/favicon.svg">
```

**Good.**
```html
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
```

**Check.** Static: a favicon exists but there is no apple-touch-icon (link or file, including Next.js `app/apple-icon.*`). Visual: add the site to a phone home screen, or inspect the manifest in DevTools > Application.

## AS-03 · Theme colour and manifest
Severity: info · Check: static

**Rule.** Set `<meta name="theme-color">` from the background token, once per colour scheme (`media="(prefers-color-scheme: dark)"` for the dark one), so mobile browser chrome matches the page. Ship a web app manifest (`site.webmanifest`, or `app/manifest.ts` in Next.js) with the product's `name`, `short_name`, `theme_color`, `background_color` and the icons from AS-02.

**Why.** A dark product inside a bright white browser bar looks unfinished, and a missing manifest makes installed or pinned versions look generic.

**Bad.**
```html
<head><title>Ledgerly</title></head>
```

**Good.**
```html
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0b1416" media="(prefers-color-scheme: dark)">
<link rel="manifest" href="/site.webmanifest">
```

**Check.** Static: a page with neither a theme-color meta tag nor a web app manifest. Visual: open the site on a phone in both themes; the browser bar matches.

## AS-04 · Logos work on every background
Severity: warning · Check: visual

**Rule.** Use the real logo files from the inventory (AS-01), never a text wordmark typed in the body font as a stand-in unless `design.md` says so. Provide a version for light and for dark surfaces (or an SVG using `currentColor`), keep its clear space and minimum size, use the mark alone where space is tight (collapsed sidebar, favicon, mobile header), and give it alt text with the product name. Customer and partner logos in a logo wall use one treatment (all monochrome or all original colours) at optically equal sizes.

**Why.** A dark logo on a dark header disappears, and a logo wall where every logo is a different size and colour looks careless next to a polished page.

**Bad.**
```html
<img src="/logo-dark.svg" alt="logo" class="h-12">   <!-- the same file in light and dark themes -->
```

**Good.**
```html
<picture><source srcset="/logo-on-dark.svg" media="(prefers-color-scheme: dark)"><img src="/logo-on-light.svg" alt="Ledgerly" width="120" height="28"></picture>
```

**Check.** Visual: check the logo in the header, footer, collapsed navigation and favicon, in light and dark themes, at 375px and 1440px.

## AS-05 · No placeholder or random images
Severity: error · Check: static

**Rule.** Never ship images from placeholder or random-image services (placehold.co, via.placeholder.com, picsum.photos, source.unsplash.com, placekitten, dummyimage.com, loremflickr and similar). Use the product's own screenshots, photography from the owner, or a licensed image chosen for the section and saved in the repository with dimensions and alt text (FD-04, AX-03). If no image exists yet, design the section without one, or show a neutral, on-brand empty frame and list the missing image in the asset inventory (AS-01).

**Why.** Random images change on every load, are unrelated to the product, may disappear when the service goes down, and are the clearest sign that a page is a template.

**Bad.**
```html
<img src="https://picsum.photos/600/400" alt="Team">
```

**Good.**
```html
<img src="/images/team-studio.webp" alt="The Ledgerly team in the Leeds studio" width="1200" height="800">
```

**Check.** Static: an image URL from a placeholder or random-image service in markup, styles or scripts. Visual: every image belongs to this product.
