import { expect, Locator, Page } from "@playwright/test";

export class LoginPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get emailInput(): Locator {
    return this.page.getByRole("textbox", { name: "Email *" });
  }

  private get passwordInput(): Locator {
    return this.page.getByRole("textbox", { name: "Password *" });
  }

  private get signInButton(): Locator {
    return this.page.getByRole("button", { name: "Sign in" });
  }

  private get signUpButton(): Locator {
    return this.page.getByRole("button", { name: "Sign Up" });
  }

  async goto(): Promise<void> {
    await this.page.goto("/");
  }

  async assertLoginPageVisible(): Promise<void> {
    await expect(this.page).toHaveURL("https://platform-staging.vas.com/login?redirect=%2F");
    await expect(this.signInButton).toBeVisible();
    await expect(this.signUpButton).toBeVisible();
  }

  async login(params?: { username?: string; password?: string }): Promise<void> {
    const username =
      params?.username ??
      process.env.TEST_USERNAME ??
      process.env.APP_USERNAME ??
      "";

    const password =
      params?.password ??
      process.env.TEST_PASSWORD ??
      process.env.APP_PASSWORD ??
      "";

    await this.emailInput.fill(username);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  async assertLoggedIn(): Promise<void> {
    await expect(this.page).not.toHaveURL("https://platform-staging.vas.com/login?redirect=%2F");
    await expect(this.signInButton).toHaveCount(0);
  }
}
