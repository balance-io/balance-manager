import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import lang from '../languages';
import BaseLayout from '../layouts/base';
import AccountView from '../components/AccountView';
import Card from '../components/Card';
import {
  accountUpdateMetamaskAccount,
  accountConnectMetamask,
  accountClearIntervals,
  accountClearState,
  accountChangeNativeCurrency,
  accountCheckNetworkIsConnected
} from '../reducers/_account';
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
    this.props.accountConnectMetamask();
    window.onoffline = () => this.props.accountCheckNetworkIsConnected(false);
    window.ononline = () => this.props.accountCheckNetworkIsConnected(true);
  }
  renderMessage() {
    if (!this.props.web3Available) return lang.t('message.web3_not_available');
    if (!this.props.accountAddress) return lang.t('message.web3_not_unlocked');
    if (!this.props.web3Network) return lang.t('message.web3_unknown_network');
  }
  componentWillUnmount() {
    this.props.accountClearIntervals();
    this.props.accountClearState();
  }
  render = () => (
    <BaseLayout>
      <StyledWrapper>
        {this.props.fetching ||
        (this.props.web3Network && this.props.accountAddress && this.props.web3Available) ? (
          <AccountView match={this.props.match} />
        ) : (
          <Card minHeight={180} fetching={this.props.fetching}>
            <StyledMessage>{this.renderMessage()}</StyledMessage>
          </Card>
        )}
      </StyledWrapper>
    </BaseLayout>
  );
}

Metamask.propTypes = {
  accountUpdateMetamaskAccount: PropTypes.func.isRequired,
  accountConnectMetamask: PropTypes.func.isRequired,
  accountClearIntervals: PropTypes.func.isRequired,
  accountClearState: PropTypes.func.isRequired,
  accountChangeNativeCurrency: PropTypes.func.isRequired,
  accountCheckNetworkIsConnected: PropTypes.func.isRequired,
  web3Available: PropTypes.bool.isRequired,
  web3Network: PropTypes.string.isRequired,
  fetching: PropTypes.bool.isRequired,
  error: PropTypes.bool.isRequired,
  match: PropTypes.object.isRequired,
  accountAddress: PropTypes.string
};

Metamask.defaultProps = {
  accountAddress: null
};

const reduxProps = ({ account }) => ({
  web3Available: account.web3Available,
  web3Network: account.web3Network,
  accountAddress: account.accountAddress,
  fetching: account.fetching,
  error: account.error
});

export default connect(reduxProps, {
  accountUpdateMetamaskAccount,
  accountCheckNetworkIsConnected,
  accountConnectMetamask,
  accountClearIntervals,
  accountClearState,
  accountChangeNativeCurrency
})(Metamask);
