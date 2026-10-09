/**
 * Phase 2.3 — repair manifests, cross-gender map, couple split, replacement queue.
 * Run: node artifacts/generate-phase2-repair-phase23.mjs
 * Does NOT modify catalog PNGs or production.
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const VISUAL = path.join(ROOT, "artifacts", "phase2-asset-qa-visual.json");
const INDEX = path.join(ROOT, "artifacts", "phase2-asset-qa-index.json");
const ASSET_CSV = path.join(ROOT, ".asset-requirements", ".new-requirements", "BACKEND_ASSET_CATALOG.csv");
const PHASE1_TABS = new Set(["tops", "shirts", "bottoms", "skirts", "jackets"]);

const MANIFEST_OUT = path.join(ROOT, "artifacts", "phase2-asset-repair-manifest.json");
const CROSS_GENDER_OUT = path.join(ROOT, "artifacts", "phase2-cross-gender-repair-map.json");
const COUPLE_SPLIT_OUT = path.join(ROOT, "artifacts", "couple-duo-split-map.json");
const QUEUE_OUT = path.join(ROOT, "artifacts", "phase2-replacement-queue.json");
const REUSE_OUT = path.join(ROOT, "artifacts", "phase2-reuse-candidates.json");
const PLAN_MD = path.join(ROOT, "PHASE2_ASSET_REPAIR_PLAN.md");

const REPLACEMENT_CONTRACT = [
  "correct gender",
  "correct outfit category/tab",
  "one person only",
  "no extra people",
  "no text/watermark",
  "plain or minimal background preferred",
  "outfit unobstructed",
  "no large props or animals",
  "no dramatic environment",
  "prefer standing, front or mild 3/4, full outfit visible",
];

function catalogGenderFromId(styleId, rowGender) {
  const g = (rowGender || "").toLowerCase();
  if (g === "men") return "men";
  if (g === "women") return "women";
  if (styleId.startsWith("men_")) return "men";
  if (styleId.startsWith("women_")) return "women";
  return g || "neutral";
}

function bucketKey(v) {
  if (v.category_id === "couple_duo") return "couple_duo";
  if (v.category_id === "occasions") return v.tab_id || "occasions";
  if (v.category_id === "presets") return "presets";
  if (v.category_id === "outfit_change") return "outfit_change";
  if (v.category_id === "virtual_try_on") return "virtual_try_on";
  if (v.category_id === "wardrobe_browse") return v.tab_id || "wardrobe_browse";
  return "other";
}

function actionFor(v) {
  if (v.category_id === "couple_duo") return "SPLIT_COUPLE_REFERENCE";
  if (v.status === "GOOD") return "KEEP";
  if (v.status === "REVIEW") return "MANUAL_REVIEW";
  return "REPLACE";
}

function visibleGenderNorm(v) {
  const a = v.apparent_model_gender;
  if (a === "male" || a === "men") return "men";
  if (a === "female" || a === "women") return "women";
  if (a === "both") return "both";
  return "unclear";
}

function isWrongGender(v) {
  const cg = catalogGenderFromId(v.style_id, v.catalog_gender);
  const vg = visibleGenderNorm(v);
  if (cg === "men" && vg === "women") return true;
  if (cg === "women" && vg === "men") return true;
  return false;
}

function priorityFor(v, action) {
  if (action === "KEEP") return null;
  if (v.category_id === "couple_duo") return "P0";
  if (isWrongGender(v)) return "P0";
  if (v.status === "BAD" && /mislabeled|Duplicate|same PNG|wrong gender/i.test(v.problem || "")) return "P0";
  if (v.people_count === "2+" || v.apparent_model_gender === "both") return "P0";
  if (v.status === "BAD" && /outdoor|restaurant|camel|desert|park|scene|contamination|extra person/i.test(v.problem || ""))
    return "P0";
  if (v.status === "BAD") return "P1";
  if (v.scene === "outdoor/lifestyle" || v.props_animals) return "P1";
  if (/mislabeled|same PNG/i.test(v.problem || "")) return "P1";
  if (action === "MANUAL_REVIEW") return "P2";
  if (action === "SPLIT_COUPLE_REFERENCE") return "P0";
  return "P2";
}

function replacementRequirements(v, action) {
  if (action === "KEEP") return [];
  const cg = catalogGenderFromId(v.style_id, v.catalog_gender);
  const base = [...REPLACEMENT_CONTRACT];
  if (cg === "men" || cg === "women") base.unshift(`catalog gender: ${cg}`);
  if (v.tab_id) base.unshift(`tab/category: ${v.category_id}/${v.tab_id}`);
  else base.unshift(`category: ${v.category_id}`);
  if (action === "SPLIT_COUPLE_REFERENCE") {
    return [
      "Create two files: single male + single female from coordinated pair",
      "Each file: one person, outfit from respective side of couple plate",
      ...base,
    ];
  }
  return base;
}

function currentReference(v) {
  const rel = v.local_file ? path.relative(ROOT, v.local_file).replace(/\\/g, "/") : "";
  if (rel.startsWith("public/")) return "/" + rel.slice("public".length);
  const m = v.local_file?.match(/public[/\\](.+)$/i);
  if (m) return "/" + m[1].replace(/\\/g, "/");
  return v.local_file || "";
}

function targetFile(v, action) {
  if (action === "KEEP") return currentReference(v);
  if (action === "SPLIT_COUPLE_REFERENCE") {
    const base = v.style_id;
    return null; // couple uses split map
  }
  const ref = currentReference(v);
  if (!ref) return null;
  return ref; // same path when replaced in place (future)
}

function loadAssetCsvPaths() {
  const map = new Map();
  for (const line of fs.readFileSync(ASSET_CSV, "utf8").trim().split(/\r?\n/).slice(1)) {
    const p = line.split(",");
    if (p.length < 7) continue;
    const local = p[6];
    map.set(p[0], { local_path: local, web: p[7] });
  }
  return map;
}

function scanReuseCandidates(visual, assetPaths) {
  const found = [];
  const missing = [];
  for (const v of visual) {
    const action = actionFor(v);
    if (action === "KEEP") continue;
    const src = assetPaths.get(v.style_id)?.local_path;
    let srcExists = false;
    if (src) {
      const fp = path.join(ROOT, src.replace(/\//g, path.sep));
      srcExists = fs.existsSync(fp);
      if (srcExists && action !== "SPLIT_COUPLE_REFERENCE") {
        found.push({
          style_id: v.style_id,
          type: "source_csv_path",
          path: src,
          note: "Original seed path exists; compare to public catalog PNG before reuse",
        });
      }
    }
    if (action === "SPLIT_COUPLE_REFERENCE") {
      const male = path.join(ROOT, "public", "media", "catalog", "couple_duo", `${v.style_id}_male.png`);
      const female = path.join(ROOT, "public", "media", "catalog", "couple_duo", `${v.style_id}_female.png`);
      if (fs.existsSync(male)) found.push({ style_id: v.style_id, type: "couple_split_male", path: male });
      else missing.push({ style_id: v.style_id, need: `${v.style_id}_male.png`, reason: "couple split not created yet" });
      if (fs.existsSync(female)) found.push({ style_id: v.style_id, type: "couple_split_female", path: female });
      else missing.push({ style_id: v.style_id, need: `${v.style_id}_female.png`, reason: "couple split not created yet" });
    }
  }
  return { found, missing };
}

const visual = JSON.parse(fs.readFileSync(VISUAL, "utf8"));
const index = JSON.parse(fs.readFileSync(INDEX, "utf8"));
const assetPaths = loadAssetCsvPaths();

const manifest = [];
const priorityCounts = { P0: 0, P1: 0, P2: 0, KEEP: 0 };

for (const v of visual) {
  const action = actionFor(v);
  const priority = priorityFor(v, action);
  const replacement_required = action === "REPLACE" || action === "SPLIT_COUPLE_REFERENCE";
  if (priority) priorityCounts[priority]++;
  else priorityCounts.KEEP++;

  manifest.push({
    style_id: v.style_id,
    category: v.category_id,
    tab: v.tab_id || "",
    gender: catalogGenderFromId(v.style_id, v.catalog_gender),
    current_status: v.status,
    current_reference: currentReference(v),
    problem: v.problem,
    action,
    replacement_required,
    priority: priority || "KEEP",
    replacement_requirements: replacementRequirements(v, action),
    sha256: v.sha256,
    apparent_model_gender: v.apparent_model_gender,
  });
}

// Cross-gender repair map
const crossGender = [];
for (const group of index.duplicateGroups) {
  const ids = group.style_ids;
  const sample = visual.find((x) => ids.includes(x.style_id));
  if (!sample) continue;
  const vg = visibleGenderNorm(sample);
  const menIds = ids.filter((id) => id.startsWith("men_") || catalogGenderFromId(id, "") === "men");
  const womenIds = ids.filter((id) => id.startsWith("women_"));
  const isCrossGender = menIds.length > 0 && womenIds.length > 0;
  if (!isCrossGender) {
    if (ids.length > 1) {
      crossGender.push({
        sha256: group.sha256,
        style_ids: ids,
        visible_gender: vg,
        keep_for: [ids[0]],
        replace_for: ids.slice(1),
        note: "same-gender duplicate slots — unique asset per style_id",
      });
    }
    continue;
  }

  let keep_for = [];
  let replace_for = [];
  if (vg === "women") {
    keep_for = womenIds.filter((id) => visual.find((x) => x.style_id === id)?.status === "GOOD");
    if (keep_for.length === 0) keep_for = womenIds.slice(0, 1);
    replace_for = [...menIds, ...womenIds.filter((id) => !keep_for.includes(id))];
  } else if (vg === "men") {
    keep_for = menIds.filter((id) => visual.find((x) => x.style_id === id)?.status === "GOOD");
    if (keep_for.length === 0) keep_for = menIds.slice(0, 1);
    replace_for = [...womenIds, ...menIds.filter((id) => !keep_for.includes(id))];
  } else {
    keep_for = ids.filter((id) => visual.find((x) => x.style_id === id)?.status === "GOOD");
    replace_for = ids.filter((id) => !keep_for.includes(id));
  }
  replace_for = [...new Set(replace_for.filter((id) => !keep_for.includes(id)))];

  crossGender.push({
    sha256: group.sha256,
    style_ids: ids,
    visible_gender: vg,
    keep_for,
    replace_for,
  });
}

const crossGenderRepairGroups = crossGender.filter(
  (g) => g.replace_for.length > 0 && g.style_ids.some((id) => id.startsWith("men_") && g.style_ids.some((w) => w.startsWith("women_")))
);

// Couple split map
const coupleSplit = {};
for (let i = 1; i <= 11; i++) {
  const id = `couple_${String(i).padStart(2, "0")}`;
  coupleSplit[id] = {
    male: `/media/catalog/couple_duo/${id}_male.png`,
    female: `/media/catalog/couple_duo/${id}_female.png`,
    legacy_combined: `/media/catalog/couple_duo/${id}.png`,
    status: "proposed_not_deployed",
  };
}

// Replacement queue
const queueByBucket = {};
const addQueue = (item) => {
  const b = item.bucket;
  if (!queueByBucket[b]) queueByBucket[b] = [];
  queueByBucket[b].push(item);
};

for (const m of manifest) {
  if (!m.replacement_required) continue;
  if (m.action === "KEEP") continue;

  const v = visual.find((x) => x.style_id === m.style_id);
  const bucket = bucketKey(v);

  if (m.action === "SPLIT_COUPLE_REFERENCE") {
    for (const suffix of ["male", "female"]) {
      addQueue({
        style_id: `${m.style_id}_${suffix}`,
        gender: suffix === "male" ? "men" : "women",
        current_file: m.current_reference,
        reason: m.problem,
        target_file: `/media/catalog/couple_duo/${m.style_id}_${suffix}.png`,
        reference_requirements: m.replacement_requirements,
        priority: m.priority,
        bucket: "couple_duo",
        parent_style_id: m.style_id,
      });
    }
    continue;
  }

  if (m.action === "REPLACE") {
    addQueue({
      style_id: m.style_id,
      gender: m.gender,
      current_file: m.current_reference,
      reason: m.problem,
      target_file: m.current_reference,
      reference_requirements: m.replacement_requirements,
      priority: m.priority,
      bucket,
    });
  }
}

const queueFlat = Object.values(queueByBucket).flat();
const reuseScan = scanReuseCandidates(visual, assetPaths);

const wrongGenderReplace = manifest.filter((m) => m.action === "REPLACE" && isWrongGender(visual.find((x) => x.style_id === m.style_id)));

fs.writeFileSync(MANIFEST_OUT, JSON.stringify({ generated: new Date().toISOString(), total: manifest.length, manifest }, null, 2));
fs.writeFileSync(CROSS_GENDER_OUT, JSON.stringify({ groups: crossGender, cross_gender_group_count: crossGenderRepairGroups.length }, null, 2));
fs.writeFileSync(COUPLE_SPLIT_OUT, JSON.stringify(coupleSplit, null, 2));
fs.writeFileSync(QUEUE_OUT, JSON.stringify({ by_bucket: queueByBucket, total_items: queueFlat.length, items: queueFlat }, null, 2));
fs.writeFileSync(REUSE_OUT, JSON.stringify(reuseScan, null, 2));

const actionCounts = manifest.reduce((a, m) => {
  a[m.action] = (a[m.action] || 0) + 1;
  return a;
}, {});

let md = `# Phase 2.3 asset repair plan

**Generated:** ${new Date().toISOString()}  
**Source:** \`artifacts/phase2-asset-qa-visual.json\`  
**No catalog PNG overwrites yet. No prompt/deploy changes.**

---

## Manifest totals

| Metric | Count |
|--------|------:|
| Total styles | 258 |
| KEEP (GOOD) | ${actionCounts.KEEP ?? 0} |
| MANUAL_REVIEW | ${actionCounts.MANUAL_REVIEW ?? 0} |
| REPLACE | ${actionCounts.REPLACE ?? 0} |
| SPLIT_COUPLE_REFERENCE | ${actionCounts.SPLIT_COUPLE_REFERENCE ?? 0} |

---

## Priority (non-KEEP)

| Priority | Count |
|----------|------:|
| P0 | ${priorityCounts.P0} |
| P1 | ${priorityCounts.P1} |
| P2 | ${priorityCounts.P2} |

---

## Cross-gender duplicates

- Duplicate SHA256 groups in catalog: **${index.duplicateGroups.length}**
- Cross-gender repair groups: **${crossGenderRepairGroups.length}**
- Wrong-gender style slots marked REPLACE: **${wrongGenderReplace.length}**

See \`artifacts/phase2-cross-gender-repair-map.json\`.

---

## Couple duo split (proposal)

11 styles → 22 single-subject targets (\`*_male.png\`, \`*_female.png\`).  
Map: \`artifacts/couple-duo-split-map.json\`

---

## Replacement queue by bucket

| Bucket | Queue items |
|--------|------------:|
`;

for (const [k, v] of Object.entries(queueByBucket).sort((a, b) => a[0].localeCompare(b[0]))) {
  md += `| ${k} | ${v.length} |\n`;
}
md += `| **Total queue items** | **${queueFlat.length}** |\n`;

md += `
---

## Replacement asset contract

${REPLACEMENT_CONTRACT.map((x) => `- ${x}`).join("\n")}

---

## Reuse scan (local)

- Candidate files found: **${reuseScan.found.length}**
- Still missing / must source: **${reuseScan.missing.length}**

Details: \`artifacts/phase2-reuse-candidates.json\`

---

## Artifacts

| File |
|------|
| \`artifacts/phase2-asset-repair-manifest.json\` |
| \`artifacts/phase2-cross-gender-repair-map.json\` |
| \`artifacts/couple-duo-split-map.json\` |
| \`artifacts/phase2-replacement-queue.json\` |
| \`artifacts/phase2-reuse-candidates.json\` |
| \`artifacts/validate-phase2-assets-after-repair.mjs\` |
`;

fs.writeFileSync(PLAN_MD, md);

console.log(
  JSON.stringify(
    {
      manifest: actionCounts,
      priority: { P0: priorityCounts.P0, P1: priorityCounts.P1, P2: priorityCounts.P2 },
      wrongGenderReplace: wrongGenderReplace.length,
      crossGenderGroups: crossGenderRepairGroups.length,
      queueTotal: queueFlat.length,
      queueByBucket: Object.fromEntries(Object.entries(queueByBucket).map(([k, v]) => [k, v.length])),
      reuseFound: reuseScan.found.length,
      reuseMissing: reuseScan.missing.length,
    },
    null,
    2
  )
);
