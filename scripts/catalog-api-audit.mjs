/**
 * Validates public catalog + content APIs: image_url paths, prompt_command, counts.
 * Usage: node scripts/catalog-api-audit.mjs [baseUrl]
 */
const base = (process.argv[2] || "https://appworkspro.com").replace(/\/$/, "");

const CATEGORIES = [
  "beard_styles",
  "hair_styles",
  "hair_color",
  "hijab_styles",
  "virtual_try_on",
  "outfit_change",
  "occasions",
  "couple_duo",
  "presets",
  "wardrobe_browse",
];

async function getJson(path) {
  const res = await fetch(`${base}${path}`, { headers: { Accept: "application/json" } });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* ignore */
  }
  return { status: res.status, json, text: text.slice(0, 200) };
}

async function headImage(urlPath) {
  const url = urlPath.startsWith("http") ? urlPath : `${base}${urlPath}`;
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.status;
  } catch {
    return 0;
  }
}

async function main() {
  const issues = [];
  let totalItems = 0;
  let withPrompt = 0;
  let withImage = 0;
  let imageOk = 0;
  const samplePrompt = null;

  for (const cat of CATEGORIES) {
    const { status, json } = await getJson(`/api/v1/catalog/${cat}?gender=men`);
    if (status !== 200 || json?.error) {
      issues.push(`${cat}: HTTP ${status} or API error`);
      continue;
    }
    const items = json.data?.items ?? [];
    totalItems += items.length;
    for (const it of items) {
      if (it.image_url?.trim()) withImage++;
      if (it.prompt_command?.startsWith("COMMAND:")) withPrompt++;
      else if (it.prompt_command) issues.push(`${it.id}: prompt not optimized format`);
      else issues.push(`${it.id}: missing prompt_command`);

      const path = it.image_url?.replace(/\.webp$/i, ".png") ?? "";
      if (path.startsWith("/media/catalog/")) {
        const st = await headImage(path);
        if (st === 200) imageOk++;
        else issues.push(`${it.id}: image ${path} → HTTP ${st}`);
      } else if (it.image_url) {
        issues.push(`${it.id}: bad image_url ${it.image_url}`);
      }
    }
  }

  const feed = await getJson("/api/v1/home/feed?gender=women");
  const feedOk = feed.status === 200 && feed.json?.error == null;
  const sections = feed.json?.data?.sections?.length ?? 0;

  const meta = await getJson("/api/v1/app/metadata");
  const onboarding = await getJson("/api/v1/onboarding/pages");

  console.log("Base:", base);
  console.log("Catalog items (men filter, all categories summed):", totalItems);
  console.log("With image_url:", withImage);
  console.log("With COMMAND prompt:", withPrompt);
  console.log("Sample images HTTP 200:", imageOk);
  console.log("Home feed sections:", sections, feedOk ? "OK" : "FAIL");
  console.log("App metadata:", meta.status === 200 ? "OK" : meta.status);
  console.log("Onboarding pages:", onboarding.json?.data?.pages?.length ?? 0);

  if (issues.length) {
    console.log("\nIssues (first 25):");
    for (const line of issues.slice(0, 25)) console.log(" -", line);
    if (issues.length > 25) console.log(` ... +${issues.length - 25} more`);
    process.exit(1);
  }
  console.log("\nCatalog audit: PASS (no issues in sample checks)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
