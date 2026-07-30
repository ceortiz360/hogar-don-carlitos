# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project type

Single-page site for **Hogar Don Carlitos**, a dog-shelter/rescue (Colombia). Not an npm or git project — no `package.json`, no `node_modules`, no lockfile, no `tsconfig`. There is no build, lint, or test command anywhere in this repo. "Running" the site means serving/opening `index.html` as static files; it requires **internet access** because `js/support.js` fetches React 18.3.1, ReactDOM 18.3.1, and `@babel/standalone` 7.29.0 from `unpkg.com` at page load and Babel-transpiles the inline component in-browser. There is no offline mode and no local copy of React.

## File roles — what's hand-editable vs. generated

- **`index.html`** — the only markup/logic file meant for hand-editing: page content, ES/EN translations, dog data, structure. All markup lives inside it; there are no other HTML pages.
- **`css/site.css`** — the site's own styling, as classes (`.hdc-*`). Extracted from what used to be inline `style="..."` attributes 1:1, grouped by page section with comments. When styling an element, prefer adding/editing a class here over reintroducing an inline `style=`. 4 elements keep a genuinely dynamic inline `style="{{ ... }}"` on purpose (`item.style`, `item.mobileStyle`, `s.wrapStyle`, `d.style`) because their CSS is computed per-render in `renderVals()` (active-nav-item color, active-slide opacity, active-dot width/color) — see the comments beside those fields in the `Component` class.
- **`js/support.js`** — generated runtime ("dc-runtime"). Header says `GENERATED from dc-runtime/src/*.ts — do not edit. Rebuild with 'cd dc-runtime && bun run build'.` The `dc-runtime` source project is external and not present in this repo, so this file cannot actually be rebuilt here — treat as read-only, vendored.
- **`js/image-slot.js`** — generated web component (`<image-slot>`) from the same authoring tool family ("omelette runtime" / `design_canvas.jsx`). Also read-only/vendored.
- **`_ds/modernist-b2eb6d98-.../`** — vendored design-system package (`styles.css`, `_ds_bundle.js`, `_ds_manifest.json`, `readme.md`). Treat as read-only. Reuse its CSS variables and classes rather than hardcoding values (see Design tokens below). Note: `_ds_manifest.json` lists additional files (`components/`, `templates/`, `theme.json`, etc.) that were never actually copied into this project — only the four files above exist on disk.
- **`.image-slots.state.json`** — sidecar data store for `<image-slot>` drops (base64 image data keyed by slot id). Large; avoid dumping/reading in full unless specifically needed.

## Architecture

`index.html` is authored in a custom template DSL, parsed and rendered by `js/support.js` into a React tree at runtime:

- Whole document body is wrapped in `<x-dc> ... </x-dc>`.
- Template syntax: `{{ expr }}` interpolation, `<sc-if value="{{ cond }}">...</sc-if>` for conditionals, `<sc-for list="{{ items }}" as="item">...</sc-for>` for loops, `<image-slot id="...">` for droppable images.
- Near the end of `index.html`, a `<script type="text/x-dc" data-dc-script data-props="...">` block holds a plain JS `class Component extends DCLogic`. This is the state/logic layer — constructor sets initial `state` (`state.page`, `state.lang`, `state.slide`, `state.isMobile`, `state.menuOpen`, form fields, etc.), and its `renderVals()` method returns the data object bound into the `{{ }}` / `sc-if` / `sc-for` template above. The `data-props` attribute declares props an external editor tool can expose (`defaultLang`, `carouselSeconds`, `whatsapp`).
- No real routing: all "pages" (home/about/adopt/donate/contact) are rendered in the one document and toggled via `state.page` + `sc-if isHome/isAbout/isAdopt/isDonate/isContact`, driven by a `go(pageKey)` method.
- Bilingual ES/EN: a `t` object keyed by `state.lang`, swapped via a language-toggle control. Ten dog profiles (name, age/size, personality, health notes, both languages) come from a `dogsData()` method.
- No backend, no form POST endpoint. Contact/donate flows go through WhatsApp deep links built by `wa(msg)` / `waNum()` helpers against the `whatsapp` prop (`573188567400`).
- The `Component` class (constructor, lifecycle methods, `data()`, `dogsData()`, `renderVals()`, and the local blocks inside it) has Spanish comments explaining what each part does — read those first before changing logic there.

## Design tokens (`_ds/modernist-.../styles.css`)

Flat "Modernist" system — near-mono red on white, zero corner radius, strong 2px rules, grayscale photography. Always use the CSS variables rather than hardcoding values:

- `--color-bg: #f3f2f2`, `--color-text: #201e1d`, `--color-accent: #ec3013` (plus 100–900 ramps)
- `--font-heading` / `--font-body`: `"Archivo"`
- `--space-1..8`: 4px–32px scale
- `--radius-*`: `0px` everywhere — don't round corners
- `--shadow-sm/md/lg`
- Reusable classes: `.btn` / `.btn-primary`, `.tag`, `.field`, `.card`, `.nav`, `.table`, `.dialog`, `.hr`, `.grayscale` (wraps content photography), plus site-specific `.hdc-card` / `.hdc-link`.

## Repo clutter (not wired into the live page)

These exist on disk but are not referenced by `index.html` — don't assume they need integrating, and skip reading them unless specifically asked to:

- `img/` (101MB) — raw source photos, mostly unused. Exceptions ARE referenced: `img/Dashboard/6.png` (home, "Quince años haciendo hogar"), `img/Dashboard/7.jpeg` (about page, "Cómo empezó todo"), and the 10 dog photos in `dogsData()` (`photo` field): `img/{28,10,15,34,35,6,21,3}.jpeg` used as-is, plus `img/20-face.jpeg` (Max) and `img/5-face.jpeg` (Nina) — these two are cropped versions of `img/20.jpeg`/`img/5.jpeg` (originals are full-body shots; cropped to a head-and-shoulders framing so the face reads at the same scale as the other 8, which are closeups). The uncropped `20.jpeg`/`5.jpeg` are kept as source but no longer referenced.
- `1-ms5ddvan-qj47.png` and `.thumbnail` at repo root.
- In `uploads/`: `1.png` and `24.jpeg` are unused; the actual hero-carousel images referenced by `index.html` are `1..png` (double dot), `2.png`, `3-cc6d5ecf.png`, `4.png`, `5.png`.
- `index.html.bak` — a full backup of `index.html` from before the CSS-extraction/comment refactor (kept because this repo has no git). Not referenced by the live page.
