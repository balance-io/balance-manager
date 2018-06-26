import i18next from 'i18next';
import brazilian from './_brazilian.json';
import english from './_english.json';
import french from './_french.json';
import german from './_german.json';
import czech from './_czech.json';
import italian from './_italian.json';
import portuguese from './_portuguese.json';
import russian from './_russian.json';
import spanish from './_spanish.json';
import polish from './_polish.json';

export const resources = {
  en: english,
  br: brazilian,
  de: german,
  es: spanish,
  fr: french,
  it: italian,
  cz: czech,
  pt: portuguese,
  ru: russian,
  pl: polish,
};

export const updateLanguage = code => i18next.changeLanguage(code);

i18next.on('languageChanged', () => {});

export default i18next;
