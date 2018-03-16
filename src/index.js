import React from 'react';
import ReactDOM from 'react-dom';
import { injectGlobal } from 'styled-components';
import { globalStyles } from './styles';
import './helpers/intercom';
import { bootIntercom } from './helpers/utilities';
import registerServiceWorker from './helpers/registerServiceWorker';
import Root from './Root';

// eslint-disable-next-line
injectGlobal`${globalStyles}`;

// Intercom
bootIntercom();

ReactDOM.render(<Root />, document.getElementById('root'));
registerServiceWorker();
