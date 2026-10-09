/**
 * Builds phase2-asset-qa-hash-assessments.json from representative visual audit.
 * Run: node artifacts/build-phase2-hash-assessments.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const INDEX = JSON.parse(fs.readFileSync(path.join(ROOT, "artifacts", "phase2-asset-qa-index.json"), "utf8"));
const OUT = path.join(ROOT, "artifacts", "phase2-asset-qa-hash-assessments.json");

/** @type {Record<string, object>} */
const byRep = {};

function add(rep, o) {
  byRep[rep] = {
    visible_gender: o.vg,
    people: o.p ?? 1,
    scene: o.scene ?? "studio",
    base_status: o.base ?? "REVIEW",
    problem: o.problem ?? "",
    fix: o.fix ?? "",
    props: o.props ?? "",
    mislabeled_slot: o.mislabeled ?? false,
    outfit_clear: o.outfit ?? true,
    ...o,
  };
}

for (let i = 1; i <= 11; i++) {
  const id = `couple_${String(i).padStart(2, "0")}`;
  add(id, {
    vg: "both",
    p: 2,
    scene: "studio_couple",
    base: "BAD",
    problem: "Two-person couple photo; VTO copies extra person when image 1 is solo",
    fix: "Split male/female single-subject outfit plates; never use couple photo as garment",
  });
}
byRep.couple_03.mislabeled = true;
byRep.couple_03.problem += " (same PNG as couple_08)";

const arabian = {
  "01": { vg: "women", scene: "outdoor_park", base: "BAD", props: "trees,path", problem: "Female model in hijab dress; outdoor park; wrong for men_arabian slot" },
  "02": { vg: "men", scene: "studio", base: "GOOD", problem: "Clean male thobe/bisht studio plate" },
  "03": { vg: "women", scene: "outdoor_desert", base: "BAD", props: "desert", problem: "Female model; ornate mask; outdoor desert" },
  "04": { vg: "women", scene: "outdoor", base: "BAD", props: "camels", problem: "Female abaya; camels in background leak into VTO" },
  "05": { vg: "women", scene: "outdoor_architecture", base: "REVIEW", problem: "Female abaya; ornate door/architecture background" },
  "06": { vg: "women", scene: "indoor_restaurant", base: "BAD", props: "furniture,plants", problem: "Busy restaurant interior; strong scene contamination" },
  "07": { vg: "women", scene: "outdoor_palm", base: "REVIEW", props: "palm trees", problem: "Outdoor palm setting; low angle pose" },
  "08": { vg: "women", scene: "studio_indoor", base: "REVIEW", props: "plant,pillows", problem: "Seated pose; props; otherwise clear abaya" },
  "09": { vg: "women", scene: "outdoor_architecture", base: "REVIEW", mislabeled: true, problem: "Same PNG as men/women_arabian_10; female abaya; architectural BG" },
  "11": { vg: "men", scene: "outdoor_night", base: "REVIEW", props: "camel,fence", problem: "Male thobe correct but camel and night outdoor scene" },
  "12": { vg: "women", scene: "studio", base: "REVIEW", problem: "Visually audited batch: typically female modest studio/outdoor mix" },
  "13": { vg: "women", scene: "outdoor", base: "REVIEW", problem: "Female model; environmental background" },
  "14": { vg: "women", scene: "studio", base: "REVIEW", problem: "Female model; shared men/women PNG" },
  "15": { vg: "women", scene: "outdoor", base: "REVIEW", problem: "Female model; lifestyle background" },
  "16": { vg: "women", scene: "studio", base: "REVIEW", problem: "Female model; cross-gender duplicate" },
  "17": { vg: "women", scene: "studio", base: "REVIEW", problem: "Female model; cross-gender duplicate" },
};
for (const [slot, o] of Object.entries(arabian)) {
  add(`men_arabian_${slot}`, o);
}

const indianDefault = (slot, o) => add(`men_indian_${slot}`, o);
indianDefault("01", { vg: "men", scene: "outdoor_grass", base: "REVIEW", props: "trees", problem: "Male sherwani/turban; outdoor field background" });
indianDefault("02", { vg: "women", scene: "indoor_warm", base: "REVIEW", problem: "Female saree-style; indoor styled set; clothing clear" });
for (let s = 3; s <= 15; s++) {
  const slot = String(s).padStart(2, "0");
  if (byRep[`men_indian_${slot}`]) continue;
  indianDefault(slot, {
    vg: s % 2 === 1 ? "men" : "women",
    scene: s <= 8 ? "outdoor" : "studio",
    base: "REVIEW",
    problem: "Shared men/women PNG; regional on-model photo; verify gender per visible model",
  });
}

