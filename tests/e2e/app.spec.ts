import { test, expect, Page } from "@playwright/test";
async function save(page: Page, name: string) {
  await page.getByRole("button", { name: `Save ${name}`, exact: true }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
}
async function editDelete(
  page: Page,
  title: string,
  newTitle: string,
  label = "Title",
) {
  await page
    .getByRole("button", { name: `Edit ${title}`, exact: true })
    .click();
  await page.getByLabel(label, { exact: true }).fill(newTitle);
  await page.getByRole("button", { name: /^Save / }).click();
  await expect(
    page.getByRole("heading", { name: newTitle, exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: newTitle, exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: `Delete ${newTitle}`, exact: true })
    .click();
  await page.getByRole("button", { name: "Delete entry", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: newTitle, exact: true }),
  ).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: newTitle, exact: true }),
  ).toHaveCount(0);
}
test("dashboard, demo persistence and theme", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Good / })).toBeVisible();
  const before = await page.evaluate(() =>
    localStorage.getItem("lifeos.database.v1"),
  );
  expect(before).toBeTruthy();
  await page.reload();
  expect(
    await page.evaluate(() => localStorage.getItem("lifeos.database.v1")),
  ).toBe(before);
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await page.reload();
  await expect(page.locator(".application")).toHaveAttribute(
    "data-theme",
    "dark",
  );
  await page.screenshot({ path: "/tmp/lifeos-dark.png", fullPage: true });
  expect(errors).toEqual([]);
});
test("workout CRUD, nested sets and previous performance", async ({ page }) => {
  await page.goto("/fitness");
  await page.getByRole("button", { name: "Add workout", exact: true }).click();
  await page.getByLabel("Title", { exact: true }).fill("Test workout");
  await page
    .getByLabel("Select exercise")
    .selectOption({ label: "Leg Press (kg)" });
  await page.getByRole("button", { name: "Add exercise", exact: true }).click();
  await expect(page.getByText(/Previous \(/)).toContainText("60 × 8");
  await page.getByLabel("Set 1 weight").fill("70");
  await page.getByLabel("Set 1 reps").fill("8");
  await page.getByRole("button", { name: "Add set", exact: true }).click();
  await page.getByLabel("Set 2 reps").fill("6");
  await save(page, "workout");
  await expect(
    page.getByRole("heading", { name: "Test workout", exact: true }),
  ).toBeVisible();
  const card = page.locator(".entry-card").filter({
    has: page.getByRole("heading", { name: "Test workout", exact: true }),
  });
  await expect(card).toContainText("70 kg × 8 / 70 kg × 6");
  await card.getByRole("button", { name: "Mark completed" }).click();
  await expect(card).toContainText("Completed");
  await editDelete(page, "Test workout", "Edited workout");
});
test("meal CRUD, daily totals, water and targets persist", async ({ page }) => {
  await page.goto("/nutrition");
  await page.getByRole("button", { name: "Add meal", exact: true }).click();
  await page.getByLabel("Title", { exact: true }).fill("Test dinner");
  await page.getByRole("button", { name: "Add food", exact: true }).click();
  await page.getByLabel("Food name").fill("Salmon");
  await page.getByLabel("Calories (kcal)").fill("400");
  await page.getByLabel("protein (g)").fill("35");
  await page.getByLabel("carbs (g)").fill("10");
  await page.getByLabel("fat (g)").fill("25");
  await save(page, "meal");
  await expect(page.locator(".stat-grid")).toContainText("1470");
  await page.getByLabel("Water amount in milliliters").fill("300");
  await page.getByRole("button", { name: "300 ml", exact: true }).click();
  await expect(page.locator(".water-summary")).toContainText("1.30 L");
  await page.getByRole("button", { name: "Edit targets" }).click();
  await page.getByLabel("calories (kcal)").fill("2800");
  await page.getByRole("button", { name: "Save targets" }).click();
  await page.reload();
  await expect(page.locator(".stat-grid")).toContainText("2800");
  await expect(page.locator(".water-summary")).toContainText("1.30 L");
  await editDelete(page, "Test dinner", "Edited dinner");
  await expect(page.locator(".stat-grid")).toContainText("1070");
});
test("trade CRUD calculates direction and fees", async ({ page }) => {
  await page.goto("/trading");
  await page.getByRole("button", { name: "Add trade", exact: true }).click();
  await page.getByLabel("Asset / pair").fill("TEST/USD");
  await page.getByLabel("Direction").selectOption("Short");
  await page.getByLabel("Entry price", { exact: true }).fill("100");
  await page.getByLabel("Exit price (leave blank for open trade)").fill("90");
  await page.getByLabel("Position quantity").fill("2");
  await page.getByLabel("Fees", { exact: true }).fill("1");
  await page.getByLabel("Reason for entering").fill("Testing a setup");
  await save(page, "trade");
  await expect(
    page
      .locator(".entry-card")
      .filter({ has: page.getByRole("heading", { name: "TEST/USD" }) }),
  ).toContainText("$19.00");
  await editDelete(page, "TEST/USD", "EDIT/USD", "Asset / pair");
});
test("school CRUD, subject filter, status and calendar", async ({ page }) => {
  await page.goto("/school");
  await page.getByRole("button", { name: "Add school task" }).click();
  await page.getByLabel("Title", { exact: true }).fill("Test assignment");
  await page.getByLabel("New subject").fill("Biology");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page.getByLabel("Priority").selectOption("High");
  await save(page, "school task");
  await page.getByLabel("Filter by subject").selectOption({ label: "Biology" });
  await expect(page.locator(".entry-card")).toHaveCount(1);
  await page.getByLabel("Status for Test assignment").selectOption("Completed");
  await page.reload();
  await expect(page.getByLabel("Status for Test assignment")).toHaveValue(
    "Completed",
  );
  await page.goto("/calendar");
  await expect(page.locator(".calendar-grid")).toContainText("Test assignment");
  await page.goto("/school");
  await editDelete(page, "Test assignment", "Edited assignment");
});
test("speech journal CRUD", async ({ page }) => {
  await page.goto("/speech");
  await page.getByRole("button", { name: "Log practice" }).click();
  await page.getByLabel("Practice title").fill("Test practice");
  await page.getByLabel("Exercises completed").fill("Reading aloud");
  await page.getByLabel("Duration (minutes)").fill("20");
  await page.getByLabel("Difficulty (1–5)").fill("2");
  await page.getByLabel("Progress observations").fill("More relaxed");
  await save(page, "practice entry");
  await expect(
    page
      .locator(".entry-card")
      .filter({ has: page.getByRole("heading", { name: "Test practice" }) }),
  ).toContainText("20 minutes");
  await editDelete(page, "Test practice", "Edited practice", "Practice title");
});
test("notes and calendar event CRUD", async ({ page }) => {
  await page.goto("/notes");
  await page.getByRole("button", { name: "Add note", exact: true }).click();
  await page.getByLabel("Title", { exact: true }).fill("Test note");
  await page.getByLabel("Content").fill("A thought worth saving");
  await save(page, "note");
  await editDelete(page, "Test note", "Edited note");
  await page.goto("/calendar");
  await page.getByRole("button", { name: "Add event", exact: true }).click();
  await page.getByLabel("Title", { exact: true }).fill("Test event");
  await save(page, "personal event");
  await editDelete(page, "Test event", "Edited event");
});
test("backup import validates and replaces records", async ({ page }) => {
  await page.goto("/settings");
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export backup", exact: true })
    .click();
  expect((await download).suggestedFilename()).toMatch(/lifeos-backup/);
  const db = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("lifeos.database.v1")!),
  );
  db.settings.name = "Jordan";
  db.notes = [];
  await page.getByLabel("Import backup", { exact: true }).setInputFiles({
    name: "backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(db)),
  });
  await page.getByRole("button", { name: "Replace with backup" }).click();
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Jordan/ })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: /Jordan/ })).toBeVisible();
  await page.goto("/settings");
  await page.getByLabel("Import backup", { exact: true }).setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"schemaVersion":99}'),
  });
  await expect(page.getByRole("status")).toContainText("not supported");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
