# Swoosh Archive

An independent, fan-made site about the history of Nike sneakers: a
timeline, ten defining silhouettes, a searchable lookup for about 50
landmark models, and direct links out to Nike's own site for anything
current (price, style codes, availability).

This is a **static site** — plain HTML/CSS/JS, no database, no backend
server. That makes it free to host and simple to maintain.

---

## Why it's built this way

An earlier version of this project tried to auto-generate a "live release
feed" from third-party sneaker blogs. Some of that data turned out to be
inaccurate, and there's no public, official API from Nike or SNKRS to pull
from instead — SNKRS is a login-walled app, and scraping it isn't something
this project does.

So the design changed to two clearly separated things:

1. **A hand-written archive** (`data/shoes.json`) of about 50 genuinely
   significant models, with real history and cultural context. This is
   static and doesn't change — it doesn't need to, since sneaker history
   doesn't change.
2. **A direct link-out to Nike.com's own search** for anything current or
   specific (a colorway, a style code, a price, whether something is in
   stock). Nike.com is the only source that's guaranteed to be correct for
   that kind of detail, so rather than mirror it unreliably, the site just
   sends you there.

## What's in here

```
index.html            the whole site
css/style.css          styling
js/main.js             timeline animation + the shoe lookup search
data/shoes.json        the hand-written model archive — edit this to add shoes
package.json           basic project info (no dependencies needed)
```

---

## Step 1 — Put this project on GitHub (free)

1. Go to https://github.com and create a free account if you don't have one.
2. Click **+** → **New repository**. Name it something like `swoosh-archive`.
   Keep it Public. Click **Create repository**.
3. On the repo page, click **uploading an existing file**, then drag in
   everything from inside this project's folder (keep the folder structure —
   `css/style.css` should stay inside a `css` folder, etc).
4. Click **Commit changes**.

## Step 2 — Turn it into a live website (free)

1. In your repo, go to **Settings → Pages**.
2. Under "Build and deployment," set **Source** to **Deploy from a branch**.
3. Pick the `main` branch and `/ (root)` folder, then **Save**.
4. After a minute or two, refresh that page — GitHub will show a link like
   `https://yourname.github.io/swoosh-archive/`. That's your live site.

There's no automated job to turn on this time — the site is entirely
self-contained, so once it's deployed, it's done. The only thing that
"updates daily" is effectively Nike.com itself, which the lookup tool links
out to live.

---

## Adding more shoes to the archive

Open `data/shoes.json` and add an entry to the `shoes` array following this
shape:

```json
{
  "id": "unique-id-no-spaces",
  "name": "Nike Model Name",
  "aka": ["Nickname", "Other nickname"],
  "year": 1999,
  "category": "Basketball",
  "designer": "Optional — only include if you're confident",
  "tags": ["basketball", "icon"],
  "summary": "One or two sentences: what the shoe is and its key feature.",
  "significance": "One or two sentences: why it mattered."
}
```

A few notes on keeping this trustworthy:

- **Don't add style codes/SKUs unless you can verify them.** That's exactly
  what went wrong with the old release feed. The lookup tool intentionally
  hands off to Nike.com's real search for that kind of specific numeric
  detail instead of guessing.
- **`aka` and `tags` are what the search matches against**, along with
  `name` and `category` — add nicknames people are likely to actually type.
- Changes here take effect as soon as you commit them (through the same
  "upload files" flow from Step 1, or by editing the file directly on
  GitHub — click the file, then the pencil/edit icon).

## Editing the history and models sections

The "A Short History" timeline and "Ten Defining Models" grid are written
directly into `index.html` — edit the text there any time.

## A note on Nike's trademarks

This project doesn't use Nike's logo, product photography, or marketing
copy — it's built from independently written text and links out to Nike's
own site for anything official. Keep it that way so it stays a legitimate
fan/reference project rather than something that could be mistaken for an
official Nike property.
