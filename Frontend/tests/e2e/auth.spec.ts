import { expect, test } from "@playwright/test";
import { expectDashboardShell, installApiMocks } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await installApiMocks(page);
});

test("redirects protected routes to login when there is no valid session", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
});

test("requests a magic link and shows the check inbox state", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByLabel(/password/i)).toHaveCount(0);
  await page.getByLabel(/email/i).fill("teacher@compensa.test");
  await page.getByRole("button", { name: /send magic link/i }).click();

  await expect(page.getByText(/check your inbox/i)).toBeVisible();
  await expect(page.getByText(/teacher@compensa.test/i)).toBeVisible();
});

test("uses the dev magic link bypass, persists the session, and opens the dashboard", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel(/email/i).fill("teacher@compensa.test");
  await page.getByRole("button", { name: /send magic link/i }).click();
  await expect(page.getByText(/\[Dev Mode\] Auto-Login Link/i)).toBeVisible();
  await page.getByRole("link", { name: /e2e-token/i }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expectDashboardShell(page);

  const session = await page.evaluate(() => window.localStorage.getItem("compensa.auth.session"));
  expect(session).toContain("teacher@compensa.test");
});
