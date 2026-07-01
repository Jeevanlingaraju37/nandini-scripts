import { expect, Locator, Page } from "@playwright/test";

export class ItemConfigurationPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get pageNotFoundHeading(): Locator {
    return this.page.getByRole("heading", { name: "Page not found" });
  }

  async goto(): Promise<void> {
    await this.page.goto("/dairy/29778/dairy-comp/settings/general/item-configuration");
  }

  async assertLoaded(): Promise<void> {
    // The Item Configuration page UI was not observed in the current environment.
    // This assertion intentionally only verifies that we did not land on the 404 page.
    await expect(this.pageNotFoundHeading).toHaveCount(0);
    await expect(this.page).toHaveURL(
      "/dairy/29778/dairy-comp/settings/general/item-configuration",
    );
  }
}
