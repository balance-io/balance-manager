import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import ReduxThunk from 'redux-thunk';
import reducers from './reducers';
import Router from './Router';

const store = createStore(reducers, composeWithDevTools(applyMiddleware(ReduxThunk)));

const Root = () => (
  <Provider store={store}>
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  </Provider>
);

export default Root;
