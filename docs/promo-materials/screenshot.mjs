import { chromium } from "playwright";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function screenshot() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setViewportSize({ width: 800, height: 800 });

  const htmlPath = join(__dirname, "feature-card.html");
  await page.goto(`file:///${htmlPath.replace(/\\/g, "/")}`);

  await page.waitForTimeout(2000);

  const outputPath = join(__dirname, "feature-card.jpg");
  await page.screenshot({
    path: outputPath,
    type: "jpeg",
    quality: 95,
  });

  await browser.close();

  console.log(`Screenshot saved to: ${outputPath}`);
}

screenshot().catch(console.error);
