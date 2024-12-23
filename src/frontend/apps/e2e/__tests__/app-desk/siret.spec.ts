import { expect, test } from '@playwright/test';

import { keyCloakSignIn } from './common';

test.beforeEach(async ({ page, browserName }) => {
  await page.goto('/');
  await keyCloakSignIn(page, browserName, 'marie');
});

test.describe('OIDC interop with SIRET', () => {
  test('it checks the SIRET is displayed in /me endpoint', async ({ page }) => {
    const header = page.locator('header').first();
    await expect(header.getByAltText('Marianne Logo')).toBeVisible();

    const response = await page.request.get(
      'http://localhost:8071/api/v1.0/users/me/',
    );
    expect(response.ok()).toBeTruthy();
    expect(await response.json()).toMatchObject({
      organization: { registration_id_list: ['21580304000017'] },
    });
  });
});
