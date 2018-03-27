import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import BaseLayout from '../layouts/base';
import AccountView from '../components/AccountView';
import Card from '../components/Card';
import { getLocal } from '../helpers/utilities';
import { accountUpdateWalletConnect, accountClearState } from '../reducers/_account';

const StyledWrapper = styled.div`
  width: 100%;
`;

class Wallet extends Component {
  componentDidMount() {
    const storedAddress = getLocal('walletconnect');
    if (storedAddress) {
      this.props.accountUpdateWalletConnect(storedAddress);
    } else {
      this.props.history.push('/');
    }
  }
  componentWillUnmount() {
    this.props.accountClearState();
  }
  render = () => (
    <BaseLayout>
      <StyledWrapper>
        {this.props.fetching || this.props.accountAddress ? (
          <AccountView match={this.props.match} />
        ) : (
          <Card fetching={this.props.fetching}>
            <div />
          </Card>
        )}
      </StyledWrapper>
    </BaseLayout>
  );
}

Wallet.propTypes = {
  accountUpdateWalletConnect: PropTypes.func.isRequired,
  accountClearState: PropTypes.func.isRequired,
  accountAddress: PropTypes.string,
  fetching: PropTypes.bool.isRequired,
  match: PropTypes.object.isRequired
};

Wallet.defaultProps = {
  accountAddress: null
};

const reduxProps = ({ account }) => ({
  fetching: account.fetching,
  accountAddress: account.accountAddress
});

export default connect(reduxProps, {
  accountUpdateWalletConnect,
  accountClearState
})(Wallet);
