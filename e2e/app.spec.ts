import { test, expect } from "@playwright/test";

// Dev server needs time for first-time compilation of each route
test.use({ navigationTimeout: 30000, actionTimeout: 30000 });

test.describe("Home page", () => {
  test("loads and shows title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/WC 2026|World Cup/i);
  });

  test("has sign in link", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /sign in/i }).first()).toBeVisible();
  });

  test("shows app branding", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("WC 2026 Predictor")).toBeVisible();
  });
});

test.describe("Auth pages", () => {
  test("login page loads with form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Sign in to make your predictions")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });

  test("signup page loads with form", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByText("Create your account")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
  });

  test("login page has link to signup", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("link", { name: /sign up/i })).toBeVisible();
  });

  test("signup page has link to login", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("link", { name: /sign in/i }).first()).toBeVisible();
  });
});

test.describe("Protected routes redirect to login", () => {
  test("matches page redirects to login", async ({ page }) => {
    await page.goto("/matches");
    await page.waitForURL(/\/login/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("leaderboard page redirects to login", async ({ page }) => {
    await page.goto("/leaderboard");
    await page.waitForURL(/\/login/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("predictions page redirects to login", async ({ page }) => {
    await page.goto("/predictions");
    await page.waitForURL(/\/login/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("resource pages redirect to login", async ({ page }) => {
    await page.goto("/resources/form-guide");
    await page.waitForURL(/\/login/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/login/);
  });
});
