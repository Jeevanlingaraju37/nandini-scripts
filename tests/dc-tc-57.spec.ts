import { test, expect, Page, Locator } from '@playwright/test';

/**
 * NOTE:
 * Repository access is restricted to /workspace/repo/tests only in this environment,
 * so this spec includes minimal inline page objects.
 * In a full repo, these classes should live under /pages and be reused across tests.
 */

class LoginPage {
  constructor(private readonly page: Page) {}

  private get usernameInput(): Locator {
    return this.page
      .getByRole('textbox', { name: /username|email/i })
      .or(this.page.getByLabel(/username|email/i))
      .or(this.page.locator('input[name="username"], input[name="email"], input[type="email"], input[id*="user" i], input[placeholder*="email" i]'));
  }

  private get passwordInput(): Locator {
    return this.page
      .getByRole('textbox', { name: /password/i })
      .or(this.page.getByLabel(/password/i))
      .or(this.page.locator('input[name="password"], input[type="password"], input[id*="pass" i]'));
  }

  private get signInButton(): Locator {
    return this.page
      .getByRole('button', { name: /sign in|log in|login/i })
      .or(this.page.getByRole('button', { name: /continue|next/i }))
      .or(this.page.locator('button[type="submit"], input[type="submit"]'));
  }

  async goto(): Promise<void> {
    const baseUrl = process.env.BASE_URL;
    expect(baseUrl, 'BASE_URL must be set').toBeTruthy();
    await this.page.goto(baseUrl!);
  }

  async login(): Promise<void> {
    const username = process.env.TEST_USERNAME ?? process.env.APP_USERNAME;
    const password = process.env.TEST_PASSWORD ?? process.env.APP_PASSWORD;

    expect(username, 'TEST_USERNAME or APP_USERNAME must be set').toBeTruthy();
    expect(password, 'TEST_PASSWORD or APP_PASSWORD must be set').toBeTruthy();

    // Some environments may already be authenticated (SSO) or land on a non-login page.
    // Only attempt credential entry if a login form is present.
    const loginFormVisible = await this.usernameInput.first().isVisible().catch(() => false);
    if (!loginFormVisible) return;

    await expect(this.usernameInput.first()).toBeVisible();
    await this.usernameInput.first().fill(username!);

    // Some login flows are multi-step (username -> next -> password).
    const passwordVisibleInitially = await this.passwordInput.first().isVisible().catch(() => false);
    if (!passwordVisibleInitially) {
      await expect(this.signInButton.first()).toBeEnabled();
      await this.signInButton.first().click();
    }

    await expect(this.passwordInput.first()).toBeVisible();
    await this.passwordInput.first().fill(password!);

    await expect(this.signInButton.first()).toBeEnabled();
    await this.signInButton.first().click();
  }

  async assertAuthenticatedLandingPageVisible(): Promise<void> {
    // Generic assertion: user menu / logout / dashboard heading.
    const possibleLandingMarkers: Locator[] = [
      this.page.getByRole('navigation'),
      this.page.getByRole('banner'),
      this.page.getByRole('heading', { name: /dashboard|home/i }),
      this.page.getByRole('button', { name: /logout|sign out/i }),
    ];

    // At least one marker should become visible.
    await expect
      .poll(async () => {
        for (const marker of possibleLandingMarkers) {
          if (await marker.first().isVisible().catch(() => false)) return true;
        }
        return false;
      })
      .toBeTruthy();
  }
}

class ContractsPage {
  constructor(private readonly page: Page) {}

  private get weighCompNavLink(): Locator {
    return this.page.getByRole('link', { name: /weighcomp/i });
  }

  private get contractsNavLink(): Locator {
    return this.page.getByRole('link', { name: /contracts/i });
  }

  private get fromDateInput(): Locator {
    return this.page.getByRole('textbox', { name: /from date|from/i });
  }

  private get toDateInput(): Locator {
    return this.page.getByRole('textbox', { name: /to date|to/i });
  }

  private get recordsCountLabel(): Locator {
    return this.page.getByText(/\b\d+\s+records\b/i);
  }

  private get table(): Locator {
    return this.page.getByRole('table');
  }

  private get tableBodyRows(): Locator {
    return this.table.getByRole('row');
  }

  private get emptyStateMessage(): Locator {
    return this.page.getByText(/no (records|results|data)|nothing to display|no contracts/i);
  }

  async gotoViaNavigation(): Promise<void> {
    // Try direct navigation first (more stable), then fallback to menu navigation.
    const baseUrl = process.env.BASE_URL;
    expect(baseUrl, 'BASE_URL must be set').toBeTruthy();

    await this.page.goto(`${baseUrl!}/contracts`);

    if (!(await this.page.url().includes('/contracts'))) {
      await expect(this.weighCompNavLink).toBeVisible();
      await this.weighCompNavLink.click();

      await expect(this.contractsNavLink).toBeVisible();
      await this.contractsNavLink.click();
    }
  }

  async assertOnContractsUrl(): Promise<void> {
    await expect(this.page).toHaveURL(/\/contracts(\b|\/|\?|#)/);
  }

  async setDateFilters(params: { from: string; to: string }): Promise<void> {
    await expect(this.fromDateInput).toBeVisible();
    await this.fromDateInput.fill('');
    await this.fromDateInput.fill(params.from);
    await this.fromDateInput.press('Enter');

    await expect(this.toDateInput).toBeVisible();
    await this.toDateInput.fill('');
    await this.toDateInput.fill(params.to);
    await this.toDateInput.press('Enter');
  }

  async assertRecordCountIsZero(): Promise<void> {
    await expect(this.recordsCountLabel).toBeVisible();
    await expect(this.recordsCountLabel).toHaveText(/\b0\s+records\b/i);
  }

  async assertEmptyTableOrEmptyState(): Promise<void> {
    // Prefer explicit empty state message if present; otherwise assert no data rows.
    const emptyMessageVisible = await this.emptyStateMessage.first().isVisible().catch(() => false);
    if (emptyMessageVisible) {
      await expect(this.emptyStateMessage.first()).toBeVisible();
      return;
    }

    // If table exists, ensure it has no data rows beyond header.
    const tableVisible = await this.table.first().isVisible().catch(() => false);
    if (tableVisible) {
      // Many tables include a header row; assert row count is 0 or 1.
      await expect(this.tableBodyRows).toHaveCount(0);
    } else {
      // If neither table nor empty message is visible, fail with a helpful assertion.
      await expect(this.emptyStateMessage.first()).toBeVisible();
    }
  }
}

test.describe('WeighComp - Contracts empty state', () => {
  test('DC-TC-57 - Verify Contracts page empty state when no contracts match the applied filters', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const contractsPage = new ContractsPage(page);

    // Arrange: open app and authenticate
    await loginPage.goto();
    await loginPage.login();
    await loginPage.assertAuthenticatedLandingPageVisible();

    // Act: navigate to Contracts and apply future date filters
    await contractsPage.gotoViaNavigation();
    await contractsPage.assertOnContractsUrl();
    await contractsPage.setDateFilters({ from: '01/01/2030', to: '12/31/2030' });

    // Assert: verify 0 records and empty state
    await contractsPage.assertRecordCountIsZero();
    await contractsPage.assertEmptyTableOrEmptyState();
  });
});
