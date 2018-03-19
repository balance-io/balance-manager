import React, { Component } from 'react';
import PropTypes from 'prop-types';
import BigNumber from 'bignumber.js';
import Home from './pages/Home';
import Wallet from './pages/Wallet';
import Metamask from './pages/Metamask';
import Ledger from './pages/Ledger';
import Trezor from './pages/Trezor';
import NotFound from './pages/NotFound';
import { Route, Switch } from 'react-router-dom';

class Router extends Component {
  componentDidMount() {
    if (process.env.NODE_ENV === 'development') {
      window.BigNumber = BigNumber;
    }
    window.browserHistory = this.context.router.history;
  }
  render = () => (
    <Switch>
      <Route exact path="/" component={Home} />
      <Route exact path="/wallet/:view" component={Wallet} />
      <Route exact path="/metamask/:view" component={Metamask} />
      <Route exact path="/ledger/:view" component={Ledger} />
      <Route exact path="/trezor/:view" component={Trezor} />
      <Route component={NotFound} />
    </Switch>
  );
}

Router.contextTypes = {
  router: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
  email: PropTypes.string,
  signup: PropTypes.any
};

export default Router;
