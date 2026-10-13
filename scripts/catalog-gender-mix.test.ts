import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapCatalog } from "../src/lib/server/content/mappers.ts";
import { shouldServeWardrobeForVirtualTryon } from "../src/lib/server/content/virtualTryOnCatalog.ts";

describe("catalog gender optional (mixed men + women)", () => {
  it("VTO garment tabs use wardrobe grid even without gender", () => {
    assert.equal(shouldServeWardrobeForVirtualTryon("virtual_try_on", "shirts", undefined), true);
    assert.equal(shouldServeWardrobeForVirtualTryon("virtual_try_on", "shirts", "men"), true);
    assert.equal(shouldServeWardrobeForVirtualTryon("virtual_try_on", "all", "men"), false);
    assert.equal(shouldServeWardrobeForVirtualTryon("beard_styles", "shirts", undefined), false);
  });

  it("mapCatalog without gender keeps both pipelines for genderScope both", () => {
    const doc = {
      categoryId: "wardrobe_browse",
      titleKey: "wardrobeBrowseTitle",
      genderScope: "both",
      genderTabs: [],
      tabs: [{ id: "shirts" }],
      items: [
        {
          id: "men_shirts_01",
          tabId: "shirts",
          genderTabId: "men",
          gender: "men",
          imageUrl: "/m1.png",
          sortOrder: 1,
          enabled: true,
        },
        {
          id: "women_shirts_01",
          tabId: "shirts",
          genderTabId: "women",
          gender: "women",
          imageUrl: "/w1.png",
          sortOrder: 2,
          enabled: true,
        },
      ],
    };
    const mixed = mapCatalog(doc as Parameters<typeof mapCatalog>[0], "en", "shirts");
    assert.equal(mixed.items.length, 2);
    const menOnly = mapCatalog(doc as Parameters<typeof mapCatalog>[0], "en", "shirts", "men");
    assert.equal(menOnly.items.length, 1);
    assert.equal(menOnly.items[0]?.id, "men_shirts_01");
  });
});
