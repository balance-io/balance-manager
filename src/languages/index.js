import i18next from 'i18next';
import english from './_english.json';
import brazilian from './_brazilian.json';
import german from './_german.json';
import italian from './_italian.json';
import russian from './_russian.json';
import spanish from './_spanish.json';

export const resources = {
  en: english,
  br: brazilian,
  de: german,
  es: spanish,
  it: italian,
  ru: russian,
};

export const updateLanguage = code => i18next.changeLanguage(code);

i18next.on('languageChanged', () => {});

export default i18next;