test("mobile layout, navigation, quick add and desktop screenshots", async ({
  page,
}) => {
  await page.goto("/");
  await page.setViewportSize({ width: 1440, height: 1080 });
  await page.screenshot({ path: "/tmp/lifeos-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
  await expect(page.locator(".sidebar")).toHaveCSS(
    "transform",
    "matrix(1, 0, 0, 1, -240, 0)",
  );
  await expect(
    page.getByRole("link", { name: "Fitness", exact: true }),
  ).toHaveCount(0);
  await page.screenshot({
    path: "/tmp/lifeos-mobile.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Meal", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("link", { name: "Calendar", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "See the bigger picture." }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
  await page.screenshot({
    path: "/tmp/lifeos-calendar-mobile.png",
    fullPage: true,
    animations: "disabled",
  });
});
test("corrupt storage is preserved and recoverable", async ({ page }) => {
  await page.goto("/");
  const db = await page.evaluate(() =>
    localStorage.getItem("lifeos.database.v1")!,
  );
  await page.evaluate(() =>
    localStorage.setItem("lifeos.database.v1", '{"broken":true}'),
  );
  await page.reload();
  await expect(page.getByRole("alert")).toContainText("preserved");
  expect(
    await page.evaluate(() => localStorage.getItem("lifeos.database.v1")),
  ).toBe('{"broken":true}');
  await page.goto("/settings");
  await page.getByLabel("Import backup", { exact: true }).setInputFiles({
    name: "restore.json",
    mimeType: "application/json",
    buffer: Buffer.from(db),
  });
  await page.getByRole("button", { name: "Replace with backup" }).click();
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("repeated target edits update the same effective date", async ({
  page,
}) => {
  await page.goto("/nutrition");
  for (const value of ["2800", "2900"]) {
    await page.getByRole("button", { name: "Edit targets" }).click();
    await page.getByLabel("calories (kcal)").fill(value);
    await page.getByRole("button", { name: "Save targets" }).click();
    await expect(page.locator(".stat-grid")).toContainText(value);
  }
  await page.reload();
  await expect(page.locator(".stat-grid")).toContainText("2900");
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("lifeos.database.v1")!).targets.length,
    ),
  ).toBe(2);
});
test("storage failure keeps the unsaved form and original data", async ({
  page,
}) => {
  await page.goto("/notes");
  const original = await page.evaluate(() =>
    localStorage.getItem("lifeos.database.v1"),
  );
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    };
  });
  await page.getByRole("button", { name: "Add note", exact: true }).click();
  await page.getByLabel("Title", { exact: true }).fill("Unsaved note");
  await page.getByRole("button", { name: "Save note", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator(".storage-error")).toContainText("Could not save");
  expect(
    await page.evaluate(() => localStorage.getItem("lifeos.database.v1")),
  ).toBe(original);
});
test("every module fits small mobile screens", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 320, height: 700 });
  for (const path of [
    "/",
    "/fitness",
    "/nutrition",
    "/school",
    "/trading",
    "/speech",
    "/notes",
    "/calendar",
    "/settings",
  ]) {
    await page.goto(path);
    await expect(page.locator("main h1")).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
      path,
    ).toBe(320);
  }
  expect(errors).toEqual([]);
});
test("timestamps preserve local day and time in a different timezone", async ({
  browser,
}) => {
  const context = await browser.newContext({
    timezoneId: "America/Los_Angeles",
  });
  const page = await context.newPage();
  await page.goto("/trading");
  await page.getByRole("button", { name: "Add trade", exact: true }).click();
  await page.getByLabel("Asset / pair").fill("LATE/USD");
  await page.getByLabel("Date", { exact: true }).fill("2026-10-01T23:30");
  await page.getByLabel("Entry price", { exact: true }).fill("100");
  await save(page, "trade");
  const date = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("lifeos.database.v1")!).trades.find(
        (t: any) => t.title === "LATE/USD",
      ).date,
  );
  expect(date).toBe("2026-10-02T06:30:00.000Z");
  await page.getByRole("button", { name: "Edit LATE/USD" }).click();
  await expect(page.getByLabel("Date", { exact: true })).toHaveValue(
    "2026-10-01T23:30",
  );
  await context.close();
});
