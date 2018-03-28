import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import lang from '../languages';
import BaseLayout from '../layouts/base';
import AccountView from '../components/AccountView';
import Card from '../components/Card';
import {
  metamaskUpdateMetamaskAccount,
  metamaskConnectMetamask,
  metamaskClearIntervals
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
    this.props.metamaskConnectMetamask();
  }
  renderMessage() {
    if (!this.props.web3Available) return lang.t('message.web3_not_available');
    if (!this.props.accountAddress) return lang.t('message.web3_not_unlocked');
    if (!this.props.web3Network) return lang.t('message.web3_unknown_network');
  }
  componentWillUnmount() {
    this.props.metamaskClearIntervals();
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
  metamaskUpdateMetamaskAccount: PropTypes.func.isRequired,
  metamaskConnectMetamask: PropTypes.func.isRequired,
  metamaskClearIntervals: PropTypes.func.isRequired,
  web3Available: PropTypes.bool.isRequired,
  web3Network: PropTypes.string.isRequired,
  fetching: PropTypes.bool.isRequired,
  match: PropTypes.object.isRequired,
  accountAddress: PropTypes.string
};

Metamask.defaultProps = {
  accountAddress: null
};

const reduxProps = ({ metamask }) => ({
  web3Available: metamask.web3Available,
  web3Network: metamask.web3Network,
  accountAddress: metamask.accountAddress,
  fetching: metamask.fetching
});

export default connect(reduxProps, {
  metamaskUpdateMetamaskAccount,
  metamaskConnectMetamask,
  metamaskClearIntervals
})(Metamask);
