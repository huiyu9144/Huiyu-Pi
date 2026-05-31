import { chromium } from "playwright";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function screenshot() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  const htmlPath = join(__dirname, "context-comparison.html");
  await page.goto(`file:///${htmlPath.replace(/\\/g, "/")}`);

  await page.waitForTimeout(2000);

  const outputPath = join(__dirname, "context-comparison-hd.jpg");
  await page.screenshot({
    path: outputPath,
    type: "jpeg",
    quality: 95,
  });

  await browser.close();

  console.log(`Screenshot saved to: ${outputPath}`);
}

screenshot().catch(console.error);
