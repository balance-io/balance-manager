import React, { Component } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import BigNumber from 'bignumber.js';
import lang, { resources } from './languages';
import Home from './pages/Home';
import Wallet from './pages/Wallet';
import Metamask from './pages/Metamask';
import Ledger from './pages/Ledger';
import Trezor from './pages/Trezor';
import NotFound from './pages/NotFound';
import { warningOnline, warningOffline } from './reducers/_warning';

import { apiLambdaGetBalance } from './helpers/api';

class Router extends Component {
  componentWillMount() {
    // TEST lambda function
    const address = `0x648abda15186b1e4587722009497c8e3c9242c6b`;
    apiLambdaGetBalance(address)
      .then(({ data }) => console.log(address, data))
      .catch(err => console.log(err));
    //

    lang.init({
      lng: 'en',
      debug: process.env.NODE_ENV === 'development',
      resources
    });
  }
  componentDidMount() {
    if (process.env.NODE_ENV === 'development') {
      window.BigNumber = BigNumber;
    }
    window.browserHistory = this.context.router.history;
    window.onoffline = () => this.props.warningOffline();
    window.ononline = () => this.props.warningOnline();
  }
  render = () => (
    <Switch>
      <Route exact path="/" component={Home} />
      <Route path="/wallet" component={Wallet} />
      <Route path="/metamask" component={Metamask} />
      <Route path="/ledger" component={Ledger} />
      <Route path="/trezor" component={Trezor} />
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

export default withRouter(
  connect(null, {
    warningOffline,
    warningOnline
  })(Router)
);
