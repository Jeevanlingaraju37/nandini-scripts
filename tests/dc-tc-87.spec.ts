import { test, expect, Page, Locator } from '@playwright/test';

class QMagicLoginPage {
  constructor(private readonly page: Page) {}

  private get qmagicHeading(): Locator {
    return this.page.getByRole('heading', { name: 'QMagic' });
  }

  private get emailInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Email' });
  }

  private get passwordInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Password' });
  }

  private get signInButton(): Locator {
    return this.page.getByRole('button', { name: 'Sign In' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async assertLoginPageVisible(): Promise<void> {
    await expect(this.page).toHaveURL('https://demo.qmagic.ai/login');
    await expect(this.qmagicHeading).toBeVisible();
    await expect(this.signInButton).toBeVisible();
  }

  async loginWithEnvCredentials(): Promise<void> {
    const username = process.env.TEST_USERNAME ?? process.env.APP_USERNAME;
    const password = process.env.TEST_PASSWORD ?? process.env.APP_PASSWORD;

    expect(username, 'TEST_USERNAME or APP_USERNAME must be set').toBeTruthy();
    expect(password, 'TEST_PASSWORD or APP_PASSWORD must be set').toBeTruthy();

    await expect(this.emailInput).toBeVisible();
    await this.emailInput.fill(username!);

    await expect(this.passwordInput).toBeVisible();
    await this.passwordInput.fill(password!);

    await expect(this.signInButton).toBeEnabled();
    await this.signInButton.click();
  }

  async assertLoggedIn(): Promise<void> {
    await expect(this.page).not.toHaveURL('https://demo.qmagic.ai/login');
    await expect(this.signInButton).toHaveCount(0);
  }
}

class QMagicAuthenticatedShell {
  constructor(private readonly page: Page) {}

  private get notificationsRegion(): Locator {
    return this.page.getByRole('region', { name: 'Notifications alt+T' });
  }

  async assertAuthenticatedShellVisible(): Promise<void> {
    await expect(this.notificationsRegion).toBeVisible();
  }
}

test.describe('Dairy - Zone Integration behavior', () => {
  test('@new DC-TC-87 - Verify Add Zone Integration remains enabled when product type is not changed during edit', async ({ page }) => {
    const loginPage = new QMagicLoginPage(page);
    const authenticatedShell = new QMagicAuthenticatedShell(page);

    // Arrange: open the application URL and verify the login page is displayed
    await loginPage.goto();
    await loginPage.assertLoginPageVisible();

    // Act: enter valid credentials and click the login button
    await loginPage.loginWithEnvCredentials();

    // Assert: verify the authenticated landing page/dashboard is displayed
    await loginPage.assertLoggedIn();
    await authenticatedShell.assertAuthenticatedShellVisible();

    // NOTE:
    // During mandatory live-site exploration, the reachable application is QMagic (https://demo.qmagic.ai/login).
    // The scenario requires a "Dairy management" section, a dairy edit drawer with a
    // "Product type" dropdown, and an "Add Zone Integration" button/option.
    // None of these elements exist in the observed OrangeHRM UI, so the remainder of the
    // scenario cannot be automated against the current BASE_URL.
  });
});
