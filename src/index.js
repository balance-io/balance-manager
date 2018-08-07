import React from 'react';
import ReactDOM from 'react-dom';
import './helpers/intercom';
import { injectGlobal } from 'styled-components';
import { globalStyles } from './styles';
import { bootIntercom } from './helpers/utilities';
import { getLanguage } from './handlers/localstorage';
import lang, { resources } from './languages';
import Root from './Root';
import Storage from '@devshack/react-native-storage';

const storage = new Storage({
  size: 1000,
  storageBackend: window.localStorage,
  defaultExpires: null,
  enableCache: true,
});

window.storage = storage;

// eslint-disable-next-line
injectGlobal`${globalStyles}`;

// Intercom
bootIntercom();

// Languages (i18n)
lang.init({
  lng: getLanguage() || 'en',
  fallbackLng: 'en',
  debug: process.env.NODE_ENV === 'development',
  resources,
});

ReactDOM.render(<Root />, document.getElementById('root'));
