import { Page, expect, test } from '@playwright/test';

import { keyCloakSignIn } from './common';

const payloadGetTeams = {
  count: 4,
  next: null,
  previous: null,
  results: [
    {
      id: 'b2224958-ac22-4863-9330-4322add64ebe',
      name: 'Test Group',
      accesses: ['1a1ba2ba-a58c-4593-8adb-1da6ee9cd3a3'],
      abilities: {
        get: true,
        patch: true,
        put: true,
        delete: true,
        manage_accesses: true,
      },
      slug: 'test-group',
      created_at: '2024-07-17T19:41:11.404763Z',
      updated_at: '2024-07-17T19:41:11.404763Z',
    },
  ],
};

const mockApiRequests = (page: Page) => {
  void page.route('**/teams/?ordering=-created_at', (route) => {
    void route.fulfill({
      json: payloadGetTeams.results,
    });
  });
};

test.describe('Keyboard navigation', () => {
  test('navigates through all focusable elements from top to bottom on groups index view when one group exists', async ({
    browser,
    browserName,
  }) => {
    const page = await browser.newPage();

    await page.goto('/');
    await keyCloakSignIn(page, browserName, 'team-owner-mail-member');

    void mockApiRequests(page);

    const header = page.locator('header');

    // La Gauffre button is loaded asynchronously, so we wait for it to be visible
    await expect(
      header.getByRole('button', {
        name: 'Les services de La Suite numérique',
      }),
    ).toBeVisible();

    // necessary to begin the keyboard navigation directly from first button on the app and only select its elements
    await header.click();

    // ensure ignoring elements (like tanstack query button) that are not part of the app
    const focusableElements = await page
      .locator(
        '.c__app a:not([tabindex="-1"]), .c__app button:not([tabindex="-1"]), ' +
          '.c__app [tabindex]:not([tabindex="-1"])',
      )
      .all();

    expect(focusableElements.length).toEqual(19);

    for (let i = 0; i < focusableElements.length; i++) {
      await page.keyboard.press('Tab');
      await expect(focusableElements[i]).toBeFocused();
    }
  });
});
