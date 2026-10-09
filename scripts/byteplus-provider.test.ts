import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BYTEPLUS_MIN_PIXELS,
  buildBytePlusBeautyRequest,
  bytePlusAspectRatioDriftPercent,
  extractBytePlusResultUrl,
  formatBytePlusSize,
  parseBytePlusSize,
} from "../src/lib/server/byteplus/imageGeneration.ts";
import { resetServerEnvCache } from "../src/lib/server/env.ts";
import {
  isBeautyTryOn,
  resolveTryOnImageProvider,
} from "../src/lib/server/tryOn/providerSelection.ts";

const HIJAB_CMD =
  "COMMAND: style_ref=women_hijab_02 | category=hijab_styles | pipeline=women | region=hijab | Edit hijab only.";
const OUTFIT_CMD =
  "COMMAND: style_ref=men_tryon_01 | category=virtual_try_on | pipeline=men | region=outfit | Apply outfit.";
const BOTTOMS_CMD =
  "COMMAND: style_ref=men_bottoms_03 | category=wardrobe_browse | pipeline=men | tab=bottoms | region=outfit | pants.";
const HAIR_CMD =
  "COMMAND: style_ref=men_hair_styles_02 | category=hair_styles | pipeline=men | region=hair_style | hair.";

function withEnv(overrides: Record<string, string>, fn: () => void) {
  const prev: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(overrides)) {
    prev[k] = process.env[k];
    process.env[k] = v;
  }
  resetServerEnvCache();
  try {
    fn();
  } finally {
    for (const k of Object.keys(overrides)) {
      if (prev[k] === undefined) delete process.env[k];
      else process.env[k] = prev[k];
    }
    resetServerEnvCache();
  }
}

function assertValidBytePlusSize(size: string, srcW: number, srcH: number) {
  const { width: w, height: h } = parseBytePlusSize(size);
  assert.ok(w * h >= BYTEPLUS_MIN_PIXELS, `area ${w * h} < min`);
  assert.equal(w % 16, 0);
  assert.equal(h % 16, 0);
  assert.ok(w >= 512 && w <= 4096);
  assert.ok(h >= 512 && h <= 4096);
  const drift = bytePlusAspectRatioDriftPercent(srcW, srcH, size);
  assert.ok(drift < 5, `aspect drift ${drift}% too high for ${size}`);
}

describe("formatBytePlusSize", () => {
  it("portrait 479x640 — near-min area, preserves aspect (not 512x1808)", () => {
    const size = formatBytePlusSize(479, 640);
    assertValidBytePlusSize(size, 479, 640);
    const { width, height } = parseBytePlusSize(size);
    assert.notEqual(`${width}x${height}`, "512x1808");
    assert.ok(height < 1400, `height ${height} still extreme`);
    assert.ok(width > 512);
  });

  it("portrait 768x1024 — meets min area with ~3:4 aspect", () => {
    const size = formatBytePlusSize(768, 1024);
    assertValidBytePlusSize(size, 768, 1024);
    const { width, height } = parseBytePlusSize(size);
    assert.ok(Math.abs(width / height - 768 / 1024) < 0.02);
  });

  it("landscape 1024x768", () => {
    const size = formatBytePlusSize(1024, 768);
    assertValidBytePlusSize(size, 1024, 768);
    const { width, height } = parseBytePlusSize(size);
    assert.ok(width > height);
  });

  it("square 600x600", () => {
    const size = formatBytePlusSize(600, 600);
    assertValidBytePlusSize(size, 600, 600);
    const { width, height } = parseBytePlusSize(size);
    assert.ok(Math.abs(width - height) <= 16);
  });

  it("already above minimum keeps source aspect (900x1350)", () => {
    const size = formatBytePlusSize(900, 1350);
    assertValidBytePlusSize(size, 900, 1350);
    const drift = bytePlusAspectRatioDriftPercent(900, 1350, size);
    assert.ok(drift < 2);
  });
});

describe("BytePlus beauty request", () => {
  it("orders images person then reference", () => {
    const req = buildBytePlusBeautyRequest(
      {
        prompt: "test prompt",
        personDataUrl: "data:image/jpeg;base64,AAA",
        referenceDataUrl: "data:image/png;base64,BBB",
        width: 768,
        height: 1024,
      },
      "dola-seedream-5-0-flash-260915"
    );
    assert.equal(req.model, "dola-seedream-5-0-flash-260915");
    assert.deepEqual(req.image, ["data:image/jpeg;base64,AAA", "data:image/png;base64,BBB"]);
    assert.equal(req.prompt, "test prompt");
    assert.equal(req.watermark, false);
    assert.equal(req.response_format, "url");
  });

  it("extracts url from response", () => {
    const url = extractBytePlusResultUrl({ data: [{ url: "https://cdn.example/out.jpg" }] });
    assert.equal(url, "https://cdn.example/out.jpg");
  });
});

describe("try-on provider selection", () => {
  it("detects beauty from COMMAND region", () => {
    assert.equal(isBeautyTryOn(HIJAB_CMD, "hijab_styles"), true);
    assert.equal(isBeautyTryOn(HAIR_CMD, "hair_styles"), true);
    assert.equal(isBeautyTryOn(OUTFIT_CMD, "virtual_try_on"), false);
    assert.equal(isBeautyTryOn(BOTTOMS_CMD, "wardrobe_browse"), false);
  });

  it("defaults to bfl", () => {
    withEnv(
      {
        MONGODB_URI: "mongodb://127.0.0.1:27017/test",
        JWT_ACCESS_SECRET: "x".repeat(32),
        JWT_REFRESH_SECRET: "y".repeat(32),
        TRY_ON_PROVIDER: "bfl",
      },
      () => {
        assert.equal(resolveTryOnImageProvider(HIJAB_CMD, "hijab_styles", false), "bfl");
      }
    );
  });

  it("beauty regions use byteplus when TRY_ON_PROVIDER=byteplus", () => {
    withEnv(
      {
        MONGODB_URI: "mongodb://127.0.0.1:27017/test",
        JWT_ACCESS_SECRET: "x".repeat(32),
        JWT_REFRESH_SECRET: "y".repeat(32),
        TRY_ON_PROVIDER: "byteplus",
        ARK_MODEL: "dola-seedream-5-0-flash-260915",
      },
      () => {
        assert.equal(resolveTryOnImageProvider(HIJAB_CMD, "hijab_styles", false), "byteplus");
        assert.equal(resolveTryOnImageProvider(HAIR_CMD, "hair_styles", false), "byteplus");
      }
    );
  });

  it("VTO outfit and phase1 bottoms stay on BFL when byteplus configured", () => {
    withEnv(
      {
        MONGODB_URI: "mongodb://127.0.0.1:27017/test",
        JWT_ACCESS_SECRET: "x".repeat(32),
        JWT_REFRESH_SECRET: "y".repeat(32),
        TRY_ON_PROVIDER: "byteplus",
      },
      () => {
        assert.equal(resolveTryOnImageProvider(OUTFIT_CMD, "virtual_try_on", true), "bfl");
        assert.equal(resolveTryOnImageProvider(OUTFIT_CMD, "virtual_try_on", false), "bfl");
        assert.equal(resolveTryOnImageProvider(BOTTOMS_CMD, "wardrobe_browse", true), "bfl");
      }
    );
  });
});
