import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  COUPLE_DUO_PRODUCTION_STYLE_IDS,
  isCoupleDuoCombinedStyleId,
  normalizePersonGender,
  resolveCoupleDuoGarmentImageUrl,
} from "../src/lib/server/bfl/coupleDuoGarmentRouting.ts";

describe("couple_duo garment routing", () => {
  it("recognizes combined couple style ids only", () => {
    assert.equal(isCoupleDuoCombinedStyleId("couple_02"), true);
    assert.equal(isCoupleDuoCombinedStyleId("couple_02_male"), false);
    assert.equal(isCoupleDuoCombinedStyleId("men_casual_01"), false);
  });

  it("maps person gender to split asset paths (not style_id)", () => {
    assert.equal(
      resolveCoupleDuoGarmentImageUrl("couple_02", "men"),
      "/media/catalog/couple_duo/couple_02_male.png"
    );
    assert.equal(
      resolveCoupleDuoGarmentImageUrl("couple_02", "women"),
      "/media/catalog/couple_duo/couple_02_female.png"
    );
  });

  it("normalizes person gender aliases", () => {
    assert.equal(normalizePersonGender("male"), "men");
    assert.equal(normalizePersonGender("women"), "women");
    assert.equal(normalizePersonGender(""), null);
  });

  it("covers couple_01 through couple_11 production ids", () => {
    assert.equal(COUPLE_DUO_PRODUCTION_STYLE_IDS.length, 11);
    for (const id of COUPLE_DUO_PRODUCTION_STYLE_IDS) {
      assert.match(resolveCoupleDuoGarmentImageUrl(id, "men") ?? "", /_male\.png$/);
      assert.match(resolveCoupleDuoGarmentImageUrl(id, "women") ?? "", /_female\.png$/);
    }
  });
});
