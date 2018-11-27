import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import ReduxThunk from 'redux-thunk';
import history from './history';
import piwik from './piwik';
import reducers from './reducers';
import WalletRouter from './Router';

const store = createStore(
  reducers,
  composeWithDevTools(applyMiddleware(ReduxThunk)),
);

const Root = () => (
  <Provider store={store}>
    <Router history={piwik.connectToHistory(history)}>
      <WalletRouter />
    </Router>
  </Provider>
);

export default Root;
