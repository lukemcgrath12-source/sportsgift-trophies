#!/usr/bin/env node
/*
  SportsGift Trophies: shared partials build.

  Shared markup lives once in _partials/*.html. Each page marks where a partial goes:

      <!-- @include header active="about.html" -->
      ...generated content...
      <!-- @end header -->

  Run `node tools/build.mjs` after editing a partial. It rewrites the content between
  every pair of markers in every page, so the committed HTML is always complete and
  Vercel needs no build step. `node tools/build.mjs --check` exits with an error if any
  page is out of date (useful before committing).

  Parameters:
    header       active="<page>.html"  marks the current nav link with aria-current
    quote-form   subject="..."         added to the enquiry email subject
                 sport="..."           preselects the Sport / category option
*/
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');
const partial = (name) => readFileSync(join(root, '_partials', `${name}.html`), 'utf8').trimEnd();
const parseParams = (s) => Object.fromEntries([...(s || '').matchAll(/(\w[\w-]*)="([^"]*)"/g)].map((m) => [m[1], m[2]]));

const render = {
  header: (p) => {
    let html = partial('header');
    if (p.active) {
      html = html.replace(`<a href="${p.active}">`, `<a href="${p.active}" aria-current="page">`);
    }
    return html;
  },
  'quote-form': (p) => {
    let html = partial('quote-form').replace('{{subject}}', p.subject || 'Website');
    if (p.sport) html = html.replace(`<option>${p.sport}</option>`, `<option selected>${p.sport}</option>`);
    return html;
  },
};

const pages = readdirSync(root).filter((f) => f.endsWith('.html') && f !== 'holding.html');
const marker = /(<!-- @include ([\w-]+)((?: [\w-]+="[^"]*")*) -->)([\s\S]*?)(<!-- @end \2 -->)/g;
let changed = 0;

for (const page of pages) {
  const file = join(root, page);
  const before = readFileSync(file, 'utf8');
  const after = before.replace(marker, (_, open, name, params, _old, close) => {
    const fn = render[name] || (() => partial(name));
    return `${open}\n    ${fn(parseParams(params))}\n    ${close}`;
  });
  if (after !== before) {
    changed++;
    if (check) console.error(`out of date: ${page}`);
    else writeFileSync(file, after);
  }
}

if (check && changed) { console.error(`${changed} page(s) need a rebuild: run node tools/build.mjs`); process.exit(1); }
console.log(check ? 'all pages up to date' : `built ${pages.length} pages, ${changed} updated`);
