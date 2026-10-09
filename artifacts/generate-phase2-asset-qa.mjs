/**
 * Builds per-hash visual QA lookup + PHASE2_ASSET_QA.md
 * Run after updating hashAssessments from visual review: npx tsx artifacts/generate-phase2-asset-qa.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const INDEX = path.join(ROOT, "artifacts", "phase2-asset-qa-index.json");
const OUT_MD = path.join(ROOT, "PHASE2_ASSET_QA.md");
const OUT_JSON = path.join(ROOT, "artifacts", "phase2-asset-qa-results.json");

/** Per sha256 (full hash from index rows). Filled from visual audit of 148 unique PNGs. */
const hashAssessments = JSON.parse(
  fs.readFileSync(path.join(ROOT, "artifacts", "phase2-asset-qa-hash-assessments.json"), "utf8")
);

function bucketKey(row) {
  if (row.category_id === "couple_duo") return "couple_duo";
  if (row.category_id === "occasions") return row.tab_id || "occasions";
  if (row.category_id === "presets") return "presets";
  if (row.category_id === "outfit_change") return "outfit_change";
  if (row.category_id === "virtual_try_on") return "virtual_try_on";
  if (row.category_id === "wardrobe_browse") return row.tab_id || "wardrobe_browse";
  return row.category_id;
}

function catalogGender(row) {
  const g = (row.gender || "").toLowerCase();
  if (g === "men" || g === "man") return "men";
  if (g === "women" || g === "woman") return "women";
  return "neutral";
}

function assignStatus(row, assessment) {
  if (row.category_id === "couple_duo") {
    return {
      status: "BAD",
      people: 2,
      problem: assessment.problem || "Two-person couple plate in garment slot; unsafe when image 1 has one person",
      fix: assessment.fix || "Split into separate male/female clothing references or single-subject plates; do not use couple photo as garment input",
      ...assessment,
    };
  }

  const cg = catalogGender(row);
  const vg = assessment.visible_gender; // men | women | both | unclear
  const base = assessment.base_status || assessment.status || "REVIEW";

  if (vg === "both") {
    return { status: "BAD", people: 2, problem: "Multiple people in reference", fix: "Single-subject outfit reference", ...assessment };
  }

  if (cg === "men" && vg === "women") {
    return {
      status: "BAD",
      people: assessment.people ?? 1,
      problem: "Wrong gender: catalog men slot but reference shows female model",
      fix: "Replace with men’s outfit plate matching style_id",
      ...assessment,
    };
  }
  if (cg === "women" && vg === "men") {
    return {
      status: "BAD",
      people: assessment.people ?? 1,
      problem: "Wrong gender: catalog women slot but reference shows male model",
      fix: "Replace with women’s outfit plate matching style_id",
      ...assessment,
    };
  }

  if (assessment.mislabeled_slot) {
    return {
      status: "BAD",
      people: assessment.people ?? 1,
      problem: assessment.problem || "Duplicate/mislabeled slot (same PNG as another style_id)",
      fix: assessment.fix || "Unique asset per style_id",
      ...assessment,
    };
  }

  return {
    status: base,
    people: assessment.people ?? 1,
    problem: assessment.problem || "",
    fix: assessment.fix || (base === "GOOD" ? "None" : "See problem"),
    ...assessment,
  };
}

const { rows } = JSON.parse(fs.readFileSync(INDEX, "utf8"));
const results = [];
const counts = { GOOD: 0, REVIEW: 0, BAD: 0 };
const bucketCounts = {};

for (const row of rows) {
  const ha = hashAssessments[row.sha256];
  if (!ha) {
    results.push({ ...row, status: "REVIEW", problem: "No visual assessment record for hash", fix: "Manual review" });
    counts.REVIEW++;
    continue;
  }
  const a = assignStatus(row, ha);
  results.push({
    style_id: row.style_id,
    category_id: row.category_id,
    tab_id: row.tab_id,
    gender: row.gender,
    image_url: row.image_url,
    sha256: row.sha256?.slice(0, 16),
    status: a.status,
    people: a.people,
    scene: a.scene,
    visible_gender: a.visible_gender,
    problem: a.problem,
    recommended_fix: a.fix,
    vto_safe: a.status === "GOOD",
  });
  counts[a.status]++;
  const bk = bucketKey(row);
  if (!bucketCounts[bk]) bucketCounts[bk] = { GOOD: 0, REVIEW: 0, BAD: 0 };
  bucketCounts[bk][a.status]++;
}

