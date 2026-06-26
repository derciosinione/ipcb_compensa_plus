import { expect, test } from "@playwright/test";
import { expectDashboardShell, installApiMocks, seedAuthSession } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await installApiMocks(page);
});

test("prevents a teacher from accessing admin-only pages", async ({ page }) => {
  await seedAuthSession(page, {
    role: "teacher",
    roles: ["teacher"],
  });

  await page.goto("/users");

  await expect(page).toHaveURL(/\/dashboard$/);
  await expectDashboardShell(page);
});

test("allows an admin to access the user management area", async ({ page }) => {
  await seedAuthSession(page, {
    role: "admin",
    roles: ["admin"],
    name: "Admin User",
    email: "admin@compensa.test",
  });

  await page.goto("/users");

  await expect(page).toHaveURL(/\/users$/);
  await expect(page.getByRole("heading", { name: /users directory/i })).toBeVisible();
});
