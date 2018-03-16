import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import metamaskOriginal from '../assets/metamask-original.png';
import ledgerLogo from '../assets/ledger-logo.png';
import trezorLogo from '../assets/trezor-logo.png';
import metamaskWhite from '../assets/metamask-white.png';
import Card from '../components/Card';
import Column from '../components/Column';
import SubscribeForm from '../components/SubscribeForm';
import Button from '../components/Button';
import { accountsConnectMetamask, accountsUpdateSelectedWallet } from '../reducers/_accounts';
import { responsive } from '../styles';

const StyledCardContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  @media screen and (${responsive.sm.max}) {
    flex-direction: column;
    justify-content: ;
  }
`;

const StyledMetamaskConnect = styled(Column)`
  padding: 15px;
  & > * {
    margin: 24px;
  }
`;

const StyledHardwareWallets = styled(Column)`
  padding: 15px;
  & > * {
    margin: 10px;
  }
  & > div:last-child {
    margin-top: 32px;
  }
`;

const StyledImageWrapper = styled.div`
  width: 100%;
  & img {
    width: 100%;
  }
`;

const StyledFox = styled(StyledImageWrapper)`
  width: 200px;
  height: 185px;
`;

const StyledLedgerWallet = styled(StyledImageWrapper)`
  width: 300px;
  height: 75px;
`;

const StyledTrezorWallet = styled(StyledImageWrapper)`
  width: 275px;
  height: 82.5px;
`;

class SelectWallet extends Component {
  onConnectMetamask = () => {
    this.props.accountsConnectMetamask();
    this.props.accountsUpdateSelectedWallet('METAMASK');
  };
  render = () => (
    <Card>
      <StyledCardContainer>
        <StyledHardwareWallets>
          <StyledLedgerWallet>
            <img src={ledgerLogo} alt="Ledger Wallet" />
          </StyledLedgerWallet>
          <StyledTrezorWallet>
            <img src={trezorLogo} alt="Trezor Wallet" />
          </StyledTrezorWallet>
          <SubscribeForm />
        </StyledHardwareWallets>

        <StyledMetamaskConnect>
          <StyledFox>
            <img src={metamaskOriginal} alt="metamask" />
          </StyledFox>
          <Button left color="orange" icon={metamaskWhite} onClick={this.onConnectMetamask}>
            Connect to Metamask
          </Button>
        </StyledMetamaskConnect>
      </StyledCardContainer>
    </Card>
  );
}

SelectWallet.propTypes = {
  accountsConnectMetamask: PropTypes.func.isRequired
};

export default connect(null, {
  accountsConnectMetamask,
  accountsUpdateSelectedWallet
})(SelectWallet);
