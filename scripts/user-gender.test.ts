import assert from "node:assert/strict";
import { test } from "node:test";
import {
  applyUserGender,
  parseUserGender,
  styleGenderFromUserGender,
} from "../src/lib/server/auth/userGender";

test("parseUserGender accepts male/female case-insensitively", () => {
  assert.equal(parseUserGender("male"), "male");
  assert.equal(parseUserGender("Female"), "female");
  assert.equal(parseUserGender(" MALE "), "male");
  assert.equal(parseUserGender("men"), null);
  assert.equal(parseUserGender(""), null);
  assert.equal(parseUserGender(undefined), null);
});

test("styleGenderFromUserGender maps identity to catalog preference", () => {
  assert.equal(styleGenderFromUserGender("male"), "men");
  assert.equal(styleGenderFromUserGender("female"), "women");
});

test("applyUserGender sets catalog preference only the first time", () => {
  const user: { gender?: string | null; preferences?: { styleGenderPreference?: string } | null } = {};
  applyUserGender(user, "male");
  assert.equal(user.gender, "male");
  assert.equal(user.preferences?.styleGenderPreference, "men");

  applyUserGender(user, "female");
  assert.equal(user.gender, "female");
  assert.equal(user.preferences?.styleGenderPreference, "men");
});
