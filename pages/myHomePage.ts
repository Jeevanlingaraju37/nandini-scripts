import { expect, Locator, Page } from "@playwright/test";

export class MyHomePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get myHomeBreadcrumb(): Locator {
    return this.page.getByRole("listitem").filter({ hasText: "My Home" });
  }

  private get myConnectionsHeading(): Locator {
    return this.page.getByRole("heading", { name: "My Connections" });
  }

  private get jeevanDairyRow(): Locator {
    return this.page.getByRole("row", { name: "Jeevan Dairy dairy-jeevan sss" });
  }

  async goto(): Promise<void> {
    await this.page.goto("/user/my-home");
  }

  async assertVisible(): Promise<void> {
    await expect(this.page).toHaveURL("https://platform-staging.vas.com/user/my-home");
    await expect(this.myConnectionsHeading).toBeVisible();
    await expect(this.myHomeBreadcrumb).toBeVisible();
  }

  async openJeevanDairy(): Promise<void> {
    await this.jeevanDairyRow.click();
  }
}