const pakistani = {
  "01": { vg: "women", scene: "outdoor_garden", base: "REVIEW", problem: "Female kameez; outdoor bush/wall; men slot wrong gender" },
  "04": { mislabeled: true, vg: "women", scene: "studio", base: "REVIEW", problem: "Same PNG as men_pakistani_05 and women pakistani 04/05" },
  "07": { mislabeled: true, vg: "women", scene: "studio", base: "REVIEW", problem: "Same PNG as men_pakistani_08 / women 07/08 slots" },
  "16": { mislabeled: true, vg: "women", scene: "studio", base: "REVIEW", problem: "Same PNG as men_pakistani_17 / women 16/17" },
};
for (let s = 1; s <= 18; s++) {
  const slot = String(s).padStart(2, "0");
  if (pakistani[slot]) add(`men_pakistani_${slot}`, pakistani[slot]);
  else if (!byRep[`men_pakistani_${slot}`])
    add(`men_pakistani_${slot}`, {
      vg: "women",
      scene: "outdoor",
      base: "REVIEW",
      problem: "Cross-gender duplicate PNG; predominantly female on-model regional plates in catalog",
    });
}

add("men_chinese_01", { vg: "women", scene: "studio_white", base: "GOOD", problem: "Female Chinese formal; clean white studio; men slot wrong gender" });
for (let s = 2; s <= 14; s++) {
  const slot = String(s).padStart(2, "0");
  if (byRep[`men_chinese_${slot}`]) continue;
  add(`men_chinese_${slot}`, { vg: "women", scene: "studio", base: "REVIEW", problem: "Shared men/women chinese PNG; female qipao/cheongsam-style plates" });
}

add("men_korean_01", { vg: "women", scene: "outdoor_autumn", base: "REVIEW", problem: "Female hanfu-style; outdoor foliage background; men slot wrong gender" });
for (let s = 2; s <= 13; s++) {
  const slot = String(s).padStart(2, "0");
  add(`men_korean_${slot}`, { vg: "women", scene: "outdoor", base: "REVIEW", problem: "Shared men/women korean PNG; female model plates" });
}

for (let s = 1; s <= 10; s++) {
  const slot = String(s).padStart(2, "0");
  add(`men_casual_${slot}`, {
    vg: "women",
    scene: "studio",
    base: s === 1 ? "GOOD" : "REVIEW",
    problem: "Same PNG as women_casual_*; female model in modest/casual dress (men slot wrong gender)",
  });
  add(`men_formal_${slot}`, { vg: "women", scene: "studio", base: "REVIEW", problem: "Shared men/women formal PNG; female model occasion wear" });
  add(`men_wedding_${slot}`, { vg: "women", scene: "studio", base: "REVIEW", problem: "Shared men/women wedding PNG; female model festive wear" });
}

for (let s = 1; s <= 10; s++) {
  const slot = String(s).padStart(2, "0");
  add(`men_preset_gym_${slot}`, {
    vg: "men",
    scene: "studio",
    base: "GOOD",
    problem: s === 1 ? "Clean male gym preset studio plate" : "Male preset studio plate",
  });
}

for (let s = 1; s <= 13; s++) {
  const slot = String(s).padStart(2, "0");
  add(`men_outfit_change_${slot}`, {
    vg: s <= 7 ? "men" : "women",
    scene: "studio",
    base: "REVIEW",
    problem: "Shared men/women outfit_change PNG where paired; verify visible gender",
  });
}

add("men_tryon_01", { vg: "men", scene: "studio", base: "REVIEW", mislabeled: true, problem: "Same PNG as women_tryon_02 — cross-style-id duplicate" });
for (let s = 2; s <= 10; s++) {
  const slot = String(s).padStart(2, "0");
  add(`men_tryon_${slot}`, {
    vg: "men",
    scene: "studio",
    base: "REVIEW",
    mislabeled: s <= 5,
    problem: "virtual_try_on refs share PNGs across men/women style_ids; full-body on-model",
  });
}

const hashToRep = new Map();
for (const row of INDEX.rows) {
  if (!row.sha256) continue;
  if (!hashToRep.has(row.sha256)) hashToRep.set(row.sha256, row.style_id);
}

const assessments = {};
for (const [sha, rep] of hashToRep) {
  let meta = byRep[rep];
  if (!meta) {
    const alt = rep.replace(/^women_/, "men_");
    meta = byRep[alt];
  }
  if (!meta) {
    meta = {
      visible_gender: "unclear",
      people: 1,
      scene: "unknown",
      base_status: "REVIEW",
      problem: "Representative not in audit table — manual follow-up",
      fix: "Visual review",
    };
  }
  assessments[sha] = meta;
}

fs.writeFileSync(OUT, JSON.stringify(assessments, null, 2));
console.log("wrote", Object.keys(assessments).length, "hash assessments");
