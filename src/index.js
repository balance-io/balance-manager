import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import ReduxThunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import Root from './layouts/Root.js';
import ReduxReset from './helpers/reduxReset';
import reducers from './reducers';
import registerServiceWorker from './helpers/registerServiceWorker';

const store = createStore(reducers, composeWithDevTools(applyMiddleware(ReduxThunk), ReduxReset()));

ReactDOM.render(
  <Provider store={store}>
    <Root />
  </Provider>,
  document.getElementById('root')
);
registerServiceWorker();
