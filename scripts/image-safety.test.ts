import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach } from "node:test";
import {
  applyImageSafetyPolicy,
  moderateImageSafety,
  setImageSafetyProviderForTests,
  type ImageSafetyProvider,
  type ImageSafetyResult,
} from "../src/lib/server/moderation/imageSafety";
import { moderateTryOnRequest, moderateGeneratedResultBuffer } from "../src/lib/server/moderation/moderateTryOn";

function result(
  adult: ImageSafetyResult["categories"]["adult"],
  racy: ImageSafetyResult["categories"]["racy"],
  violence: ImageSafetyResult["categories"]["violence"]
): ImageSafetyResult {
  return applyImageSafetyPolicy({ adult, racy, violence });
}

function mockProvider(fn: (buf: Buffer) => Promise<ImageSafetyResult>): ImageSafetyProvider {
  return { moderate: fn };
}

const tinyJpeg = Buffer.from(
  "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA//2Q==",
  "base64"
);
// Pad to pass structural min size in generated-result validator
const jpegPad = Buffer.concat([tinyJpeg, Buffer.alloc(250, 0)]);

const person = {
  dataUrl: `data:image/jpeg;base64,${tinyJpeg.toString("base64")}`,
  mime: "image/jpeg" as const,
  rawBase64Length: 400,
};

describe("image safety policy", () => {
  it("allows unlikely adult/racy and very_unlikely violence", () => {
    const r = result("UNLIKELY", "UNLIKELY", "VERY_UNLIKELY");
    assert.equal(r.allowed, true);
  });

  it("blocks adult=LIKELY", () => {
    assert.equal(result("LIKELY", "UNLIKELY", "VERY_UNLIKELY").allowed, false);
  });

  it("blocks adult=VERY_LIKELY", () => {
    assert.equal(result("VERY_LIKELY", "UNLIKELY", "VERY_UNLIKELY").allowed, false);
  });

  it("blocks racy=VERY_LIKELY", () => {
    assert.equal(result("UNLIKELY", "VERY_LIKELY", "VERY_UNLIKELY").allowed, false);
  });

  it("blocks violence=VERY_LIKELY", () => {
    assert.equal(result("UNLIKELY", "UNLIKELY", "VERY_LIKELY").allowed, false);
  });

  it("allows racy=POSSIBLE under current policy", () => {
    assert.equal(result("UNLIKELY", "POSSIBLE", "VERY_UNLIKELY").allowed, false === false);
    assert.equal(result("UNLIKELY", "POSSIBLE", "VERY_UNLIKELY").allowed, true);
  });
});

describe("moderateImageSafety with mock provider", () => {
  const prevEnabled = process.env.IMAGE_SAFETY_MODERATION_ENABLED;
  const prevFail = process.env.IMAGE_SAFETY_FAIL_CLOSED;

  beforeEach(() => {
    process.env.IMAGE_SAFETY_MODERATION_ENABLED = "1";
    process.env.IMAGE_SAFETY_FAIL_CLOSED = "1";
  });

  afterEach(() => {
    setImageSafetyProviderForTests(null);
    process.env.IMAGE_SAFETY_MODERATION_ENABLED = prevEnabled;
    process.env.IMAGE_SAFETY_FAIL_CLOSED = prevFail;
  });

  it("fail-closed on provider error", async () => {
    setImageSafetyProviderForTests(
      mockProvider(async () => {
        throw new Error("vision down");
      })
    );
    const out = await moderateImageSafety(jpegPad);
    assert.equal(out.status, "error");
    if (out.status === "error") assert.equal(out.failClosed, true);
  });

  it("disabled skips vendor", async () => {
    process.env.IMAGE_SAFETY_MODERATION_ENABLED = "0";
    let called = 0;
    setImageSafetyProviderForTests(
      mockProvider(async () => {
        called += 1;
        return result("UNLIKELY", "UNLIKELY", "VERY_UNLIKELY");
      })
    );
    const out = await moderateImageSafety(jpegPad);
    assert.equal(out.status, "disabled");
    assert.equal(called, 0);
  });
});

describe("input safety blocks provider path", () => {
  afterEach(() => setImageSafetyProviderForTests(null));

  it("unsafe source blocks before provider", async () => {
    process.env.IMAGE_SAFETY_MODERATION_ENABLED = "1";
    setImageSafetyProviderForTests(
      mockProvider(async () => result("LIKELY", "UNLIKELY", "VERY_UNLIKELY"))
    );
    const fail = await moderateTryOnRequest({
      promptTexts: ["Apply a blue jacket"],
      person,
    });
    assert.ok(fail);
    assert.equal(fail?.code, "MODERATION_BLOCKED");
  });

  it("unsafe reference blocks before provider", async () => {
    process.env.IMAGE_SAFETY_MODERATION_ENABLED = "1";
    let n = 0;
    setImageSafetyProviderForTests(
      mockProvider(async () => {
        n += 1;
        // first call (person) safe, second (garment) blocked
        if (n === 1) return result("UNLIKELY", "UNLIKELY", "VERY_UNLIKELY");
        return result("UNLIKELY", "VERY_LIKELY", "VERY_UNLIKELY");
      })
    );
    const fail = await moderateTryOnRequest({
      promptTexts: ["Apply outfit"],
      person,
      garment: person,
    });
    assert.ok(fail);
    assert.equal(fail?.code, "MODERATION_BLOCKED");
    assert.equal(n, 2);
  });
});

describe("generated output safety", () => {
  afterEach(() => setImageSafetyProviderForTests(null));

  it("unsafe output returns MODERATION_BLOCKED", async () => {
    process.env.IMAGE_SAFETY_MODERATION_ENABLED = "1";
    setImageSafetyProviderForTests(
      mockProvider(async () => result("VERY_LIKELY", "UNLIKELY", "VERY_UNLIKELY"))
    );
    const fail = await moderateGeneratedResultBuffer(jpegPad);
    assert.ok(fail);
    assert.equal(fail?.code, "MODERATION_BLOCKED");
  });

  it("safe output continues (null failure)", async () => {
    process.env.IMAGE_SAFETY_MODERATION_ENABLED = "1";
    setImageSafetyProviderForTests(
      mockProvider(async () => result("UNLIKELY", "UNLIKELY", "VERY_UNLIKELY"))
    );
    const fail = await moderateGeneratedResultBuffer(jpegPad);
    assert.equal(fail, null);
  });

  it("provider error fail-closed does not allow persist", async () => {
    process.env.IMAGE_SAFETY_MODERATION_ENABLED = "1";
    process.env.IMAGE_SAFETY_FAIL_CLOSED = "1";
    setImageSafetyProviderForTests(
      mockProvider(async () => {
        throw new Error("boom");
      })
    );
    const fail = await moderateGeneratedResultBuffer(jpegPad);
    assert.ok(fail);
    assert.equal(fail?.code, "MODERATION_UNAVAILABLE");
  });
});
