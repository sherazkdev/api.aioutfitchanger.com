/** Terms that should not be machine-translated (brand / product names). */
const PROTECTED: Record<string, string> = {
  "AI Wardrobe": "⟦AIW⟧",
};

const RESTORE = Object.fromEntries(Object.entries(PROTECTED).map(([k, v]) => [v, k]));

export function applyGlossaryBefore(text: string): string {
  let out = text;
  for (const [term, token] of Object.entries(PROTECTED)) {
    out = out.split(term).join(token);
  }
  return out;
}

export function applyGlossaryAfter(text: string): string {
  let out = text;
  for (const [token, term] of Object.entries(RESTORE)) {
    out = out.split(token).join(term);
  }
  return out;
}
