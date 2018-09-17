import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { lang } from 'balance-common';
import HelpSvg from '../assets/help.svg';
import BaseLayout from '../layouts/base';
import Card from '../components/Card';
import Button from '../components/Button';
import Account from '../views/Account';
import { trezorConnectInit } from '../reducers/_trezor';
import { fonts, colors } from '../styles';

const FailedConnectionMessage = styled.div`
  align-items: center;
  color: rgb(${colors.grey});
  display: flex;
  font-weight: ${fonts.weight.medium};
  justify-content: center;
  margin: 20px 20px 30px 20px;
`;

const StyledCardContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
`;

const StyledWrapper = styled.div`
  width: 100%;
`;

const HelpFooter = styled.a`
  align-items: center;
  background-color: rgb(${colors.blue});
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 15px;
  width: 100%;

  &:hover {
    background-color: rgb(${colors.blueHover});
    & > img {
      opacity: 1;
    }
  }
  &:active {
    background-color: rgb(${colors.blueActive});
  }
`;

const HelpIcon = styled.img`
  color: rgb(${colors.white});
  height: ${fonts.size.smedium};
  margin-left: 7px;
  opacity: 0.75;
  width: ${fonts.size.smedium};
`;

class Trezor extends Component {
  componentDidMount() {
    this.connectTrezor();
  }
  connectTrezor = () => this.props.trezorConnectInit();
  render() {
    const { accounts, fetching, match } = this.props;

    return (
      <BaseLayout>
        <StyledWrapper>
          {fetching || accounts.length ? (
            <Account
              fetchingWallet={fetching}
              fetchingMessage={
                !accounts.length ? lang.t('message.please_connect_trezor') : ''
              }
              match={match}
            />
          ) : (
            <Card minHeight={200} fetching={fetching}>
              <StyledCardContainer>
                <FailedConnectionMessage>
                  {lang.t('message.failed_trezor_connection')}
                </FailedConnectionMessage>
                <Button color="grey" onClick={this.connectTrezor}>
                  {lang.t('button.try_again')}
                </Button>
              </StyledCardContainer>
            </Card>
          )}
          {(fetching || !accounts.length) && (
            <HelpFooter
              href="https://support.balance.io/manager/how-do-i-connect-my-trezor"
              target="_blank"
            >
              <div>Need help connecting your Trezor?</div>
              <HelpIcon src={HelpSvg} />
            </HelpFooter>
          )}
        </StyledWrapper>
      </BaseLayout>
    );
  }
}

Trezor.propTypes = {
  trezorConnectInit: PropTypes.func.isRequired,
  fetching: PropTypes.bool.isRequired,
  match: PropTypes.object.isRequired,
  accounts: PropTypes.array.isRequired,
};

const reduxProps = ({ account, trezor }) => ({
  accountType: account.accountType,
  accounts: trezor.accounts,
  fetching: trezor.fetching,
});

export default connect(
  reduxProps,
  {
    trezorConnectInit,
  },
)(Trezor);
