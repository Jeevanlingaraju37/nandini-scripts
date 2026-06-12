import { test } from "@playwright/test";
import { DairyProfilePage } from "../pages/dairyProfilePage";
import { DairySettingsPage } from "../pages/dairySettingsPage";
import { LoginPage } from "../pages/loginPage";
import { MyHomePage } from "../pages/myHomePage";

test.describe("DC-TC-84 - Dairy edit product type change", () => {
  test("@new Add Zone Integration is disabled when product type is changed during edit", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const myHomePage = new MyHomePage(page);
    const dairyProfilePage = new DairyProfilePage(page);
    const dairySettingsPage = new DairySettingsPage(page);

    // Arrange
    await loginPage.goto();
    await loginPage.assertLoginPageVisible();
    await loginPage.login();
    await loginPage.assertLoggedIn();

    // Act
    await myHomePage.goto();
    await myHomePage.assertVisible();
    await myHomePage.openJeevanDairy();

    await dairyProfilePage.assertVisible();
    await dairyProfilePage.clickConfigureDairy();

    // Assert
    await dairySettingsPage.assertDairyManagementSectionVisible();
    await dairySettingsPage.assertAddZoneIntegrationEnabled();
    await dairySettingsPage.changeProductType();
    await dairySettingsPage.assertAddZoneIntegrationDisabled();
  });
});
