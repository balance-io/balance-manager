import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import lang from '../languages';
import BaseLayout from '../layouts/base';
import Account from '../views/Account';
import Card from '../components/Card';
import { elphConnectInit } from '../reducers/_elph';

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

class Elph extends Component {
  componentDidMount() {
    this.props.elphConnectInit();
  }
  renderMessage() {
    if (!this.props.web3Available) return lang.t('message.elph_not_available');
    if (!this.props.accountAddress) return lang.t('message.elph_not_unlocked');
    if (!this.props.network) return lang.t('message.web3_unknown_network');
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

Elph.propTypes = {
  elphConnectInit: PropTypes.func.isRequired,
  web3Available: PropTypes.bool.isRequired,
  network: PropTypes.string.isRequired,
  fetching: PropTypes.bool.isRequired,
  match: PropTypes.object.isRequired,
  accountAddress: PropTypes.string,
};

Elph.defaultProps = {
  accountAddress: null,
};

const reduxProps = ({ account, elph }) => ({
  web3Available: elph.web3Available,
  network: elph.network,
  accountAddress: elph.accountAddress,
  fetching: elph.fetching,
});

export default connect(
  reduxProps,
  {
    elphConnectInit,
  },
)(Elph);
