import { test, expect, Page, Locator } from "@playwright/test";

class LoginPage {
  constructor(private readonly page: Page) {}

  get loginHeading(): Locator {
    return this.page.getByRole("heading", { name: "Login" });
  }

  get usernameTextbox(): Locator {
    return this.page.getByRole("textbox", { name: "Username" });
  }

  get passwordTextbox(): Locator {
    return this.page.getByRole("textbox", { name: "Password" });
  }

  get loginButton(): Locator {
    return this.page.getByRole("button", { name: "Login" });
  }

  async goto(): Promise<void> {
    await this.page.goto("/web/index.php/auth/login");
  }

  async assertLoginPageVisible(): Promise<void> {
    await expect(this.page).toHaveURL(
      "https://opensource-demo.orangehrmlive.com/web/index.php/auth/login",
    );
    await expect(this.loginHeading).toBeVisible();
    await expect(this.usernameTextbox).toBeVisible();
    await expect(this.passwordTextbox).toBeVisible();
    await expect(this.loginButton).toBeVisible();
    await expect(this.loginButton).toBeEnabled();
  }

  async login(params: { username: string; password: string }): Promise<void> {
    await this.usernameTextbox.fill(params.username);
    await this.passwordTextbox.fill(params.password);
    await this.loginButton.click();
  }

  async assertLoggedIn(): Promise<void> {
    await expect(this.page).not.toHaveURL(
      "https://opensource-demo.orangehrmlive.com/web/index.php/auth/login",
    );
    await expect(this.loginButton).toHaveCount(0);
  }
}

class DashboardPage {
  constructor(private readonly page: Page) {}

  get dashboardHeading(): Locator {
    return this.page.getByRole("heading", { name: "Dashboard" });
  }

  async assertDashboardVisible(): Promise<void> {
    await expect(this.page).toHaveURL(
      "https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index",
    );
    await expect(this.dashboardHeading).toBeVisible();
  }
}

function getTestCredentials(): { username: string; password: string } {
  const username = process.env.TEST_USERNAME ?? process.env.APP_USERNAME;
  const password = process.env.TEST_PASSWORD ?? process.env.APP_PASSWORD;

  if (!username || !password) {
    throw new Error(
      "Missing credentials. Set TEST_USERNAME/TEST_PASSWORD (preferred) or APP_USERNAME/APP_PASSWORD in environment variables.",
    );
  }

  return { username, password };
}

test.describe(
  "DC-TC-87 - Add Zone Integration remains enabled when product type is not changed during edit",
  { tag: "@regression1" },
  () => {
    test(
      "@new Verify 'Add Zone Integration' remains enabled when product type is not changed during edit",
      async ({ page }) => {
        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);
        const credentials = getTestCredentials();

        // Arrange
        await page.context().clearCookies();
        await loginPage.goto();
        await loginPage.assertLoginPageVisible();

        // Act
        await loginPage.login({
          username: credentials.username,
          password: credentials.password,
        });

        // Assert
        await loginPage.assertLoggedIn();
        await dashboardPage.assertDashboardVisible();

        test.skip(
          true,
          "Blocked: The configured BASE_URL points to OrangeHRM demo, which does not contain 'Dairy management', an edit drawer, 'Product Type' dropdown, or 'Add Zone Integration'. Provide the correct BASE_URL for the Dairy app to automate the remaining steps using observed locators.",
        );
      },
    );
  },
);
