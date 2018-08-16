import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { lang } from 'balance-common';
import BaseLayout from '../layouts/base';
import Account from '../views/Account';
import Card from '../components/Card';
import {
  metamaskUpdateMetamaskAccount,
  metamaskConnectInit,
  metamaskClearIntervals,
} from '../reducers/_metamask';
import { fonts, colors } from '../styles';

const StyledWrapper = styled.div`
  width: 100%;
`;

const StyledMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(${colors.grey});
  font-weight: ${fonts.weight.medium};
`;

class Metamask extends Component {
  componentDidMount() {
    this.props.metamaskConnectInit();
  }
  renderMessage() {
    if (!this.props.web3Available) return lang.t('message.web3_not_available');
    if (!this.props.accountAddress) return lang.t('message.web3_not_unlocked');
    if (!this.props.network) return lang.t('message.web3_unknown_network');
  }
  componentWillUnmount() {
    this.props.metamaskClearIntervals();
  }
  render = () => (
    <BaseLayout>
      <StyledWrapper>
        {this.props.fetching ||
        (this.props.network &&
          this.props.accountAddress &&
          this.props.web3Available) ? (
          <Account
            fetchingWallet={this.props.fetching}
            match={this.props.match}
          />
        ) : (
          <Card minHeight={200} fetching={this.props.fetching}>
            <StyledMessage>{this.renderMessage()}</StyledMessage>
          </Card>
        )}
      </StyledWrapper>
    </BaseLayout>
  );
}

Metamask.propTypes = {
  metamaskUpdateMetamaskAccount: PropTypes.func.isRequired,
  metamaskConnectInit: PropTypes.func.isRequired,
  metamaskClearIntervals: PropTypes.func.isRequired,
  web3Available: PropTypes.bool.isRequired,
  network: PropTypes.string.isRequired,
  fetching: PropTypes.bool.isRequired,
  match: PropTypes.object.isRequired,
  accountAddress: PropTypes.string,
};

Metamask.defaultProps = {
  accountAddress: null,
};

const reduxProps = ({ account, metamask }) => ({
  accountType: account.accountType,
  web3Available: metamask.web3Available,
  network: metamask.network,
  accountAddress: metamask.accountAddress,
  fetching: metamask.fetching,
});

export default connect(
  reduxProps,
  {
    metamaskUpdateMetamaskAccount,
    metamaskConnectInit,
    metamaskClearIntervals,
  },
)(Metamask);
