import React from 'react';
import ReactDOM from 'react-dom';
import './helpers/intercom';
import { injectGlobal } from 'styled-components';
import { globalStyles } from './styles';
import { bootIntercom } from './helpers/bootIntercom';
import Root from './Root';
import Storage from '@devshack/react-native-storage';
import { commonStorage, lang, resources } from 'balance-common';

const storage = new Storage({
  size: 1000,
  storageBackend: window.localStorage,
  defaultExpires: null,
  enableCache: true,
});

window.storage = storage;

// Languages (i18n)
lang.init({
  lng: 'en',
  fallbackLng: 'en',
  debug: process.env.NODE_ENV === 'development',
  resources,
});

const cryptocompareApiKey = process.env.REACT_APP_CRYPTOCOMPARE_API_KEY;
console.log('### cryptocompareApiKey', cryptocompareApiKey);
commonStorage
  .getLanguage()
  .then(language => {
    lang.init({
      lng: language,
      fallbackLng: 'en',
      debug: process.env.NODE_ENV === 'development',
      resources,
    });
  })
  .catch(error => {
    lang.init({
      lng: 'en',
      fallbackLng: 'en',
      debug: process.env.NODE_ENV === 'development',
      resources,
    });
  });

// eslint-disable-next-line
injectGlobal`${globalStyles}`;

// Intercom
bootIntercom();

ReactDOM.render(<Root />, document.getElementById('root'));
