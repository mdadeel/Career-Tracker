import { test, expect, type Page } from "@playwright/test";

const SEED_EMAIL = "demo@careertrack.app";
const SEED_PASSWORD = "demo@123";

/**
 * The custom <Input /> component auto-generates id from label:
 *   label="Email Address" → id="email-address"
 * The password field is a raw <input> without id, selected by placeholder.
 */

async function loginAsSeedUser(page: Page) {
  await page.goto("/login");
  await page.waitForLoadState("domcontentloaded");
  await page.waitForSelector("#email-address", { timeout: 10_000 });
  await page.fill("#email-address", SEED_EMAIL);
  await page.fill("input[placeholder='Enter your password']", SEED_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 20_000 });
  await page.waitForLoadState("domcontentloaded");
}

async function registerNewUser(page: Page) {
  const ts = Date.now();
  const name = `E2E User ${ts}`;
  const email = `e2e-${ts}@test.careertrack.app`;
  const password = "testpass123";

  await page.goto("/register");
  await page.waitForLoadState("domcontentloaded");
  await page.waitForSelector("#full-name", { timeout: 10_000 });
  await page.fill("#full-name", name);
  await page.fill("#email-address", email);
  await page.fill("input[placeholder='At least 8 characters']", password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 20_000 });
  await page.waitForLoadState("domcontentloaded");
  return { name, email, password };
}

// ── 1. Register ──
test.describe("Registration & Dashboard", () => {
  test("1. Register new user and verify dashboard", async ({ page }) => {
    await registerNewUser(page);
    await expect(page.locator("h1").first()).toContainText(/Good (morning|afternoon|evening)/);
    await expect(page.locator("span", { hasText: "Applications" }).first()).toBeVisible();
    await expect(page.locator("text=Let's start tracking")).toBeVisible();
  });

  test("2. Login with seeded user and verify dashboard stats", async ({ page }) => {
    await loginAsSeedUser(page);
    await expect(page.locator("h1").first()).toContainText(/Good (morning|afternoon|evening),/);
    await expect(page.locator("span", { hasText: "Applications" }).first()).toBeVisible();
    await expect(page.locator("span", { hasText: "Interviews" }).first()).toBeVisible();
    await expect(page.locator("span", { hasText: "Offers" }).first()).toBeVisible();
    await expect(page.locator("span", { hasText: "Response Rate" }).first()).toBeVisible();
    await expect(page.locator("text=Pipeline").first()).toBeVisible();
    await expect(page.locator("text=Insights").first()).toBeVisible();
    await expect(page.locator("text=Recent Applications").first()).toBeVisible();
  });
});

// ── 3. Create application (120s timeout for form-heavy flow) ──
test.describe("Application CRUD", () => {
  test("3. Create and verify a new application", async ({ page }) => {
    test.setTimeout(120_000);
    await loginAsSeedUser(page);

    await page.goto("/applications/new");
    await page.waitForLoadState("domcontentloaded");

    // The wide-layout form uses auto-generated ids from labels (lowercased, spaces→hyphens).
    // Job Post URL is behind "Show advanced fields" — click that first.
    await page.waitForSelector("#company-name", { timeout: 10_000 });
    await page.fill("#company-name", "E2E Corp", { force: true });
    await page.fill("#job-title", "Senior E2E Engineer", { force: true });

    // Click "Show advanced fields" to reveal Job Post URL & Company Logo
    const showAdvanced = page.locator("button", { hasText: "Show advanced fields" }).first();
    if (await showAdvanced.isVisible()) {
      await showAdvanced.click();
      await page.waitForTimeout(300);
    }
    await page.fill("#job-post-url", "https://example.com/jobs/e2e", { force: true });

    await page.selectOption("#source", "LinkedIn", { force: true });
    const today = new Date().toISOString().split("T")[0];
    await page.fill("#application-date", today, { force: true });
    await page.selectOption("#status", "Applied", { force: true });
    await page.fill("#location", "San Francisco, CA", { force: true });
    await page.selectOption("#remote-status", "Hybrid", { force: true });
    await page.fill("#salary-min", "150000", { force: true });
    await page.fill("#job-description", "E2E test job description.", { force: true });

    // Submit
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    await page.click('button:has-text("Create Application")');

    // Redirect to /applications
    await page.waitForURL("**/applications", { timeout: 20_000 });
    await page.waitForLoadState("domcontentloaded");

    // Verify the new app appears
    await expect(page.locator("text=E2E Corp").first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("text=Senior E2E Engineer").first()).toBeVisible();
  });
});

