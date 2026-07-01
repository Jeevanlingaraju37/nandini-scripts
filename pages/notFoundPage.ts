import { expect, Locator, Page } from "@playwright/test";

export class NotFoundPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get pageNotFoundHeading(): Locator {
    return this.page.getByRole("heading", { name: "Page not found" });
  }

  async assertPageNotFound(): Promise<void> {
    await expect(this.pageNotFoundHeading).toBeVisible();
    await expect(this.page).toHaveURL("/404");
  }
}
