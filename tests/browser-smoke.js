"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-breakpad"]
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(pathToFileURL(path.join(__dirname, "..", "index.html")).href, { waitUntil: "domcontentloaded" });

  await page.click("#openCompanionButton");
  assert.equal(await page.locator("#companionScreen").isVisible(), true);
  assert.equal(await page.locator("#companionComposer").count(), 0);
  assert.equal(await page.locator("#conversationWindow").count(), 0);
  assert.equal(await page.locator("#kridMicButton").isVisible(), true);
  assert.equal(await page.locator("#kridVoiceToggle").textContent().then((text) => text.includes("Voice-only")), true);
  await page.click("#loadCompanionDemo");
  await page.click("#startCompanionButton");
  await page.waitForTimeout(550);
  await page.evaluate(() => processCompanionMessage("The nucleus stores DNA and controls cell activities. Mitochondria release energy from food, the membrane controls entry and exit, ribosomes build proteins, and cytoplasm supports chemical reactions."));
  await page.waitForTimeout(600);
  assert.equal(await page.locator("#conversationTurns").textContent(), "1");
  assert.notEqual(await page.locator("#recallAverage").textContent(), "0%");

  await page.click('[data-companion-mode="interview"]');
  await page.selectOption("#interviewRole", "Frontend Developer");
  await page.selectOption("#interviewTrack", "Software");
  await page.click("#startCompanionButton");
  await page.waitForTimeout(550);
  await page.evaluate(() => processCompanionMessage("I use logs and metrics to isolate production failures and roll back safely. Authentication verifies identity while authorisation controls permissions. Reliable APIs need contracts, validation, idempotency, monitoring, tests and versioning. For technical debt I compare user impact, risk, cost and evidence."));
  await page.waitForTimeout(600);
  assert.notEqual(await page.locator("#recallAverage").textContent(), "0%");

  for (let round = 0; round < 2; round += 1) {
    await page.evaluate(() => processCompanionMessage("Next interview question"));
    await page.waitForTimeout(550);
    await page.evaluate(() => processCompanionMessage("I would use a clear process, gather evidence, explain my action, measure the result, and monitor the impact on users and the team."));
    await page.waitForTimeout(600);
  }

  assert.equal(await page.locator("#launchDarkKrid").isEnabled(), true);
  await page.click("#launchDarkKrid");
  await page.waitForTimeout(550);
  assert.equal(await page.locator("#kridScene").evaluate((element) => element.classList.contains("dark-mode")), true);
  assert.deepEqual(errors, []);

  await page.screenshot({ path: "/tmp/study-krid-companion.png", fullPage: true });
  await browser.close();
  console.log("Browser smoke passed: voice-only UI, spoken-answer routing, interview coaching, metrics, and Dark Krid all ran without page errors.");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
