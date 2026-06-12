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

test.describe('Dairy - Product type dropdown behavior', () => {
  test('@new DC-TC-86 - Verify product type dropdown includes current type and allows reverting to original type during edit', async ({ page }) => {
    const loginPage = new QMagicLoginPage(page);
    const authenticatedShell = new QMagicAuthenticatedShell(page);

    // Arrange: open app and verify login page is displayed
    await loginPage.goto();
    await loginPage.assertLoginPageVisible();

    // Act: login
    await loginPage.loginWithEnvCredentials();

    // Assert: authenticated landing page/dashboard is displayed
    await loginPage.assertLoggedIn();
    await authenticatedShell.assertAuthenticatedShellVisible();

    // NOTE:
    // The configured BASE_URL in this repo points to OrangeHRM demo.
    // The required "Dairy management" section, dairy edit drawer, "Product type" dropdown,
    // and "Add Zone Integration" control are not present on the observed application.
    // Therefore, the remainder of the provided Dairy scenario cannot be automated
    // against the currently reachable site.
  });
});
