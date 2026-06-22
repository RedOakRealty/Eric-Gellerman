# Eric Gellerman — Before & After site

A static portfolio site hosted on GitHub Pages. The before/after entries are
managed entirely in **Airtable** — no code editing required to add a listing.

## How it works

```
Eric edits Airtable  →  GitHub Action runs the sync  →  GitHub Pages updates
```

1. **Airtable** holds the entries (one row each).
2. **`airtable-sync.mjs`** (run by the GitHub Action) reads the rows, downloads
   the photos into `photos/`, and writes `entries.json`.
3. The page (`Eric Gellerman Portfolio.dc.html`, published as `index.html`)
   reads `entries.json` and renders the gallery.

The Airtable token and Base ID live in **GitHub Secrets**, never in the code.

---

## One-time setup

### 1. Airtable
Create a base with a table named **`Entries`** and these exact columns:

| Column         | Type                |
| -------------- | ------------------- |
| `Order`        | Number              |
| `Published`    | Checkbox            |
| `Title`        | Single line text    |
| `Description`  | Long text           |
| `Before Photo` | Attachment (1 image)|
| `After Photo`  | Attachment (1 image)|

Create a **read-only token** at airtable.com/create/tokens with scope
`data.records:read`, limited to this one base.

### 2. GitHub repo secrets
Repo → **Settings → Secrets and variables → Actions → New repository secret**:

- `AIRTABLE_TOKEN` → your `pat…` token
- `AIRTABLE_BASE` → your `app…` Base ID

### 3. Enable GitHub Pages
Repo → **Settings → Pages** → Source: **Deploy from a branch** →
Branch: **main** / **/ (root)** → Save.

That's it.

---

## Eric's day-to-day (no code)

To add a listing: open Airtable → new row → type a **Title** and
**Description**, drag in the **Before Photo** and **After Photo**, tick
**Published**. The site updates within the hour (or hit **Run workflow** in the
Actions tab for an instant refresh).

- Reorder → change the `Order` number.
- Temporarily hide one → untick `Published`.
- Remove → delete the row.

---

## Updating frequency
The sync runs **hourly** (see `.github/workflows/sync.yml`, the `cron` line) and
on demand via the Actions tab's **Run workflow** button. Change the cron to run
more or less often.

## Running the sync manually (optional)
With Node 18+ installed locally:

```bash
AIRTABLE_TOKEN=pat_xxx AIRTABLE_BASE=app_xxx AIRTABLE_TABLE=Entries node airtable-sync.mjs
```
