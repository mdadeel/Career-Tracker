# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> Pages Tour >> 5-7. Pipeline, Calendar, and Navigation
- Location: e2e/app.spec.ts:112:3

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - generic [ref=e5]:
      - link "CareerTrack" [ref=e6] [cursor=pointer]:
        - /url: /dashboard
        - generic [ref=e7]:
          - img [ref=e8]
          - generic [ref=e13]: CareerTrack
      - button "Collapse sidebar" [ref=e14] [cursor=pointer]:
        - img [ref=e15]
    - generic [ref=e18]:
      - link "Dashboard" [ref=e19] [cursor=pointer]:
        - /url: /dashboard
        - img [ref=e21]
        - generic [ref=e23]: Dashboard
      - link "Pipeline" [ref=e24] [cursor=pointer]:
        - /url: /pipeline
        - img [ref=e26]
        - generic [ref=e28]: Pipeline
      - link "Applications" [ref=e29] [cursor=pointer]:
        - /url: /applications
        - img [ref=e31]
        - generic [ref=e33]: Applications
      - link "Analytics" [ref=e34] [cursor=pointer]:
        - /url: /analytics
        - img [ref=e36]
        - generic [ref=e38]: Analytics
      - link "Calendar" [ref=e39] [cursor=pointer]:
        - /url: /calendar
        - img [ref=e41]
        - generic [ref=e43]: Calendar
    - button "A Alex Morgan" [ref=e45] [cursor=pointer]:
      - generic [ref=e46]: A
      - paragraph [ref=e48]: Alex Morgan
      - img [ref=e49]
  - main [ref=e52]:
    - generic [ref=e54]:
      - generic [ref=e56]:
        - heading "Calendar" [level=1] [ref=e57]
        - paragraph [ref=e58]: Your interview schedule and deadlines
      - generic [ref=e59]:
        - generic [ref=e60]:
          - generic [ref=e61]:
            - button [ref=e62] [cursor=pointer]:
              - img [ref=e63]
            - heading "July 2026" [level=2] [ref=e65]
            - button [ref=e66] [cursor=pointer]:
              - img [ref=e67]
          - generic [ref=e69]:
            - generic [ref=e70]: Sun
            - generic [ref=e71]: Mon
            - generic [ref=e72]: Tue
            - generic [ref=e73]: Wed
            - generic [ref=e74]: Thu
            - generic [ref=e75]: Fri
            - generic [ref=e76]: Sat
          - generic [ref=e77]:
            - generic [ref=e83]: "1"
            - generic [ref=e86]: "2"
            - generic [ref=e89]: "3"
            - generic [ref=e92]: "4"
            - generic [ref=e95]: "5"
            - generic [ref=e98]: "6"
            - generic [ref=e101]: "7"
            - generic [ref=e104]: "8"
            - generic [ref=e107]: "9"
            - generic [ref=e110]: "10"
            - generic [ref=e111]:
              - generic [ref=e113]: "11"
              - button "Datadog" [ref=e115] [cursor=pointer]
            - generic [ref=e118]: "12"
            - generic [ref=e119]:
              - generic [ref=e121]: "13"
              - button "GitHub" [ref=e123] [cursor=pointer]
            - generic [ref=e126]: "14"
            - generic [ref=e127]:
              - generic [ref=e129]: "15"
              - button "Railway" [ref=e131] [cursor=pointer]
            - generic [ref=e132]:
              - generic [ref=e134]: "16"
              - button "Netlify" [ref=e136] [cursor=pointer]
            - generic [ref=e137]:
              - generic [ref=e139]: "17"
              - button "Cloudflare" [ref=e141] [cursor=pointer]
            - generic [ref=e142]:
              - generic [ref=e144]: "18"
              - button "Backstage (Spotify)" [ref=e146] [cursor=pointer]
            - generic [ref=e147]:
              - generic [ref=e149]: "19"
              - generic [ref=e150]:
                - button "WorkOS" [ref=e151] [cursor=pointer]
                - button "Fly.io" [ref=e152] [cursor=pointer]
                - paragraph [ref=e153]: +1 more
            - generic [ref=e154]:
              - generic [ref=e156]: "20"
              - button "E2E Corp" [ref=e158] [cursor=pointer]
            - generic [ref=e161]: "21"
            - generic [ref=e164]: "22"
            - generic [ref=e167]: "23"
            - generic [ref=e170]: "24"
            - generic [ref=e173]: "25"
            - generic [ref=e176]: "26"
            - generic [ref=e179]: "27"
            - generic [ref=e182]: "28"
            - generic [ref=e185]: "29"
            - generic [ref=e188]: "30"
            - generic [ref=e191]: "31"
        - generic [ref=e192]:
          - generic [ref=e193]:
            - heading "Quick Actions" [level=3] [ref=e194]
            - generic [ref=e195]:
              - button "New Application" [ref=e196] [cursor=pointer]:
                - img [ref=e197]
                - text: New Application
              - button "View Applications" [ref=e199] [cursor=pointer]:
                - img [ref=e200]
                - text: View Applications
          - generic [ref=e202]:
            - heading "Next 7 Days" [level=3] [ref=e203]
            - generic [ref=e204]:
              - paragraph [ref=e205]: No upcoming events
              - paragraph [ref=e206]: Schedule an interview to see it here
