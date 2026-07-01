import { expect, Locator, Page } from "@playwright/test";

export class DairyCompGeneralSettingsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get settingsHeading(): Locator {
    return this.page.getByRole("heading", { name: "Settings" });
  }

  private get generalSettingsTab(): Locator {
    return this.page.getByRole("tab", { name: "General Settings" });
  }

  private get itemConfigurationMenuItem(): Locator {
    return this.page.getByRole("link", { name: "Item Configuration" });
  }

  async goto(): Promise<void> {
    await this.page.goto("/dairy/29778/dairy-comp/settings/general");
  }

  async assertOnGeneralSettingsPage(): Promise<void> {
    await expect(this.page).toHaveURL("/dairy/29778/dairy-comp/settings/general");
    await expect(this.settingsHeading).toBeVisible();
    await expect(this.generalSettingsTab).toBeVisible();
  }

  async assertItemConfigurationMenuVisible(params?: { visible: boolean }): Promise<void> {
    const visible = params?.visible ?? true;

    if (visible) {
      await expect(this.itemConfigurationMenuItem).toBeVisible();
      return;
    }

    await expect(this.itemConfigurationMenuItem).toHaveCount(0);
  }

  async clickItemConfiguration(): Promise<void> {
    await expect(this.itemConfigurationMenuItem).toBeVisible();
    await expect(this.itemConfigurationMenuItem).toBeEnabled();
    await this.itemConfigurationMenuItem.click();
  }
}
