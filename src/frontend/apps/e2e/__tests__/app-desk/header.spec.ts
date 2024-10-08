import { expect, test } from '@playwright/test';

import { keyCloakSignIn } from './common';

test.beforeEach(async ({ page, browserName }) => {
  await page.goto('/');
  await keyCloakSignIn(page, browserName);
});

test.describe('Header', () => {
  test('checks all the elements are visible', async ({ page, browserName }) => {
    const header = page.locator('header').first();

    await expect(header.getByAltText('Marianne Logo')).toBeVisible();

    await expect(header.getByText(/République Française/i)).toBeVisible();

    await expect(
      header.getByAltText('Freedom Equality Fraternity Logo'),
    ).toBeVisible();

    await expect(header.getByRole('link', { name: 'Régie' })).toBeVisible();

    await expect(header.locator('h2').getByText('Régie')).toHaveCSS(
      'color',
      'rgb(0, 0, 145)',
    );
    await expect(header.locator('h2').getByText('Régie')).toHaveCSS(
      'font-family',
      /Marianne/i,
    );

    await expect(
      header.getByRole('button', {
        name: 'Les services de La Suite numérique',
      }),
    ).toBeVisible();

    await expect(header.getByRole('combobox').getByText('EN')).toBeVisible();
    await expect(
      header.getByText(new RegExp(`E2E ${browserName}`, 'i')),
    ).toBeVisible();
  });

  test('checks logout button', async ({ page, browserName }) => {
    await page
      .getByRole('button', {
        name: new RegExp(`E2E ${browserName}`, 'i'),
      })
      .click();

    await page
      .getByRole('button', {
        name: 'Logout',
      })
      .click();

    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

  test('checks La Gauffre interaction', async ({ page }) => {
    const header = page.locator('header').first();

    await expect(
      header.getByRole('button', {
        name: 'Les services de La Suite numérique',
      }),
    ).toBeVisible();

    /**
     * La gaufre load a js file from a remote server,
     * it takes some time to load the file and have the interaction available
     */
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(1500);

    await header
      .getByRole('button', {
        name: 'Les services de La Suite numérique',
      })
      .click();

    await expect(
      page.getByRole('link', { name: 'France Transfert' }),
    ).toBeVisible();

    await expect(page.getByRole('link', { name: 'Grist' })).toBeVisible();
  });
});
