import { expect, Locator, Page } from "@playwright/test";

export class DairyProfilePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get configureDairyButton(): Locator {
    return this.page.getByRole("button", { name: "Configure Dairy" });
  }

  private get dairyProfileBreadcrumb(): Locator {
    return this.page.getByRole("listitem").filter({ hasText: "Dairy Profile" });
  }

  async assertVisible(): Promise<void> {
    await expect(this.page).toHaveURL("https://platform-staging.vas.com/dairy/29778");
    await expect(this.dairyProfileBreadcrumb).toBeVisible();
    await expect(this.configureDairyButton).toBeVisible();
    await expect(this.configureDairyButton).toBeEnabled();
  }

  async clickConfigureDairy(): Promise<void> {
    await this.configureDairyButton.click();
  }
}
