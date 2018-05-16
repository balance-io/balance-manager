import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import lang from '../languages';
import BaseLayout from '../layouts/base';
import Card from '../components/Card';
import Button from '../components/Button';
import Account from '../views/Account';
import { accountClearState } from '../reducers/_account';
import { ledgerConnectInit } from '../reducers/_ledger';
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
  margin: 20px;
`;

const StyledCardContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const StyledButton = styled(Button) `
  margin: 10px;
`;

class Ledger extends Component {
  componentDidMount() {
    this.connectLedger();
  }
  connectLedger = () => this.props.ledgerConnectInit();
  render() {
    return (
      <BaseLayout>
        <StyledWrapper>
          {this.props.fetching || this.props.accounts.length ? (
            <Account
              fetchingWallet={this.props.fetching}
              fetchingMessage={
                !this.props.accounts.length ? lang.t('message.please_connect_ledger') : ''
              }
              match={this.props.match}
            />
          ) : (
              <Card minHeight={200} fetching={this.props.fetching}>
                <StyledCardContainer>
                  <StyledMessage>{lang.t('message.failed_ledger_connection')}</StyledMessage>
                  <StyledButton
                    data-toggle="tooltip"
                    title={lang.t('button.try_again_tooltip')}
                    color="grey" onClick={this.connectLedger}
                  >
                    {lang.t('button.try_again')}
                  </StyledButton>
                </StyledCardContainer>
              </Card>
            )}
        </StyledWrapper>
      </BaseLayout>
    );
  }
}

Ledger.propTypes = {
  ledgerConnectInit: PropTypes.func.isRequired,
  fetching: PropTypes.bool.isRequired,
  match: PropTypes.object.isRequired,
  accounts: PropTypes.array.isRequired
};

const reduxProps = ({ account, ledger }) => ({
  accountType: account.accountType,
  accounts: ledger.accounts,
  fetching: ledger.fetching
});

export default connect(reduxProps, {
  accountClearState,
  ledgerConnectInit
})(Ledger);
