import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { LANGUAGES_ALLOWED, LANGUAGE_LOCAL_STORAGE } from './conf';
import resourcesContact from './contacts/contact-translations.json';
import resourcesTeam from './teams/teams-translations.json';
import resources from './translations.json';
import { getLanguage } from './utils';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getLanguage(),
    interpolation: {
      escapeValue: false,
    },
    preload: LANGUAGES_ALLOWED,
    nsSeparator: '||',
  })
  .then(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = i18n.language;
    }
  })
  .catch(() => {
    throw new Error('i18n initialization failed');
  });

i18n.addResourceBundle('fr', 'contact', resourcesContact.fr.translation);
i18n.addResourceBundle('en', 'contact', resourcesContact.en.translation);
i18n.addResourceBundle('fr', 'team', resourcesTeam.fr.translation);
i18n.addResourceBundle('en', 'team', resourcesTeam.en.translation);

// Save language in local storage
i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LANGUAGE_LOCAL_STORAGE, lng);
    document.documentElement.lang = lng;
  }
});

export default i18n;
