import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import BaseLayout from '../layouts/base';
import Account from '../views/Account';
import Card from '../components/Card';
import lang from '../languages';
import { walletConnectInit } from '../reducers/_walletconnect';
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

class Wallet extends Component {
  componentDidMount() {
    this.props.walletConnectInit();
  }

  render = () => {
    const { fetching, accountAddress, match } = this.props;
    return (
      <BaseLayout>
        <StyledWrapper>
          {fetching || accountAddress ? (
            <Account fetchingWallet={fetching} match={match} />
          ) : (
            <Card minHeight={200} fetching={fetching}>
              <StyledMessage>
                {lang.t('message.walletconnect_not_unlocked')}
              </StyledMessage>
            </Card>
          )}
        </StyledWrapper>
      </BaseLayout>
    );
  };
}

Wallet.propTypes = {
  accountAddress: PropTypes.string,
  fetching: PropTypes.bool.isRequired,
  match: PropTypes.object.isRequired,
};

Wallet.defaultProps = {
  accountAddress: null,
};

const reduxProps = ({ walletconnect }) => ({
  fetching: walletconnect.fetching,
  accountAddress: walletconnect.accountAddress,
});

export default connect(
  reduxProps,
  { walletConnectInit },
)(Wallet);
