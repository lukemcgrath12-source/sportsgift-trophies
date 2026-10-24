# SportsGift Trophies website

Static HTML site deployed on Vercel from the `main` branch. No framework and no build step on Vercel.

## Structure

- `*.html` – one file per page. Page content sits inside `<main id="main">`.
- `assets/css/sg.css` – all site styles, one file.
- `assets/js/site.js` – all site behaviour: menu, quote modal, FAQ, quote forms, catalogue filter, gallery lightbox, tracking.
- `_partials/` – shared markup that appears on every page: `head`, `header`, `footer`, `mbar` (phone action bar) and `quote-form`.
- `tools/build.mjs` – copies the partials into every page.
- `catalogues/` – supplier PDF catalogues. `assets/images/catalogues/` holds their cover images.

## Changing the header, footer, phone bar or quote form

1. Edit the file in `_partials/`.
2. Run `node tools/build.mjs`. It updates every page between the `<!-- @include ... -->` and `<!-- @end ... -->` markers.
3. Run `node tools/build.mjs --check` before committing. It fails if any page is out of date.

Never edit the markup between include markers directly in a page; the next build overwrites it.

Include options:

- `<!-- @include header active="about.html" -->` highlights the current menu item.
- `<!-- @include quote-form subject="Netball page" sport="Netball" -->` sets the enquiry email subject and preselects the sport.

## Quote forms

Every quote form has `data-quote-form` and posts to Web3Forms. On success the visitor goes to `thank-you.html`, which is how enquiries are counted in Vercel Analytics. On failure the form shows an error with the phone number.

## Adding a page

Copy an existing page with the same layout, change the title, description, canonical URL and content inside `<main>`, run the build, then add the page to `sitemap.xml`.
