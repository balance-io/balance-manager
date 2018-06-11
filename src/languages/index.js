import i18next from 'i18next';
import english from './_english.json';
import spanish from './_spanish.json';
import russian from './_russian.json';

export const resources = {
  en: english,
  es: spanish,
  ru: russian,
};

export const updateLanguage = code => i18next.changeLanguage(code);

i18next.on('languageChanged', () => {});

export default i18next;
