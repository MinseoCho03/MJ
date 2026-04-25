const path = require("node:path");
const { pathToFileURL } = require("node:url");
const fs = require("node:fs");
const { chromium } = require("playwright");

async function main() {
  const root = path.resolve(__dirname, "..");
  const url = pathToFileURL(path.join(root, "index.html")).href;
  const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  const launchOptions = fs.existsSync(chromePath)
    ? { headless: true, executablePath: chromePath }
    : { headless: true };
  const browser = await chromium.launch(launchOptions);
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto(url, { waitUntil: "load" });
  await page.waitForSelector("#overview.active");
  const overviewTitle = await page.locator("#overview-title").textContent();

  await page.getByRole("button", { name: "Discover Projects" }).click();
  await page.locator('#discovery select[data-filter="country"]').selectOption("Ghana");
  const ghanaCards = await page.locator("#discovery .project-card").count();

  await page.locator("#discovery").getByRole("button", { name: "View Evaluation Packet" }).first().click();
  const detailTitle = await page.locator("#detail-title").textContent();
  const projectSnapshot = await page.locator("#detail").getByRole("heading", { name: "Project Snapshot" }).textContent();
  const fundingContext = await page.locator("#detail").getByRole("heading", { name: "Funding Context" }).textContent();
  const similarNote = await page.locator("#detail").getByText("Similar funded projects indicate funder relevance").textContent();
  const gapLabel = await page.locator("#detail .badge").filter({ hasText: "Medium-High" }).first().textContent();

  await page.getByRole("button", { name: "Funding Signals" }).click();
  const totalFunding = await page.locator("#signals .kpi strong").first().textContent();

  await page.getByRole("button", { name: "Submit Project" }).click();
  await page.getByRole("button", { name: "Generate Opportunity Profile" }).click();
  const previewTitle = await page.locator("#builder-preview-title").textContent();
  const previewText = await page.locator("#builder-preview").getByText("Your project has been converted").textContent();

  await page.screenshot({ path: path.join(root, "opportunity-atlas-smoke.png"), fullPage: true });
  await browser.close();

  console.log(
    JSON.stringify(
      {
        overviewTitle,
        ghanaCards,
        detailTitle,
        projectSnapshot,
        fundingContext,
        similarNote,
        gapLabel,
        totalFunding,
        previewTitle,
        previewText,
        errors,
      },
      null,
      2,
    ),
  );

  if (errors.length || overviewTitle !== "Opportunity Atlas" || ghanaCards < 1 || !totalFunding) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
