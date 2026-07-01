import { Page } from "@playwright/test";

export interface SetItemConfigurationAccessParams {
  featureFlagEnabled: boolean;
  productFeatureEnabled: boolean;
}

export class FeatureFlagManager {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Semi-automated placeholder.
   *
   * This repo/environment does not expose a UI/API for toggling feature flags/product features
   * in the explored application flow. This method is intentionally a no-op so the test can
   * execute the UI validations for the currently configured environment.
   */
  async setItemConfigurationAccess(_params: SetItemConfigurationAccessParams): Promise<void> {
    // Intentionally left blank.
  }
}
