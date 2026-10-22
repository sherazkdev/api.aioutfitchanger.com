import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { moderateText } from "../src/lib/server/moderation/moderateText";
import { moderateTryOnRequest } from "../src/lib/server/moderation/moderateTryOn";

describe("moderateText", () => {
  it("allows normal outfit prompts", () => {
    assert.equal(moderateText("Apply a blue shalwar kameez").ok, true);
  });

  it("blocks disallowed terms", () => {
    const r = moderateText("woman in lingerie photoshoot");
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.code, "MODERATION_BLOCKED");
  });
});

describe("moderateTryOnRequest", () => {
  const person = {
    dataUrl:
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA//2Q==",
    mime: "image/jpeg" as const,
    rawBase64Length: 400,
  };

  it("blocks moderated prompts before provider call", async () => {
    const fail = await moderateTryOnRequest({
      promptTexts: ["bikini beach"],
      person,
    });
    assert.ok(fail);
    assert.equal(fail?.code, "MODERATION_BLOCKED");
  });
});
