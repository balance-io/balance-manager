import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import BaseLayout from '../layouts/base';
import Account from '../views/Account';
import Card from '../components/Card';
import { lang } from 'balance-common';
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
    if (!this.props.accountAddress) {
      console.log('wallet page does not have account address');
      this.props.history.push('/');
    }
  }

  render = () => (
    <BaseLayout>
      <StyledWrapper>
        {this.props.fetching || this.props.accountAddress ? (
          <Account match={this.props.match} />
        ) : (
          <Card minHeight={200} fetching={this.props.fetching}>
            <StyledMessage>
              {lang.t('message.walletconnect_not_unlocked')}
            </StyledMessage>
          </Card>
        )}
      </StyledWrapper>
    </BaseLayout>
  );
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
  null,
)(Wallet);
