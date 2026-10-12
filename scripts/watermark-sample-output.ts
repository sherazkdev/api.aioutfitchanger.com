import sharp from "sharp";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { applyAiResultWatermark } from "../src/lib/server/watermark/applyWatermark";

async function main() {
const dir = path.join(process.cwd(), "artifacts", "watermark-sample");
await mkdir(dir, { recursive: true });
const base = await sharp({
  create: { width: 768, height: 1024, channels: 3, background: { r: 160, g: 175, b: 195 } },
})
  .jpeg()
  .toBuffer();
const out = await applyAiResultWatermark(base);
const file = path.join(dir, "sample-watermarked.jpg");
await writeFile(file, out);

const pollResponse = {
  data: {
    job_id: "674a1b2c3d4e5f6789012345",
    status: "completed",
    result_image_url: "/uploads/looks/674a1b2c3d4e5f6789012345/674a1b2c3d4e5f6789012345.jpg",
    result_image_absolute_url:
      "https://appworkspro.com/uploads/looks/674a1b2c3d4e5f6789012345/674a1b2c3d4e5f6789012345.jpg",
    error: null,
  },
  error: null,
};

const usersMeFree = {
  data: {
    id: "674a1b2c3d4e5f6789012345",
    email: "user@example.com",
    display_name: "Ali",
    subscription_plan: "free",
    email_verified: true,
  },
  error: null,
};

const usersMePremium = {
  data: { ...usersMeFree.data, subscription_plan: "premium" },
  error: null,
};

console.log(
  JSON.stringify(
    {
      test: "watermark sample OK",
      sample_image_path: file,
      output_bytes: out.length,
      api_examples: {
        "GET /api/v1/try-on/jobs/:id (completed, free user — image already watermarked on server)":
          pollResponse,
        "GET /api/v1/users/me (free)": usersMeFree,
        "GET /api/v1/users/me (premium)": usersMePremium,
      },
    },
    null,
    2
  )
);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
