import { expect, test } from '@playwright/test';

import { keyCloakSignIn, randomName } from './common';

test.beforeEach(async ({ page, browserName }) => {
  await page.goto('/');
  await keyCloakSignIn(page, browserName);
});

test.describe('Mail Domains Create', () => {
  test('checks all the elements are visible', async ({ page }) => {
    await page.goto('/mail-domains');

    const buttonFromHomePage = page.getByRole('button', {
      name: 'Create a mail domain',
    });

    await expect(buttonFromHomePage).toBeVisible();
    await buttonFromHomePage.click();

    await expect(buttonFromHomePage).toBeHidden();

    const card = page.getByLabel('Create mail domain card').first();

    await expect(card.getByLabel('Mail domain name')).toBeVisible();
    await expect(
      card.getByRole('heading', {
        name: 'Create a mail domain',
        level: 3,
      }),
    ).toBeVisible();
    await expect(
      card.getByText(
        'Please, wait for our services to validate your request once you submitted this form.\n' +
          'Once the domain is validated, you will be able to assign mailboxes to it.',
      ),
    ).toBeVisible();
    await expect(
      card.getByRole('button', {
        name: 'Create the mail domain',
      }),
    ).toBeVisible();
    await expect(
      card.getByRole('button', {
        name: 'Cancel',
      }),
    ).toBeVisible();
  });

  test('checks the cancel button interaction', async ({ page }) => {
    await page.goto('/mail-domains');

    const buttonFromHomePage = page.getByRole('button', {
      name: 'Create a mail domain',
    });
    await buttonFromHomePage.click();

    await expect(buttonFromHomePage).toBeHidden();

    const card = page.getByLabel('Create mail domain card').first();
    await card
      .getByRole('button', {
        name: 'Cancel',
      })
      .click();

    await expect(buttonFromHomePage).toBeVisible();
  });

  test('checks the routing on new mail domain created', async ({
    page,
    browserName,
  }) => {
    await page.goto('/mail-domains');

    const panel = page.getByLabel('Mail domains panel').first();
    await panel.getByRole('link', { name: 'Create a mail domain' }).click();

    const mailDomainName = randomName('versailles.fr', browserName, 1)[0];
    const mailDomainSlug = mailDomainName.replace('.', '');

    await page.getByText('Mail domain name').fill(mailDomainName);
    await page.getByRole('button', { name: 'Create the mail domain' }).click();

    await expect(page).toHaveURL(`/mail-domains\/${mailDomainSlug}\/`);

    const elMailDomain = page.getByRole('heading', { name: mailDomainName });

    await expect(elMailDomain).toBeVisible();

    await panel.getByRole('link', { name: 'Create a mail domain' }).click();

    await expect(elMailDomain).toBeHidden();

    await panel.locator('li').getByText(mailDomainName).click();
    await expect(elMailDomain).toBeVisible();
  });

  test('checks error when duplicate mail domain', async ({
    page,
    browserName,
  }) => {
    await page.goto('/mail-domains');

    const panel = page.getByLabel('Mail domains panel').first();
    const creationLink = panel.getByRole('link', {
      name: 'Create a mail domain',
    });
    const inputName = page.getByText('Mail domain name');
    const submitButton = page.getByRole('button', {
      name: 'Create the mail domain',
    });

    const mailDomainName = randomName('duplicate.fr', browserName, 1)[0];
    const mailDomainSlug = mailDomainName.replace('.', '');

    await creationLink.click();
    await inputName.fill(mailDomainName);
    await submitButton.click();

    await expect(page).toHaveURL(`/mail-domains\/${mailDomainSlug}\/`);

    await creationLink.click();

    await inputName.fill(mailDomainName);
    await submitButton.click();

    await expect(
      page.getByText(
        'This mail domain is already used. Please, choose another one.',
      ),
    ).toBeVisible();
  });

  test('checks 404 on mail-domains/[slug] page', async ({ page }) => {
    await page.goto('/mail-domains/unknown-domain');

    await expect(
      page.getByText(
        'It seems that the page you are looking for does not exist or cannot be displayed correctly.',
      ),
    ).toBeVisible({
      timeout: 15000,
    });
  });
});
