import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import BaseLayout from '../layouts/base';
import Account from '../views/Account';
import Card from '../components/Card';
import { getWalletConnectAccount } from '../handlers/localstorage';
import { accountUpdateAccountAddress } from '../reducers/_account';

const StyledWrapper = styled.div`
  width: 100%;
`;

class Wallet extends Component {
  componentDidMount() {
    const storedAddress = getWalletConnectAccount();
    if (storedAddress) {
      this.props.accountUpdateAccountAddress(storedAddress, 'WALLETCONNECT');
    } else {
      this.props.history.push('/');
    }
  }
  render = () => (
    <BaseLayout>
      <StyledWrapper>
        {this.props.fetching || this.props.accountAddress ? (
          <Account match={this.props.match} />
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
  accountUpdateAccountAddress: PropTypes.func.isRequired,
  accountAddress: PropTypes.string,
  fetching: PropTypes.bool.isRequired,
  match: PropTypes.object.isRequired,
};

Wallet.defaultProps = {
  accountAddress: null,
};

const reduxProps = ({ account }) => ({
  fetching: account.fetching,
  accountAddress: account.accountAddress,
});

export default connect(
  reduxProps,
  {
    accountUpdateAccountAddress,
  },
)(Wallet);
