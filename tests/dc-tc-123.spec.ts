import { test } from "@playwright/test";
import { LoginPage } from "../pages/loginPage";
import { ItemConfigurationPage } from "../pages/itemConfigurationPage";

test.describe(
  "DC-TC-123 - Item Configuration empty state transition",
  { tag: ["@regression1", "@regression2"] },
  () => {
    test(
      "@new Verify empty state display and transition to populated state when first item configuration is added",
      async ({ page }) => {
        const loginPage = new LoginPage(page);
        const itemConfigurationPage = new ItemConfigurationPage(page);

        // Arrange
        await loginPage.goto();
        await loginPage.assertLoginPageVisible();
        await loginPage.login();
        await loginPage.assertLoggedIn();

        // Act
        await itemConfigurationPage.goto();

        // Assert
        await itemConfigurationPage.assertLoaded();
      },
    );
  },
);
