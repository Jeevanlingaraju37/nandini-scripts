export type ItemConfigurationAccessExpectation = "accessible" | "pageNotFound" | "accessDenied";

export interface ItemConfigurationCombination {
  featureFlagEnabled: boolean;
  productFeatureEnabled: boolean;
  expectedMenuVisible: boolean;
  expectedDirectUrlResult: ItemConfigurationAccessExpectation;
}
