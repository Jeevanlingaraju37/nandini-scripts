import { expect, Locator, Page } from "@playwright/test";

export class ItemDefinitionsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get topicCombobox(): Locator {
    return this.page.getByRole("combobox", { name: "Topic" });
  }

  private get filterBySearchbox(): Locator {
    return this.page.getByRole("searchbox", { name: "Filter by" });
  }

  private get showInactiveCheckbox(): Locator {
    return this.page.getByRole("checkbox", { name: "Show Inactive" });
  }

  private get recordsText(): Locator {
    return this.page.getByText("Records", { exact: true });
  }

  private get itemDefinitionsTable(): Locator {
    return this.page.getByRole("table");
  }

  async goto(): Promise<void> {
    await this.page.goto("/dairy/29778/dairy-comp/settings/general/item-definitions");
  }

  async assertLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(
      "https://platform-staging.vas.com/dairy/29778/dairy-comp/settings/general/item-definitions",
    );
    await expect(this.topicCombobox).toBeVisible();
    await expect(this.filterBySearchbox).toBeVisible();
    await expect(this.showInactiveCheckbox).toBeVisible();
    await expect(this.recordsText).toBeVisible();
    await expect(this.itemDefinitionsTable).toBeVisible();
  }
}