fs.writeFileSync(OUT_JSON, JSON.stringify({ counts, bucketCounts, results }, null, 2));

const badReview = results.filter((r) => r.status !== "GOOD");

let md = `# Phase 2.2 full-outfit reference asset QA

**Generated:** ${new Date().toISOString()}  
**Scope:** 258 Phase 2 VTO styles — visual + catalog cross-check.  
**No catalog or production changes.**

---

## Summary

| Status | Count |
|--------|------:|
| GOOD | ${counts.GOOD} |
| REVIEW | ${counts.REVIEW} |
| BAD | ${counts.BAD} |
| **Total** | **258** |

---

## By bucket

| Bucket | GOOD | REVIEW | BAD | Total |
|--------|-----:|-------:|----:|------:|
`;

for (const [k, v] of Object.entries(bucketCounts).sort((a, b) => a[0].localeCompare(b[0]))) {
  const t = v.GOOD + v.REVIEW + v.BAD;
  md += `| ${k} | ${v.GOOD} | ${v.REVIEW} | ${v.BAD} | ${t} |\n`;
}

md += `
---

## Cross-gender duplicate finding

**101** style pairs/groups share the exact same PNG between \`men_*\` and \`women_*\` slots (102 duplicate groups total in catalog).  
**73** of those groups are regional wardrobe (\`arabian\`, \`indian\`, \`pakistani\`, \`chinese\`, \`korean\`).  
For each shared file, **at most one gender slot can be GOOD**; the other is **BAD** unless the image is truly unisex (rare).

See \`artifacts/phase2-asset-qa-index.json\` → \`duplicateGroups\`.

---

## couple_duo (separate audit)

All \`couple_01\`–\`couple_11\` references are **full couple photographs** (2 people, linked poses).  
**None are safe** when image 1 contains a single person — VTO copies the second person.  
**Recommendation:** split male/female outfit plates or flat-lay; never use two-person photo as \`garment\` for solo try-on.

| style_id | People | Safe for 1-person image 1? | Status |
|----------|-------:|:--------------------------:|--------|
`;

for (const r of results.filter((x) => x.category_id === "couple_duo")) {
  md += `| ${r.style_id} | 2 | No | ${r.status} |\n`;
}

md += `
---

## BAD and REVIEW styles

| style_id | category/tab | gender | people | problem | recommended fix |
|----------|--------------|--------|-------:|---------|-----------------|
`;

for (const r of badReview.sort((a, b) => a.status.localeCompare(b.status) || a.style_id.localeCompare(b.style_id))) {
  md += `| ${r.style_id} | ${r.category_id}/${r.tab_id || "—"} | ${r.gender || "—"} | ${r.people} | ${r.problem.replace(/\|/g, "/")} | ${r.recommended_fix.replace(/\|/g, "/")} |\n`;
}

md += `
---

## Priority replacements (fix first)

1. **All \`couple_duo\` (11)** — split references; remove two-person garment plates.  
2. **Confirmed wrong-gender regional slots** — e.g. \`men_arabian_01\` / \`women_indian_01\` shared files where visible model ≠ catalog gender.  
3. **Outdoor/lifestyle regional plates** — replace with studio/plain-background same-gender plates.  
4. **Occasions / outfit_change / virtual_try_on** — stop sharing one PNG across \`men_*\` and \`women_*\`; replace with gender-matched assets.  
5. **Mislabeled duplicate slots** — \`men_arabian_09\`=\`men_arabian_10\`, pakistani 04/05, 07/08, 16/17, try-on cross-refs.

---

## Artifacts

| File | Purpose |
|------|---------|
| \`PHASE2_ASSET_QA.md\` | This report |
| \`artifacts/phase2-asset-qa-index.json\` | 258 rows + SHA256 duplicate groups |
| \`artifacts/phase2-asset-qa-hash-assessments.json\` | Per-file visual assessment (148 unique hashes) |
| \`artifacts/phase2-asset-qa-results.json\` | Machine-readable 258 outcomes |

`;

fs.writeFileSync(OUT_MD, md);
console.log(JSON.stringify({ counts, bad: counts.BAD, review: counts.REVIEW, good: counts.GOOD }, null, 2));
