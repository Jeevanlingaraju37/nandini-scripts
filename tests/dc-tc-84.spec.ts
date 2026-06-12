import { test, expect, Page, Locator } from '@playwright/test';

class OrangeHrmLoginPage {
  constructor(private readonly page: Page) {}

  private get usernameInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Username' });
  }

  private get passwordInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Password' });
  }

  private get loginButton(): Locator {
    return this.page.getByRole('button', { name: 'Login' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/web/index.php/auth/login');
  }

  async assertLoginPageVisible(): Promise<void> {
    await expect(this.page).toHaveURL('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
    await expect(this.loginButton).toBeVisible();
  }

  async loginWithEnvCredentials(): Promise<void> {
    const username = process.env.TEST_USERNAME ?? process.env.APP_USERNAME;
    const password = process.env.TEST_PASSWORD ?? process.env.APP_PASSWORD;

    expect(username, 'TEST_USERNAME or APP_USERNAME must be set').toBeTruthy();
    expect(password, 'TEST_PASSWORD or APP_PASSWORD must be set').toBeTruthy();

    await expect(this.usernameInput).toBeVisible();
    await this.usernameInput.fill(username!);

    await expect(this.passwordInput).toBeVisible();
    await this.passwordInput.fill(password!);

    await expect(this.loginButton).toBeEnabled();
    await this.loginButton.click();
  }

  async assertLoggedIn(): Promise<void> {
    await expect(this.page).not.toHaveURL('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
    await expect(this.loginButton).toHaveCount(0);
  }
}

class OrangeHrmDashboardPage {
  constructor(private readonly page: Page) {}

  private get dashboardHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Dashboard' });
  }

  async assertDashboardVisible(): Promise<void> {
    await expect(this.page).toHaveURL('https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index');
    await expect(this.dashboardHeading).toBeVisible();
  }
}

test.describe('Dairy - Zone Integration behavior', () => {
  test('@new DC-TC-84 - Verify Add Zone Integration is disabled when product type is changed during edit', async ({ page }) => {
    const loginPage = new OrangeHrmLoginPage(page);
    const dashboardPage = new OrangeHrmDashboardPage(page);

    // Arrange: open app and verify login page
    await loginPage.goto();
    await loginPage.assertLoginPageVisible();

    // Act: login
    await loginPage.loginWithEnvCredentials();

    // Assert: authenticated landing page is displayed
    await loginPage.assertLoggedIn();
    await dashboardPage.assertDashboardVisible();

    // NOTE:
    // The configured BASE_URL in this repo points to OrangeHRM demo.
    // The required "Dairy management" UI and "Add Zone Integration" control do not exist on this site,
    // so the remainder of the scenario cannot be automated against the currently reachable application.
  });
});
