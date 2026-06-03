import { test, expect, type Page, type Locator } from '@playwright/test';

class QMagicLoginPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get usernameInput(): Locator {
    return this.page
      .getByRole('textbox', { name: /user(name)?|email|e-?mail|login/i })
      .or(this.page.getByLabel(/user(name)?|email|e-?mail|login/i))
      .or(this.page.locator('input[name="username"], input[name="email"], input[id*="user" i], input[placeholder*="user" i], input[placeholder*="email" i]'));
  }

  private get passwordInput(): Locator {
    return this.page
      .getByRole('textbox', { name: /password/i })
      .or(this.page.getByLabel(/password/i))
      .or(this.page.locator('input[type="password"], input[name="password"], input[id*="pass" i], input[placeholder*="pass" i]'));
  }

  private get submitButton(): Locator {
    return this.page.getByRole('button', { name: /log\s*in|sign\s*in|submit/i });
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
}

class QMagicPostLoginPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get dashboardHeading(): Locator {
    return this.page.getByRole('heading', { name: /dashboard/i });
  }

  private get clientSelectionHeading(): Locator {
    return this.page.getByRole('heading', { name: /client\s*selection|select\s*client|choose\s*client/i });
  }

  private get clientCombobox(): Locator {
    return this.page.getByRole('combobox', { name: /client/i });
  }

  async assertLandedOnDashboardOrClientSelection() {
    await expect
      .poll(async () => {
        const dashboardVisible = await this.dashboardHeading.isVisible().catch(() => false);
        const clientHeadingVisible = await this.clientSelectionHeading.isVisible().catch(() => false);
        const clientComboVisible = await this.clientCombobox.isVisible().catch(() => false);

        return dashboardVisible || clientHeadingVisible || clientComboVisible;
      })
      .toBeTruthy();
  }
}

test.describe('QM-TC-6 - Login redirects to dashboard or client selection', { tag: '@new' }, () => {
  test('47c8bd81-bed2-4528-8ef1-29f09a849863 - Successful login with valid credentials redirects correctly', async ({ page }) => {
    const loginPage = new QMagicLoginPage(page);
    const postLoginPage = new QMagicPostLoginPage(page);

    const username = process.env.TEST_USERNAME ?? process.env.APP_USERNAME;
    const password = process.env.TEST_PASSWORD ?? process.env.APP_PASSWORD;

    if (!username || !password) {
      throw new Error(
        'Missing credentials. Set TEST_USERNAME/TEST_PASSWORD (preferred) or APP_USERNAME/APP_PASSWORD in environment variables.',
      );
    }

    // Arrange
    await loginPage.goto();
    await loginPage.assertLoginFormVisible();

    // Act
    await loginPage.login({ username, password });

    // Assert
    await postLoginPage.assertLandedOnDashboardOrClientSelection();
  });
});
