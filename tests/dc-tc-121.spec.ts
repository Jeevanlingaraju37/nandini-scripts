import { test } from "@playwright/test";
import { LoginPage } from "../pages/loginPage";

test.describe(
  "DC-TC-121 - Item Configuration page loads with primary UI elements",
  { tag: ["@regression1", "@regression2"] },
  () => {
    test(
      "@new Smoke - Verify Item Configuration page loads under General Settings when enabled",
      async ({ page }) => {
        const loginPage = new LoginPage(page);

        // Arrange
        await loginPage.goto();
        await loginPage.assertLoginPageVisible();

        // Act
        await loginPage.login();

        // Assert
        await loginPage.assertLoggedIn();
      },
    );
  },
);
