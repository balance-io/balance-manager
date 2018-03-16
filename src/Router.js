import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Home from './pages/Home';
import Metamask from './pages/Metamask';
import NotFound from './pages/NotFound';
import { Route, Switch } from 'react-router-dom';

class Router extends Component {
  componentDidMount() {
    window.browserHistory = this.context.router.history;
  }
  render = () => (
    <Switch>
      <Route exact path="/" component={Home} />
      <Route exact path="/metamask" component={Metamask} />
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