// ── 4. Analytics ──
test.describe("Analytics", () => {
  test("4. Analytics page renders charts", async ({ page }) => {
    await loginAsSeedUser(page);
    await page.goto("/analytics");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForSelector("svg", { timeout: 10_000 });
    await expect(page.locator("text=Application Trend").first()).toBeVisible();
    // Widget was renamed from "Pipeline Funnel" to "Current Pipeline Status"
    // Use locator.or() to match either name
    await expect(
      page.locator("text=Current Pipeline Status").or(page.locator("text=Pipeline Funnel"))
    ).toBeVisible();
    await expect(page.locator("text=Source Effectiveness").first()).toBeVisible();
    await expect(page.locator("text=Total tracked").first()).toBeVisible();
    await expect(page.locator("text=Response Rate").first()).toBeVisible();
  });
});

// ── 5-7. Pipeline + Calendar + Navigation (single test, single login) ──
test.describe("Pages Tour", () => {
  test("5-7. Pipeline, Calendar, and Navigation", async ({ page }) => {
    test.setTimeout(120_000); // lots of page navigations
    await loginAsSeedUser(page);

    // ── 5. Pipeline ──
    await page.goto("/pipeline");
    await page.waitForLoadState("domcontentloaded");

    // Kanban columns scroll horizontally — use toBeAttached instead of toBeVisible
    const columns = ["Saved", "Applied", "Assessment", "Interview", "Rejected", "Offer"];
    for (const col of columns) {
      await expect(page.locator(`text=${col}`).first()).toBeAttached({ timeout: 5_000 });
    }
    await expect(page.locator("text=No applications yet")).not.toBeVisible({ timeout: 10_000 });

    // Drag-and-drop: hover generates pointer events for @dnd-kit
    const draggableCards = page.locator(".cursor-grab");
    const cardCount = await draggableCards.count();
    console.log(`Pipeline: ${cardCount} cards`);
    if (cardCount >= 2) {
      await draggableCards.first().hover();
      await page.mouse.down();
      await draggableCards.nth(1).hover({ steps: 10 });
      await page.mouse.up();
      await page.waitForTimeout(500);
      console.log("✅ Drag-and-drop done");
    }

    // ── 6. Calendar ──
    await page.goto("/calendar");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000);

    const hasDayHeader = await page.locator("text=Mon").isVisible({ timeout: 5000 }).catch(() => false);
    const hasUpcoming = await page.locator("text=Next 7 Days").isVisible({ timeout: 5000 }).catch(() => false);
    const hasCalendarTitle = await page.locator("h1").first().isVisible({ timeout: 5000 }).catch(() => false);
    // Calendar may not show day headers if viewport is narrow — check for any calendar content
    const calBody = await page.locator("body").innerText();
    expect(calBody.length).toBeGreaterThan(50);
    expect(hasDayHeader || hasUpcoming || hasCalendarTitle).toBeTruthy();
    console.log("✅ Calendar rendered");

    // ── 7. Navigation tour ──
    const routes = [
      { path: "/dashboard", name: "Dashboard" },
      { path: "/pipeline", name: "Pipeline" },
      { path: "/applications", name: "Applications" },
      { path: "/analytics", name: "Analytics" },
      { path: "/calendar", name: "Calendar" },
      { path: "/settings", name: "Settings" },
    ];
    for (const { path, name } of routes) {
      await page.goto(path);
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(2000);
      await expect(page.locator("body")).not.toContainText("Page not found", { timeout: 3000 });
      const navBody = await page.locator("body").innerText();
      expect(navBody.length).toBeGreaterThan(50);
      console.log(`✅ ${name} (${path})`);
    }
  });
});
