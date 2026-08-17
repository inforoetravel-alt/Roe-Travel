# Roe Travel — Website

Static multi-page site (HTML/CSS/JS), no build step required. Live at
https://inforoetravel-alt.github.io/Roe-Travel/ (GitHub Pages).

## ⚠️ Redeployment note

If you're reading this because a previous upload to GitHub only had 1
country and no dark mode toggle — that was an early snapshot uploaded by
mistake, with a duplicate nested `roetravel/roetravel/` folder from how
the upload happened. This zip is the complete, current version. **Delete
everything in the GitHub repo first**, then upload the contents of this
zip fresh (select the *contents* of this folder, not the folder itself,
so you don't recreate the nesting problem) — see the bottom of this file
for exact steps.

## Structure

```
index.html              Homepage
flights.html            Flight search UI + flights-by-country + airlines
hotels.html              Hotel search UI + category browse + all 29 country links
destinations.html       "Top hotels by country" curated picks (6 countries)
destinations-by-continent.html   All 29 countries grouped by continent
travel-guides.html      Travel guide teasers (content not yet written)
contact.html            Support page + contact form + FAQ
robots.txt / sitemap.xml   SEO basics, 36 URLs

countries/
  _template.html        Blank template with {{PLACEHOLDER}} tags — do not delete
  _generate.py          Script that fills the template for a list of countries
  hotel.html             Generic hotel detail page — driven entirely by URL params
  <slug>.html            29 country pages

data/
  continents.json       Continent → country-slug mapping (powers the hub page)
  countries/<slug>.json  One file per country, same shape each time

css/style.css           Full design system (colors, type, components, dark mode)
js/script.js             Site-wide interactivity (nav, forms, search widget, dark mode toggle)
js/config.js             Your API keys (Unsplash + Travelpayouts) — see below
js/photo-service.js      Fetches real/stock photos for hotel cards and galleries
js/country-page.js       Renders any countries/<slug>.html from its JSON file
js/hotel-page.js         Renders countries/hotel.html from URL params + JSON
js/continents-page.js    Renders destinations-by-continent.html
assets/og-image.png      Branded 1200×630 share image (real, generated graphic)
```

## Countries (29 — full original expansion brief)

United States, Canada, United Kingdom, France, Italy, Spain, Germany,
China, Japan, Australia, United Arab Emirates, Belgium, Saudi Arabia,
Hong Kong, Netherlands, Switzerland, Singapore, Nigeria, South Africa,
Ghana, Morocco, Egypt, Kenya, Denmark, Sweden, Norway, Finland, Portugal,
Turkey. Every one has hero, featured cities, hotel categories, top
attractions, travel tips, an FAQ with schema.org markup, working hotel
detail pages, and dark mode.

**To add a new country:** add a line to `countries/_generate.py`'s
`COUNTRIES` list, run it, then write `data/countries/<slug>.json` (copy
an existing one and edit the content).

## Photos — two real sources, both optional

`js/config.js` holds two independent API keys. The site works fine with
neither, either, or both set — with neither, cards show the plain CSS
gradient placeholder.

**1. Travelpayouts / Hotellook (real hotels, real photos)** — via your
approved Travelpayouts affiliate account. Tried FIRST for every hotel
card, matched by city name. This returns an actual real hotel in that
city with an actual real photo — not necessarily the same fictional
hotel name in our own JSON data (our hotel names/prices are still
placeholders — see below), but a genuinely real property and real image.
Get your token at travelpayouts.com → Profile → API token.

**2. Unsplash (stock photo fallback)** — used only if Travelpayouts has
no key set or returns nothing for that query. A free, legally-licensed
stock photo matched by city/theme keywords — NOT a real hotel. Every
photo shown includes required photographer/Unsplash attribution (small
caption in the corner). Get a free key at unsplash.com/developers.

Both cache results in the browser's `sessionStorage` per visit to stay
within free rate limits (Unsplash: 50/hour demo tier; Hotellook similar).
Neither key should be treated as fully secret — client-side static sites
have no hidden backend, so both keys are visible in `config.js`'s public
source. That's an accepted tradeoff for a site this size; a small
server-side proxy would be the next step if traffic grows enough to need
it.

## What's still a placeholder

- Hotel **names, star ratings, and prices** in `data/countries/*.json`
  are realistic-sounding placeholders, not real listings — Roe Travel
  doesn't have a live hotel *inventory/booking* feed, only a photo/data
  lookup via Travelpayouts. Real inventory would mean wiring actual
  search-and-book flows to Travelpayouts' (gated, requires separate
  application) or another provider's booking API.
- The search forms (flights.html, hotels.html) are UI only — no live
  results.
- Room types and guest reviews on the hotel detail page are generated
  sample content, clearly labeled as such.

## Dark mode

Toggle button (🌙/☀️) in the header on every page. Sets
`data-theme="dark"` on `<html>`, persisted via `localStorage`
(`roe-theme` key), respects OS `prefers-color-scheme` on first visit,
and applies pre-paint via an inline script in every page's `<head>` — no
flash of the wrong theme.

## Redeploying to GitHub Pages (clean reset)

1. Go to your repo (github.com/inforoetravel-alt/Roe-Travel)
2. Delete every existing file/folder in it (select all → delete, commit)
3. Click "uploading an existing file"
4. Open this unzipped folder on your computer and select **everything
   inside it** (index.html, all the folders, robots.txt, etc.) — not the
   folder itself
5. Commit changes
6. Settings → Pages → confirm branch is `main`, folder `/ (root)` → Save
7. Wait ~1 minute, then visit https://inforoetravel-alt.github.io/Roe-Travel/
