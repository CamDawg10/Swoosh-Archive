/**
 * update-releases.js
 * ---------------------------------------------------------------
 * Pulls headlines from public sneaker-news RSS feeds and turns
 * them into entries for data/releases.json, which the website
 * reads to render its "Live Release Feed" section.
 *
 * Why RSS and not scraping a webpage?
 * RSS feeds are explicitly published by these sites so other
 * sites/apps can syndicate their headlines — it's the legitimate,
 * intended way to pull this kind of content automatically.
 * Scraping the rendered HTML of a release-calendar page instead
 * would be fragile and could run against a site's terms of use.
 *
 * This script intentionally keeps things simple: it takes RSS
 * item titles/links/dates and stores them as "note" text rather
 * than trying to guess a structured price/style-code, since RSS
 * doesn't reliably include that. If you want the richer structured
 * rows (price, style code) seen in the seed data, you'll need a
 * paid sneaker-data API — see README.md for notes on that.
 *
 * Run manually with:  node scripts/update-releases.js
 * Runs automatically via .github/workflows/update-releases.yml
 */

const fs = require('fs');
const path = require('path');

const FEEDS = [
  { url: 'https://www.sneakerfiles.com/feed/', label: 'Sneaker Files' },
  { url: 'https://sneakernews.com/feed', label: 'Sneaker News' },
];

const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'releases.json');
const MAX_ITEMS = 12;

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'SwooshArchiveBot/1.0 (+personal fan site RSS reader)' },
  });
  if (!res.ok) throw new Error(`${url} responded ${res.status}`);
  return res.text();
}

// Minimal, dependency-free RSS <item> parser — good enough for
// title / link / pubDate, which is all we need here.
function parseRssItems(xml) {
  const items = [];
  const itemBlocks = xml.split('<item>').slice(1);
  for (const block of itemBlocks) {
    const grab = (tag) => {
      const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
      if (!m) return '';
      return m[1]
        .replace('<![CDATA[', '')
        .replace(']]>', '')
        .replace(/<[^>]+>/g, '')
        .trim();
    };
    items.push({
      title: grab('title'),
      link: grab('link'),
      pubDate: grab('pubDate'),
    });
  }
  return items;
}

function isNikeRelevant(title) {
  return /nike|jordan|air force|air max|dunk|swoosh/i.test(title);
}

async function main() {
  let collected = [];

  for (const feed of FEEDS) {
    try {
      const xml = await fetchText(feed.url);
      const items = parseRssItems(xml).filter(i => isNikeRelevant(i.title));
      collected.push(...items.map(i => ({ ...i, source: feed.label })));
    } catch (err) {
      console.error(`Skipping ${feed.label}: ${err.message}`);
    }
  }

  collected.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  collected = collected.slice(0, MAX_ITEMS);

  const releases = collected.map(item => ({
    name: item.title,
    date: item.pubDate ? new Date(item.pubDate).toISOString().slice(0, 10) : null,
    price: null,
    styleCode: null,
    note: `via ${item.source}`,
    link: item.link || null,
  }));

  const existing = fs.existsSync(OUTPUT_PATH)
    ? JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'))
    : { releases: [] };

  const output = {
    lastUpdated: new Date().toISOString(),
    source: 'Public RSS feeds (Sneaker Files, Sneaker News) — refreshed daily by scripts/update-releases.js',
    releases: releases.length ? releases : existing.releases, // don't wipe good data on a bad fetch
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`Wrote ${output.releases.length} releases to ${OUTPUT_PATH}`);
}

main().catch(err => {
  console.error('update-releases.js failed:', err);
  process.exit(1); // non-zero exit so the GitHub Action shows a visible failure
});
