import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import BaseLayout from '../layouts/base';
import Account from '../components/Account';
import Card from '../components/Card';
import {
  accountsGetEthplorerInfo,
  accountsUpdateMetamaskAccount,
  accountsConnectMetamask,
  accountsClearUpdateAccountInterval,
  accountsGetNativePrices,
  accountsChangeNativeCurrency
} from '../reducers/_accounts';
import { modalOpen } from '../reducers/_modal';
import { fonts, colors } from '../styles';

const StyledWrapper = styled.div`
  width: 100%;
`;

const StyledMessage = styled.div`
  height: 177px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(${colors.grey});
  font-weight: ${fonts.weight.medium};
`;

class Metamask extends Component {
  componentDidMount() {
    this.props.accountsGetNativePrices();
    this.props.accountsConnectMetamask();
  }
  renderMessage() {
    if (!this.props.web3Available) return `Please install Metamask chrome extension`;
    if (!this.props.web3Mainnet) return `Please switch to Main Network`;
    if (!this.props.metamaskAccount) return `Please unlock your Metamask`;
  }
  componentWillUnmount() {
    this.props.accountsClearUpdateAccountInterval();
  }
  render = () => (
    <BaseLayout>
      <StyledWrapper>
        {this.props.fetching || this.props.metamaskAccount ? (
          <Account
            account={this.props.account}
            fetching={this.props.fetching}
            prices={this.props.prices}
            nativeCurrency={this.props.nativeCurrency}
            modalOpen={this.props.modalOpen}
          />
        ) : (
          <Card fetching={this.props.fetching}>
            <StyledMessage>{this.renderMessage()}</StyledMessage>
          </Card>
        )}
      </StyledWrapper>
    </BaseLayout>
  );
}

Metamask.propTypes = {
  accountsGetEthplorerInfo: PropTypes.func.isRequired,
  accountsUpdateMetamaskAccount: PropTypes.func.isRequired,
  accountsConnectMetamask: PropTypes.func.isRequired,
  accountsClearUpdateAccountInterval: PropTypes.func.isRequired,
  accountsGetNativePrices: PropTypes.func.isRequired,
  accountsChangeNativeCurrency: PropTypes.func.isRequired,
  modalOpen: PropTypes.func.isRequired,
  prices: PropTypes.object.isRequired,
  nativeCurrency: PropTypes.string.isRequired,
  web3Available: PropTypes.bool.isRequired,
  web3Mainnet: PropTypes.bool.isRequired,
  metamaskAccount: PropTypes.string.isRequired,
  account: PropTypes.object.isRequired,
  fetching: PropTypes.bool.isRequired,
  error: PropTypes.bool.isRequired
};

const reduxProps = ({ accounts }) => ({
  prices: accounts.prices,
  nativeCurrency: accounts.nativeCurrency,
  web3Available: accounts.web3Available,
  web3Mainnet: accounts.web3Mainnet,
  metamaskAccount: accounts.metamaskAccount,
  account: accounts.account,
  fetching: accounts.fetching,
  error: accounts.error
});

export default connect(reduxProps, {
  accountsGetEthplorerInfo,
  accountsUpdateMetamaskAccount,
  accountsConnectMetamask,
  accountsClearUpdateAccountInterval,
  accountsGetNativePrices,
  accountsChangeNativeCurrency,
  modalOpen
})(Metamask);
