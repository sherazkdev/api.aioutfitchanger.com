/**
 * Build docs/AI-Wardrobe-API-Complete.pdf from HTML (requires Chromium download on first run).
 *   npm run docs:generate-pdf
 */
import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const htmlPath = path.join(root, "docs", "AI-Wardrobe-API-Complete.html");
const pdfPath = path.join(root, "docs", "AI-Wardrobe-API-Complete.pdf");

if (!existsSync(htmlPath)) {
  console.error("Missing", htmlPath);
  process.exit(1);
}

const puppeteer = await import("puppeteer");
const browser = await puppeteer.default.launch({
  headless: true,
  timeout: 120_000,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const page = await browser.newPage();
const fileUrl = "file:///" + htmlPath.replace(/\\/g, "/");
await page.goto(fileUrl, { waitUntil: "networkidle0", timeout: 120_000 });
await page.pdf({
  path: pdfPath,
  format: "A4",
  printBackground: true,
  margin: { top: "14mm", right: "12mm", bottom: "14mm", left: "12mm" },
});
await browser.close();
console.log("Wrote", pdfPath);
