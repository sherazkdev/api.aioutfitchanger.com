import assert from "node:assert/strict";
import { test } from "node:test";
import sharp from "sharp";
import { applyAiResultWatermark } from "../src/lib/server/watermark/applyWatermark";
import { buildWatermarkBadgeSvg } from "../src/lib/server/watermark/badgeSvg";
import { watermarkGloballyEnabled } from "../src/lib/server/watermark/policy";

test("badge SVG contains approved label", () => {
  const svg = buildWatermarkBadgeSvg(1);
  assert.match(svg, /AI Generated • /);
  assert.match(svg, /Outfit Changer/);
  assert.match(svg, /rgba\(30,41,59,0\.74\)/);
  assert.match(svg, /height="38"/);
});

test("applyAiResultWatermark composites without resizing canvas", async () => {
  const base = await sharp({
    create: { width: 768, height: 1024, channels: 3, background: { r: 200, g: 210, b: 220 } },
  })
    .png()
    .toBuffer();

  const out = await applyAiResultWatermark(base);
  const meta = await sharp(out).metadata();
  assert.equal(meta.width, 768);
  assert.equal(meta.height, 1024);

  const crop = { left: 768 - 280, top: 1024 - 60, width: 260, height: 55 };
  const before = await sharp(base).extract(crop).raw().toBuffer();
  const after = await sharp(out).extract(crop).raw().toBuffer();
  assert.notDeepEqual(before, after);
});

test("watermarkGloballyEnabled respects env", () => {
  const prev = process.env.TRY_ON_WATERMARK_ENABLED;
  process.env.TRY_ON_WATERMARK_ENABLED = "false";
  assert.equal(watermarkGloballyEnabled(), false);
  process.env.TRY_ON_WATERMARK_ENABLED = prev;
});
