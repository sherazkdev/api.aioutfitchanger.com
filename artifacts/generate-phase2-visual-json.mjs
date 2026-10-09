/**
 * Phase 2.2 visual QA deliverable: 258 entries with shared hash visual fields.
 * Run: node artifacts/generate-phase2-visual-json.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const INDEX = path.join(ROOT, "artifacts", "phase2-asset-qa-index.json");
const HASH_ASSESS = path.join(ROOT, "artifacts", "phase2-asset-qa-hash-assessments.json");
const OUT = path.join(ROOT, "artifacts", "phase2-asset-qa-visual.json");

const hashAssessments = JSON.parse(fs.readFileSync(HASH_ASSESS, "utf8"));
const { rows } = JSON.parse(fs.readFileSync(INDEX, "utf8"));

const hashToStyleIds = new Map();
for (const row of rows) {
  if (!row.sha256) continue;
  if (!hashToStyleIds.has(row.sha256)) hashToStyleIds.set(row.sha256, []);
  hashToStyleIds.get(row.sha256).push(row.style_id);
}
for (const [, ids] of hashToStyleIds) ids.sort();

function representativeStyleId(sha256) {
  const ids = hashToStyleIds.get(sha256) || [];
  const men = ids.find((id) => id.startsWith("men_"));
  if (men) return men;
  const couple = ids.find((id) => id.startsWith("couple_"));
  if (couple) return couple;
  return ids[0] || "";
}

function catalogGender(row) {
  const g = (row.gender || "").toLowerCase();
  if (g === "men" || g === "man") return "men";
  if (g === "women" || g === "woman") return "women";
  if (row.style_id.startsWith("men_")) return "men";
  if (row.style_id.startsWith("women_")) return "women";
  return "";
}

function apparentGender(vg) {
  if (vg === "men") return "male";
  if (vg === "women") return "female";
  if (vg === "both") return "both";
  if (vg === "unclear") return "unclear";
  return vg || "unclear";
}

function mapScene(scene) {
  if (!scene) return "studio/plain";
  if (
    scene === "studio" ||
    scene === "studio_couple" ||
    scene === "studio_indoor" ||
    scene === "studio_white" ||
    scene === "indoor_warm"
  ) {
    return "studio/plain";
  }
  return "outdoor/lifestyle";
}

function peopleCountLabel(n) {
  if (n >= 2) return "2+";
  return "1";
}

function assignStatus(row, assessment) {
  if (row.category_id === "couple_duo") {
    return {
      status: "REVIEW",
      problem:
        assessment.problem ||
        "Two people (couple_duo); outfits visible but unsafe as single-person image1 garment ref",
      recommended_fix:
        assessment.fix ||
        "Split male/female single-subject outfit plates; do not use couple photo as solo VTO garment",
      people: assessment.people ?? 2,
    };
  }

  const cg = catalogGender(row);
  const vg = assessment.visible_gender;
  const base = assessment.base_status || assessment.status || "REVIEW";

  if (vg === "both") {
    return {
      status: "BAD",
      people: assessment.people ?? 2,
      problem: assessment.problem || "Multiple people in reference",
      recommended_fix: assessment.fix || "Single-subject outfit reference",
    };
  }

  if (cg === "men" && vg === "women") {
    return {
      status: "BAD",
      people: assessment.people ?? 1,
      problem:
        assessment.problem ||
        "Wrong gender: catalog men slot but reference shows female model",
      recommended_fix: assessment.fix || "Replace with men's outfit plate matching style_id",
    };
  }
  if (cg === "women" && vg === "men") {
    return {
      status: "BAD",
      people: assessment.people ?? 1,
      problem:
        assessment.problem ||
        "Wrong gender: catalog women slot but reference shows male model",
      recommended_fix: assessment.fix || "Replace with women's outfit plate matching style_id",
    };
  }

  if (assessment.mislabeled_slot || assessment.mislabeled) {
    return {
      status: "BAD",
      people: assessment.people ?? 1,
      problem: assessment.problem || "Duplicate/mislabeled slot (same PNG as another style_id)",
      recommended_fix: assessment.fix || "Unique asset per style_id",
    };
  }

  return {
    status: base,
    people: assessment.people ?? 1,
    problem: assessment.problem || "",
    recommended_fix:
      assessment.fix || (base === "GOOD" ? "None" : "Replace or reshoot per problem"),
  };
}

const visual = [];
for (const row of rows) {
  const ha = hashAssessments[row.sha256];
  const rep = representativeStyleId(row.sha256);
  const shared = [...(hashToStyleIds.get(row.sha256) || [])];
  const slot = assignStatus(row, ha || {});

  let status = slot.status;
  let problem = slot.problem;
  let recommended_fix = slot.recommended_fix;

  if (row.category_id === "couple_duo") {
    status = "BAD";
    problem =
      ha?.problem ||
      "Two-person couple photo; VTO copies extra person when image 1 is solo";
    recommended_fix =
      ha?.fix ||
      "Split male/female single-subject outfit plates; never use couple photo as garment";
  }

  if (status === "GOOD") {
    problem = "";
    recommended_fix = "None";
  }

  visual.push({
    style_id: row.style_id,
    representative_style_id: rep,
    style_ids_sharing_hash: shared,
    sha256: row.sha256,
    local_file: row.local_file,
    people_count: peopleCountLabel(slot.people),
    scene: mapScene(ha?.scene),
    scene_detail: ha?.scene || "",
    props_animals: ha?.props || "",
    apparent_model_gender: apparentGender(ha?.visible_gender),
    catalog_gender: catalogGender(row),
    category_id: row.category_id,
    tab_id: row.tab_id || "",
    status,
    problem,
    recommended_fix,
  });
}

fs.writeFileSync(OUT, JSON.stringify(visual, null, 2));
console.log(
  JSON.stringify(
    {
      entries: visual.length,
      status: visual.reduce((a, r) => {
        a[r.status] = (a[r.status] || 0) + 1;
        return a;
      }, {}),
      out: OUT,
    },
    null,
    2
  )
);