```

# Test source

```ts
  47  |     await expect(page.locator("span", { hasText: "Applications" }).first()).toBeVisible();
  48  |     await expect(page.locator("span", { hasText: "Interviews" }).first()).toBeVisible();
  49  |     await expect(page.locator("span", { hasText: "Offers" }).first()).toBeVisible();
  50  |     await expect(page.locator("span", { hasText: "Response Rate" }).first()).toBeVisible();
  51  |     await expect(page.locator("text=Pipeline").first()).toBeVisible();
  52  |     await expect(page.locator("text=Insights").first()).toBeVisible();
  53  |     await expect(page.locator("text=Recent Applications").first()).toBeVisible();
  54  |   });
  55  | });
  56  | 
  57  | // ── 3. Create application (120s timeout for form-heavy flow) ──
  58  | test.describe("Application CRUD", () => {
  59  |   test("3. Create and verify a new application", async ({ page }) => {
  60  |     test.setTimeout(120_000);
  61  |     await loginAsSeedUser(page);
  62  | 
  63  |     await page.goto("/applications/new");
  64  |     await page.waitForLoadState("domcontentloaded");
  65  | 
  66  |     // Fill required fields only to minimize time
  67  |     await page.waitForSelector("#company-name", { timeout: 10_000 });
  68  |     await page.fill("#company-name", "E2E Corp", { force: true });
  69  |     await page.fill("#job-title", "Senior E2E Engineer", { force: true });
  70  |     await page.fill("#job-post-url", "https://example.com/jobs/e2e", { force: true });
  71  |     await page.selectOption("#source", "LinkedIn", { force: true });
  72  |     const today = new Date().toISOString().split("T")[0];
  73  |     await page.fill("#application-date", today, { force: true });
  74  |     await page.selectOption("#status", "Applied", { force: true });
  75  |     await page.fill("#location", "San Francisco, CA", { force: true });
  76  |     await page.selectOption("#remote-status", "Hybrid", { force: true });
  77  |     await page.fill("#salary-min", "150000", { force: true });
  78  |     await page.fill("#job-description", "E2E test job description.", { force: true });
  79  | 
  80  |     // Submit
  81  |     await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  82  |     await page.waitForTimeout(300);
  83  |     await page.click('button:has-text("Create Application")');
  84  | 
  85  |     // Redirect to /applications
  86  |     await page.waitForURL("**/applications", { timeout: 20_000 });
  87  |     await page.waitForLoadState("domcontentloaded");
  88  | 
  89  |     // Verify the new app appears
  90  |     await expect(page.locator("text=E2E Corp").first()).toBeVisible({ timeout: 10_000 });
  91  |     await expect(page.locator("text=Senior E2E Engineer").first()).toBeVisible();
  92  |   });
  93  | });
  94  | 
  95  | // ── 4. Analytics ──
  96  | test.describe("Analytics", () => {
  97  |   test("4. Analytics page renders charts", async ({ page }) => {
  98  |     await loginAsSeedUser(page);
  99  |     await page.goto("/analytics");
  100 |     await page.waitForLoadState("domcontentloaded");
  101 |     await page.waitForSelector("svg", { timeout: 10_000 });
  102 |     await expect(page.locator("text=Application Trend").first()).toBeVisible();
  103 |     await expect(page.locator("text=Pipeline Funnel").first()).toBeVisible();
  104 |     await expect(page.locator("text=Source Effectiveness").first()).toBeVisible();
  105 |     await expect(page.locator("text=Total tracked").first()).toBeVisible();
  106 |     await expect(page.locator("text=Response Rate").first()).toBeVisible();
  107 |   });
  108 | });
  109 | 
  110 | // ── 5-7. Pipeline + Calendar + Navigation (single test, single login) ──
  111 | test.describe("Pages Tour", () => {
  112 |   test("5-7. Pipeline, Calendar, and Navigation", async ({ page }) => {
  113 |     test.setTimeout(120_000); // lots of page navigations
  114 |     await loginAsSeedUser(page);
  115 | 
  116 |     // ── 5. Pipeline ──
  117 |     await page.goto("/pipeline");
  118 |     await page.waitForLoadState("domcontentloaded");
  119 | 
  120 |     const columns = ["Saved", "Applied", "Assessment", "Interview", "Rejected", "Offer"];
  121 |     for (const col of columns) {
  122 |       await expect(page.locator(`text=${col}`).first()).toBeVisible();
  123 |     }
  124 |     await expect(page.locator("text=No applications yet")).not.toBeVisible({ timeout: 10_000 });
  125 | 
  126 |     // Drag-and-drop: hover generates pointer events for @dnd-kit
  127 |     const draggableCards = page.locator(".cursor-grab");
  128 |     const cardCount = await draggableCards.count();
  129 |     console.log(`Pipeline: ${cardCount} cards`);
  130 |     if (cardCount >= 2) {
  131 |       await draggableCards.first().hover();
  132 |       await page.mouse.down();
  133 |       await draggableCards.nth(1).hover({ steps: 10 });
  134 |       await page.mouse.up();
  135 |       await page.waitForTimeout(500);
  136 |       console.log("✅ Drag-and-drop done");
  137 |     }
  138 | 
  139 |     // ── 6. Calendar ──
  140 |     await page.goto("/calendar");
  141 |     await page.waitForLoadState("domcontentloaded");
  142 |     await page.waitForTimeout(3000);
  143 | 
  144 |     const hasDayHeader = await page.locator("text=Mon").isVisible({ timeout: 5000 }).catch(() => false);
  145 |     const hasUpcoming = await page.locator("text=Next 7 Days").isVisible({ timeout: 5000 }).catch(() => false);
  146 |     const hasQuickActions = await page.locator("text=Quick Actions").isVisible({ timeout: 5000 }).catch(() => false);
> 147 |     expect(hasDayHeader || hasUpcoming || hasQuickActions).toBeTruthy();
      |                                                            ^ Error: expect(received).toBeTruthy()
  148 |     const calBody = await page.locator("body").innerText();
  149 |     expect(calBody.length).toBeGreaterThan(100);
  150 |     console.log("✅ Calendar rendered");
  151 | 
  152 |     // ── 7. Navigation tour ──
  153 |     const routes = [
  154 |       { path: "/dashboard", name: "Dashboard" },
  155 |       { path: "/pipeline", name: "Pipeline" },
  156 |       { path: "/applications", name: "Applications" },
  157 |       { path: "/analytics", name: "Analytics" },
  158 |       { path: "/calendar", name: "Calendar" },
  159 |       { path: "/settings", name: "Settings" },
  160 |     ];
  161 |     for (const { path, name } of routes) {
  162 |       await page.goto(path);
  163 |       await page.waitForLoadState("domcontentloaded");
  164 |       await page.waitForTimeout(2000);
  165 |       await expect(page.locator("body")).not.toContainText("Page not found", { timeout: 3000 });
  166 |       const navBody = await page.locator("body").innerText();
  167 |       expect(navBody.length).toBeGreaterThan(50);
  168 |       console.log(`✅ ${name} (${path})`);
  169 |     }
  170 |   });
  171 | });
  172 | 
```