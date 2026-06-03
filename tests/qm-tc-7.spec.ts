import { test, expect, type Locator, type Page } from '@playwright/test';

class QMagicLoginPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get usernameInput(): Locator {
    return this.page
      .getByRole('textbox', { name: /user(name)?|email|e-?mail|login/i })
      .or(this.page.getByLabel(/user(name)?|email|e-?mail|login/i))
      .or(
        this.page.locator(
          'input[name="username"], input[name="email"], input[id*="user" i], input[placeholder*="user" i], input[placeholder*="email" i]',
        ),
      );
  }

  private get passwordInput(): Locator {
    return this.page
      .getByRole('textbox', { name: /password/i })
      .or(this.page.getByLabel(/password/i))
      .or(
        this.page.locator(
          'input[type="password"], input[name="password"], input[id*="pass" i], input[placeholder*="pass" i]',
        ),
      );
  }

  private get submitButton(): Locator {
    return this.page.getByRole('button', { name: /log\s*in|sign\s*in|submit/i });
  }

  private get invalidCredentialsAlert(): Locator {
    return this.page
      .getByRole('alert')
      .or(this.page.getByText(/invalid|incorrect|wrong|unauthori[sz]ed|failed/i));
  }

  async goto() {
    await this.page.goto(process.env.BASE_URL ?? '/');
  }

  async assertLoginFormVisible() {
    // Element Recovery Rule: retry locating key fields up to 2 times before failing.
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        await expect(this.usernameInput).toBeVisible({ timeout: 5000 });
        break;
      } catch (error) {
        if (attempt === 2) throw error;
        await this.page.waitForTimeout(500);
      }
    }

    await expect(this.usernameInput).toBeEnabled();

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        await expect(this.passwordInput).toBeVisible({ timeout: 5000 });
        break;
      } catch (error) {
        if (attempt === 2) throw error;
        await this.page.waitForTimeout(500);
      }
    }

    await expect(this.passwordInput).toBeEnabled();

    await expect(this.submitButton).toBeVisible();
    await expect(this.submitButton).toBeEnabled();
  }

  async login(params: { username: string; password: string }) {
    await this.usernameInput.fill(params.username);
    await this.passwordInput.fill(params.password);
    await this.submitButton.click();
  }

  async assertLoginFailedWithError() {
    await expect(this.invalidCredentialsAlert).toBeVisible();
    await expect(this.invalidCredentialsAlert).toContainText(/invalid|incorrect|wrong|unauthori[sz]ed|failed/i);

    // User remains on login page (form still visible)
    await this.assertLoginFormVisible();
  }
}

test.describe('QM-TC-7 - Login fails with invalid credentials', { tag: '@new' }, () => {
  test('8b3714cf-4bce-4c3b-bded-e08ce3f66f1a - User is denied access and shown an error message', async ({ page }) => {
    const loginPage = new QMagicLoginPage(page);

    const validUsername = process.env.TEST_USERNAME ?? process.env.APP_USERNAME;
    const validPassword = process.env.TEST_PASSWORD ?? process.env.APP_PASSWORD;

    if (!validUsername || !validPassword) {
      throw new Error(
        'Missing credentials. Set TEST_USERNAME/TEST_PASSWORD (preferred) or APP_USERNAME/APP_PASSWORD in environment variables.',
      );
    }

    // Arrange
    await loginPage.goto();
    await loginPage.assertLoginFormVisible();

    // Act
    await loginPage.login({ username: `${validUsername}.invalid`, password: `${validPassword}.invalid` });

    // Assert
    await loginPage.assertLoginFailedWithError();
  });
});
