/**
 * airtable-sync.mjs — pull the Before/After entries from Airtable into the site.
 *
 * WHY THIS EXISTS
 *   - The Airtable token must stay secret, so the fetch runs here (server-side),
 *     never in the browser.
 *   - Airtable image URLs expire after a few hours, so this downloads each photo
 *     into ./photos/ and points the site at the local copy.
 *
 * WHAT IT DOES
 *   1. Reads every row from your Airtable table.
 *   2. Downloads the Before/After photos into ./photos/.
 *   3. Writes ./entries.json — the file the website reads (see loadEntries()).
 *
 * RUN IT
 *   Requires Node 18+ (has built-in fetch). From the project folder:
 *
 *     AIRTABLE_TOKEN=pat_xxx \
 *     AIRTABLE_BASE=app_xxx \
 *     AIRTABLE_TABLE=Entries \
 *     node airtable-sync.mjs
 *
 *   Re-run it whenever Eric changes the Airtable. (In production this runs
 *   automatically on a schedule / on publish — see the README note.)
 *
 * EXPECTED AIRTABLE COLUMNS (exact names)
 *   Order        — Number
 *   Published    — Checkbox
 *   Title        — Single line text
 *   Description  — Long text
 *   Before Photo — Attachment (one image)
 *   After Photo  — Attachment (one image)
 */

import fs from "node:fs/promises";
import path from "node:path";

const TOKEN = process.env.AIRTABLE_TOKEN;
const BASE = process.env.AIRTABLE_BASE;
const TABLE = process.env.AIRTABLE_TABLE || "Entries";
const PHOTO_DIR = "photos";

if (!TOKEN || !BASE) {
  console.error("Missing env vars. Set AIRTABLE_TOKEN and AIRTABLE_BASE (AIRTABLE_TABLE optional).");
  process.exit(1);
}

async function fetchAllRecords() {
  let records = [];
  let offset;
  do {
    const url = new URL(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent(TABLE)}`);
    if (offset) url.searchParams.set("offset", offset);
    const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
    if (!res.ok) throw new Error(`Airtable ${res.status}: ${await res.text()}`);
    const json = await res.json();
    records = records.concat(json.records);
    offset = json.offset;
  } while (offset);
  return records;
}

async function downloadAttachment(att, name) {
  if (!att || !att[0] || !att[0].url) return null;
  const a = att[0];
  const ext = (a.type && a.type.split("/")[1]) || "jpg";
  const res = await fetch(a.url);
  if (!res.ok) throw new Error(`Image download failed (${res.status}) for ${name}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const file = `${name}.${ext}`;
  await fs.writeFile(path.join(PHOTO_DIR, file), buf);
  return `./${PHOTO_DIR}/${file}`;
}

async function main() {
  await fs.mkdir(PHOTO_DIR, { recursive: true });
  const records = await fetchAllRecords();

  const entries = [];
  for (const r of records) {
    const f = r.fields || {};
    const before = await downloadAttachment(f["Before Photo"], `${r.id}-before`);
    const after = await downloadAttachment(f["After Photo"], `${r.id}-after`);
    entries.push({
      order: f.Order ?? 0,
      published: f.Published !== false,
      title: f.Title || "",
      description: f.Description || "",
      before,
      after,
    });
  }

  entries.sort((a, b) => (a.order || 0) - (b.order || 0));
  await fs.writeFile("entries.json", JSON.stringify(entries, null, 2));
  console.log(`✓ Wrote entries.json (${entries.length} entries) and downloaded images to ${PHOTO_DIR}/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
