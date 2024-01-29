import { expect, test } from "@playwright/test";

import { keyCloakSignIn } from "./common";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await keyCloakSignIn(page);
});

test.describe("Language", () => {
  test("checks the language picker", async ({ page }) => {
    const header = page.locator("header").first();

    await header.getByRole("combobox").getByText("FR").click();
    await expect(
      header.getByRole("option", { name: "Language Icon FR" }),
    ).toHaveAttribute("aria-selected", "true");
    await header.getByRole("option", { name: "Language Icon EN" }).click();
    await expect(header.getByRole("combobox").getByText("EN")).toBeVisible();
  });
});