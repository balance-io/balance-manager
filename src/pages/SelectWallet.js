import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from '../components/Button';
import { accountsConnectMetamask, accountsUpdateSelectedWallet } from '../reducers/_accounts';

class SelectWallet extends Component {
  onConnectMetamask = () => {
    this.props.accountsConnectMetamask();
    this.props.accountsUpdateSelectedWallet('METAMASK');
  };
  render = () => (
    <div>
      <Button onClick={this.onConnectMetamask}>Connect to Metamask</Button>
    </div>
  );
}

SelectWallet.propTypes = {
  accountsConnectMetamask: PropTypes.func.isRequired
};

export default connect(null, {
  accountsConnectMetamask,
  accountsUpdateSelectedWallet
})(SelectWallet);
