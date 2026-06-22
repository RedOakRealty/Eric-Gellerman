// ───────────────────────────────────────────────────────────────────────────
//  PORTFOLIO DATA  —  the "sheet" behind the Before & After gallery.
//
//  Each object below is ONE before/after entry, the same shape a row in
//  Airtable / Google Sheets would have. To add a listing by hand, copy a
//  block, change the fields, and drop the two photos in the photos/ folder.
//
//  Fields:
//    order        number  — sort position (1, 2, 3 …). Lowest shows first.
//    published    boolean — set false to hide an entry without deleting it.
//    title        string  — heading shown under the pair.
//    description  string  — one short paragraph.
//    before       string  — path/URL to the BEFORE photo.
//    after        string  — path/URL to the AFTER photo.
// ───────────────────────────────────────────────────────────────────────────

export const entries = [
  {
    order: 1,
    published: true,
    title: "Living Room — Clear, Refresh & Stage",
    description:
      "A cluttered, dated living room was cleared out, repainted, and stripped back to refinished hardwood floors. Clean-lined staging and styling let the big picture window — and the light it brings in — become the room's standout feature.",
    before: "./photos/eg-p1-before.crop.png",
    after: "./photos/eg-p1-after.crop.png",
  },
  {
    order: 2,
    published: true,
    title: "Kitchen — Cabinets & Counters",
    description:
      "Worn oak cabinetry, tile counters, and vintage linoleum gave way to white shaker cabinets, quartz countertops, a new stainless dishwasher, and refinished hardwood — a brighter, current kitchen that reads move-in ready.",
    before: "./photos/eg-p2-before.crop.png",
    after: "./photos/eg-p2-after.crop.png",
  },
  {
    order: 3,
    published: true,
    title: "Kitchen & Dining — Full Refresh",
    description:
      "Aging appliances and patterned flooring were replaced with modern stainless steel, bright cabinetry, quartz surfaces, and a sunlit dining nook — turning a tired corner into a space buyers can picture themselves living in.",
    before: "./photos/eg-p3-before.crop.png",
    after: "./photos/eg-p3-after.crop.png",
  },
];

// ───────────────────────────────────────────────────────────────────────────
//  LOADER — the single place the website asks for entries.
//
//  Today it returns the local `entries` array above. To wire the site to an
//  Airtable base later, replace the body of this function with a fetch and
//  map the records into the same field shape — NOTHING in the page itself
//  needs to change:
//
//    const BASE = "appXXXXXXXX", TABLE = "Entries", KEY = "patXXXX...";
//    const res = await fetch(
//      `https://api.airtable.com/v0/${BASE}/${TABLE}?view=Grid%20view`,
//      { headers: { Authorization: `Bearer ${KEY}` } }
//    );
//    const json = await res.json();
//    return json.records.map((r) => ({
//      order:       r.fields.Order,
//      published:   r.fields.Published,
//      title:       r.fields.Title,
//      description: r.fields.Description,
//      before:      r.fields["Before Photo"]?.[0]?.url,
//      after:       r.fields["After Photo"]?.[0]?.url,
//    }));
// ───────────────────────────────────────────────────────────────────────────

export async function loadEntries() {
  // Prefer the synced file (generated from Airtable by airtable-sync.mjs).
  // Falls back to the built-in `entries` above until that file exists, so the
  // site never goes blank.
  try {
    const res = await fetch("./entries.json", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length) return data;
    }
  } catch (_) {
    /* no synced file yet — use the built-in entries */
  }
  return entries;
}
