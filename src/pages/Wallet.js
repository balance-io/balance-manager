import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import BaseLayout from '../layouts/base';
import AccountView from '../components/AccountView';
import Card from '../components/Card';
import { getLocal } from '../helpers/utilities';
import { accountUpdateWalletConnect } from '../reducers/_account';
// import { fonts, colors } from '../styles';

const StyledWrapper = styled.div`
  width: 100%;
`;

// const StyledMessage = styled.div`
//   height: 177px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   color: rgb(${colors.grey});
//   font-weight: ${fonts.weight.medium};
// `;

class Wallet extends Component {
  componentDidMount() {
    const storedAddress = getLocal('walletconnect');
    console.log('storedAddress', storedAddress);
    if (storedAddress) {
      this.props.accountUpdateWalletConnect(storedAddress);
    } else {
      this.props.history.push('/');
    }
  }
  render = () => (
    <BaseLayout>
      <StyledWrapper>
        {this.props.fetching || this.props.walletConnectAccount ? (
          <AccountView match={this.props.match} />
        ) : (
          <Card fetching={this.props.fetching}>
            {/* <StyledMessage>{this.renderMessage()}</StyledMessage> */}
            <div />
          </Card>
        )}
      </StyledWrapper>
    </BaseLayout>
  );
}

Wallet.propTypes = {
  accountUpdateWalletConnect: PropTypes.func.isRequired,
  walletConnectAccount: PropTypes.string,
  fetching: PropTypes.bool.isRequired,
  match: PropTypes.object.isRequired
};

Wallet.defaultProps = {
  walletConnectAccount: null
};

const reduxProps = ({ account }) => ({
  fetching: account.fetching,
  walletConnectAccount: account.walletConnectAccount
});

export default connect(reduxProps, {
  accountUpdateWalletConnect
})(Wallet);
