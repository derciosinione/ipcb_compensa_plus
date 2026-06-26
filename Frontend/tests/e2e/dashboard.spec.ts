import { expect, test } from "@playwright/test";
import { expectDashboardShell, installApiMocks, seedAuthSession } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await installApiMocks(page);
});

test("loads the authenticated dashboard with API-backed metrics and notifications", async ({ page }) => {
  await seedAuthSession(page, {
    role: "teacher",
    roles: ["teacher", "coordinator"],
  });

  await page.goto("/dashboard");

  await expectDashboardShell(page);
  await expect(page.getByText("3").first()).toBeVisible();
  await expect(page.getByText("92%")).toBeVisible();
  await expect(page.getByText("Software Engineering")).toBeVisible();
});

test("lets a multi-role user switch active role and exposes coordinator navigation", async ({ page }) => {
  await seedAuthSession(page, {
    role: "teacher",
    roles: ["teacher", "coordinator"],
  });

  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Te" }).click();
  await page.getByRole("button", { name: /coordinator/i }).click();

  await expect(page.getByText("Coordinator").first()).toBeVisible();
  await expect(page.getByRole("link", { name: /import timetables/i })).toBeVisible();

  const activeRole = await page.evaluate(() => window.localStorage.getItem("compensa.auth.activeRole"));
  expect(activeRole).toBe("coordinator");
});
