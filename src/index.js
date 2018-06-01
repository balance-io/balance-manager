import React from 'react';
import ReactDOM from 'react-dom';
import './helpers/intercom';
import { injectGlobal } from 'styled-components';
import { globalStyles } from './styles';
// import { bootIntercom } from './helpers/utilities';
import lang, { resources } from './languages';
import Root from './Root';

// eslint-disable-next-line
injectGlobal`${globalStyles}`;

// Intercom
// bootIntercom();

// Languages (i18n)
lang.init({
  lng: 'en',
  debug: process.env.NODE_ENV === 'development',
  resources,
});

ReactDOM.render(<Root />, document.getElementById('root'));
