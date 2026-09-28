const base = process.argv[2] || "http://localhost:3000";
const b64 = (buf, m) => `data:${m};base64,${Buffer.from(buf).toString("base64")}`;

const email = `tryon_${Date.now()}@example.com`;
const reg = await fetch(`${base}/api/v1/auth/register`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password: "TestPass123!" }),
}).then((r) => r.json());
const t = reg.data?.access_token;
if (!t) {
  console.log(JSON.stringify(reg, null, 2));
  process.exit(1);
}

const person = await fetch("https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=512&h=768&fit=crop").then((r) =>
  r.arrayBuffer()
);
const style = await fetch(`${base}/media/outfits/pakistani-01.jpg`).then((r) => r.arrayBuffer());

const gen = await fetch(`${base}/api/v1/try-on/generate`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
  body: JSON.stringify({
    style_id: "pakistani_women_01",
    source_image_base64: b64(person, "image/jpeg"),
    style_reference_image_base64: b64(style, "image/jpeg"),
    width: 768,
    height: 1024,
  }),
}).then((r) => r.json());
console.log("generate:", JSON.stringify(gen, null, 2));
const id = gen.data?.job_id;
if (!id) process.exit(2);

for (let i = 0; i < 45; i++) {
  await new Promise((r) => setTimeout(r, 3000));
  const p = await fetch(`${base}/api/v1/try-on/jobs/${id}`, { headers: { Authorization: `Bearer ${t}` } }).then((r) =>
    r.json()
  );
  const d = p.data;
  console.log(`poll ${i + 1}:`, d?.status, d?.result_image_url?.slice(0, 100) ?? d?.error);
  if (d?.status === "completed" || d?.status === "failed") {
    console.log("final:", JSON.stringify(d, null, 2));
    process.exit(d?.status === "completed" ? 0 : 3);
  }
}
process.exit(4);
