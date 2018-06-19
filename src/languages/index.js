import i18next from 'i18next';
import english from './_english.json';
import spanish from './_spanish.json';
import russian from './_russian.json';
import italian from './_italian.json';
import german from './_german.json';
import french from './_french.json';

export const resources = {
  en: english,
  es: spanish,
  ru: russian,
  it: italian,
  de: german,
  fr: french,
};

export const updateLanguage = code => i18next.changeLanguage(code);

i18next.on('languageChanged', () => {});

export default i18next;
