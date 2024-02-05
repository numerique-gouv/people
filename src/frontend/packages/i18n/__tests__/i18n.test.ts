import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

describe('integration testing on i18n package', () => {
  afterAll(() => {
    fs.rmSync('./locales/tests', { recursive: true, force: true });
  });

  test('cmd extract-translation:desk', () => {
    // To be sure the file is not here
    fs.rmSync('./locales/desk/translations-crowdin.json', {
      recursive: true,
      force: true,
    });
    expect(
      fs.existsSync('./locales/desk/translations-crowdin.json'),
    ).toBeFalsy();

    // Generate the file
    execSync('yarn extract-translation:desk');
    expect(
      fs.existsSync('./locales/desk/translations-crowdin.json'),
    ).toBeTruthy();
  });

  test('cmd format-deploy', () => {
    // To be sure the tests folder is not here
    fs.rmSync('./locales/tests', { recursive: true, force: true });
    expect(fs.existsSync('./locales/tests')).toBeFalsy();

    // Generate english json file
    fs.mkdirSync('./locales/tests/en/', { recursive: true });
    fs.writeFileSync(
      './locales/tests/en/translations.json',
      JSON.stringify({ test: { message: 'My test' } }),
      'utf8',
    );
    expect(fs.existsSync('./locales/tests/en/translations.json')).toBeTruthy();

    fs.mkdirSync('./locales/tests/fr/', { recursive: true });
    fs.writeFileSync(
      './locales/tests/fr/translations.json',
      JSON.stringify({ test: { message: 'Mon test' } }),
      'utf8',
    );
    expect(fs.existsSync('./locales/tests/fr/translations.json')).toBeTruthy();

    // Execute format-deploy command
    const output = './locales/tests/translations.json';
    execSync(`node ./format-deploy.mjs --app=tests --output=${output}`);
    const json = JSON.parse(fs.readFileSync(output, 'utf8'));
    expect(json).toEqual({
      en: {
        translation: { test: 'My test' },
      },
      fr: {
        translation: { test: 'Mon test' },
      },
    });
  });

  test('cmd format-deploy throws an error when translation file is not found', () => {
    // To be sure the tests folder is not here
    fs.rmSync('./locales/tests', { recursive: true, force: true });
    expect(fs.existsSync('./locales/tests')).toBeFalsy();

    // Generate english json file
    fs.mkdirSync('./locales/tests/en/', { recursive: true });

    // Execute format-deploy command
    const output = './locales/tests/translations.json';

    const cmd = () => {
      execSync(`node ./format-deploy.mjs --app=tests --output=${output}`, {
        stdio: 'pipe',
      });
    };

    expect(cmd).toThrow(
      `Error: File locales${path.sep}tests${path.sep}en${path.sep}translations.json not found!`,
    );
  });

  test('cmd format-deploy throws an error when no translation to deploy', () => {
    // To be sure the tests folder is not here
    fs.rmSync('./locales/tests', { recursive: true, force: true });
    expect(fs.existsSync('./locales/tests')).toBeFalsy();

    // Generate english json file
    fs.mkdirSync('./locales/tests/', { recursive: true });

    // Execute format-deploy command
    const output = './locales/tests/translations.json';

    const cmd = () => {
      execSync(`node ./format-deploy.mjs --app=tests --output=${output}`, {
        stdio: 'pipe',
      });
    };

    expect(cmd).toThrow('Error: No translation to deploy');
  });
});
