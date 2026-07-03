# Swoosh Archive

An independent, fan-made site about the history of Nike sneakers, with a
"Live Release Feed" section that refreshes itself every day.

This is a **static site** — plain HTML/CSS/JS, no database, no backend
server to maintain. That makes it possible to host for free and have it
update itself automatically.

---

## What's in here

```
index.html                       the whole site
css/style.css                    styling
js/main.js                       renders the release feed on the page
data/releases.json               the data the feed section reads — this is
                                  what gets rewritten every day
scripts/update-releases.js       the script that refreshes releases.json
.github/workflows/update-releases.yml   tells GitHub to run that script daily
```

---

## Step 1 — Put this project on GitHub (free)

1. Go to https://github.com and create a free account if you don't have one.
2. Click the **+** in the top right → **New repository**. Name it something
   like `swoosh-archive`. Keep it **Public**. Click **Create repository**.
3. On the new repo's page, click **uploading an existing file** and drag in
   every file/folder from this project (keep the folder structure — e.g.
   `css/style.css` should stay inside a `css` folder).
4. Click **Commit changes**.

That's it — no command line needed for this part.

## Step 2 — Deploy it so it's a real website (free)

The easiest option is **GitHub Pages**, since your code is already on GitHub:

1. In your repo, go to **Settings → Pages**.
2. Under "Build and deployment", set **Source** to **Deploy from a branch**.
3. Pick the `main` branch and `/ (root)` folder, then **Save**.
4. After a minute or two, GitHub will show you a URL like
   `https://yourname.github.io/swoosh-archive/` — that's your live site.

(Netlify or Vercel are also great free options if you want nicer custom
domains later — both let you just connect your GitHub repo and click Deploy.)

## Step 3 — Turn on the daily auto-update

This is already set up in `.github/workflows/update-releases.yml` — you don't
need to write anything. Once your code is on GitHub:

1. Go to your repo's **Actions** tab.
2. You should see a workflow called **"Update sneaker release feed"**.
3. GitHub Actions needs permission to push changes back to your repo:
   go to **Settings → Actions → General**, scroll to **Workflow permissions**,
   and select **Read and write permissions**, then **Save**.
4. Click into the workflow and press **Run workflow** once to test it —
   after ~30 seconds it should show a green checkmark, and
   `data/releases.json` in your repo will update with fresh entries.

From then on, it runs automatically every day at 09:00 UTC, commits the
refreshed data, and — if you used GitHub Pages/Netlify/Vercel — your live
site picks up the change automatically on its next build.

You can change the time it runs by editing the `cron` line in the workflow
file (cron time is always in UTC).

---

## How the daily update actually works

`scripts/update-releases.js` reads two sneaker-news sites' **RSS feeds**
(Sneaker Files and Sneaker News) — RSS is a feed format sites publish
specifically so other apps can pull their headlines automatically, so this
is the legitimate, low-maintenance way to keep content fresh (rather than
scraping a page's HTML, which breaks easily and can run against a site's
terms of use).

It filters for Nike/Jordan-relevant headlines, keeps the newest ones, and
writes them into `data/releases.json`. The website's `js/main.js` reads that
file and renders the feed you see on the page.

**Limitation to know about:** RSS gives titles, links, and dates — not
always a clean price or style code. The starter data in `releases.json` has
richer fields (price, style code) because those were entered by hand from a
release-calendar site. If you want that same structured detail to update
automatically forever, you'd eventually want a paid sneaker-release API
(a few exist commercially) rather than free RSS. Until then, the feed will
show real, current headlines with dates and links — just less tabular.

## Editing the history content

The "A Short History" and "Ten Defining Models" sections are hand-written
and static — edit them directly in `index.html` any time. They won't be
touched by the daily update script (which only rewrites `data/releases.json`).

## A note on Nike's trademarks

This project doesn't use Nike's logo, product photography, or marketing
copy — it's built entirely from independently written text, and it should
stay that way to remain a legitimate fan/reference project rather than
something that could be confused with an official Nike property.
