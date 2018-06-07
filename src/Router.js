import React, { Component } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Homepage from './pages';
import Wallet from './pages/Wallet';
import Metamask from './pages/Metamask';
import Ledger from './pages/Ledger';
import Trezor from './pages/Trezor';
import NotFound from './pages/NotFound';
import { warningOnline, warningOffline } from './reducers/_warning';

class Router extends Component {
  componentDidMount() {
    window.browserHistory = this.context.router.history;
    window.onoffline = () => this.props.warningOffline();
    window.ononline = () => this.props.warningOnline();
  }
  render = () => (
    <Switch>
      <Route exact path="/" component={Homepage} />
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
  signup: PropTypes.any,
};

const reduxProps = ({ account }) => ({
  language: account.language,
});

export default withRouter(
  connect(
    reduxProps,
    {
      warningOffline,
      warningOnline,
    },
  )(Router),
);
