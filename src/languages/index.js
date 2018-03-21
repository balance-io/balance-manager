import i18next from 'i18next';
import english from './_english.json';
import spanish from './_spanish.json';

export const resources = {
  en: english,
  es: spanish
};

export const updateLanguage = code => i18next.changeLanguage(code);

i18next.on('languageChanged', () => {
  /* eslint-disable-next-line */
  () => {};
});

export default i18next;
