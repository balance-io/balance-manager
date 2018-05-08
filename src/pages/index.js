import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import lang from '../languages';
import Link from '../components/Link';
import BaseLayout from '../layouts/base';
import Card from '../components/Card';
import SubscribeForm from '../components/SubscribeForm';
import Button from '../components/Button';
import metamaskLogoImage from '../assets/metamask-logo.png';
import ledgerLogoImage from '../assets/ledger-logo.svg';
// import walletConnectLogoImage from '../assets/walletconnect-blue.svg';
import trezorLogoImage from '../assets/trezor-logo.svg';
import { accountUpdateAccountAddress } from '../reducers/_account';
import { getLocal } from '../handlers/utilities';
import { modalOpen } from '../reducers/_modal';
import { fonts, responsive } from '../styles';

const StyledCard = styled(Card)`
  width: 100%;
  height: 102px;
  margin-bottom: 18px;
  background: #f5f6fa;
  display: block;
  overflow: visible;
`;

const StyledCardMetaMask = StyledCard.extend`
  border-radius: 14px 10px 10px 14px;
`;

const StyledCardTrezor = StyledCard.extend`
  @media screen and (max-width: 620px) {
    & div:nth-child(3) {
      display: none;
    }
  }
`;

const StyledCardContainer = styled.div`
  width: 100%;
  align-items: center;
  justify-content: space-between;

  & p {
    font-size: ${fonts.size.smedium};
    font-weight: ${fonts.weight.medium};
    color: #a1a2a9;
  }

  @media screen and (${responsive.sm.max}) {
    flex-direction: column;
    justify-content: ;
  }
`;

const StyledMetamaskConnect = styled.div`
  & p {
    margin: 43px 20px 0 196px;
  }

  @media screen and (max-width: 736px) {
    & p {
      display: none;
    }
  }
`;

// const StyledWalletConnect = styled.div`
//   & p {
//     margin: 43px 20px 0 196px;
//   }
//
//   @media screen and (max-width: 736px) {
//     & p {
//       display: none;
//     }
//   }
// `;

const StyledMetamaskLogo = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 173px;
  height: 102px;
  background: url(${metamaskLogoImage});
  background-size: 100%;
  border-radius: 10px 0 0 10px;
`;

const StyledHardwareWallets = styled.div`
  & p {
    margin: 60px 20px 0 28px;
    color: #a1a2a9;
  }

  @media screen and (${responsive.sm.max}) {
    & p {
      display: none;
    }
  }
`;

const StyledHardwareWalletsTrezor = StyledHardwareWallets.extend`
  & p {
    position: absolute;
    opacity: 0.7;
  }

  @media screen and (${responsive.sm.max}) {
    & p {
      display: block;
    }
  }
`;

const StyledLedgerLogo = styled.div`
  position: absolute;
  top: 27px;
  left: 28px;
  width: 100px;
  height: 28px;
  background: url(${ledgerLogoImage});
  background-size: 100%;

  @media screen and (${responsive.sm.max}) {
    top: 38px;
  }
`;

// const StyledWalletConnectLogo = styled.div`
//   position: absolute;
//   top: 0;
//   left: 0;
//   width: 173px;
//   height: 102px;
//   background: url(${walletConnectLogoImage});
//   background-size: contain;
//   background-repeat: no-repeat;
// `;

const StyledTrezorLogo = styled.div`
  position: absolute;
  top: 22px;
  left: 28px;
  width: 109px;
  height: 31px;
  background: url(${trezorLogoImage});
  background-size: 100%;
`;

const StyledConnectButton = styled(Button)`
  position: absolute;
  right: 29px;
  top: 29px;
  padding: 0 15px 2px 15px;
  height: 44px;
  border-radius: 8px;
  font-size: ${fonts.size.medium};
`;

const StyledMetamaskButton = StyledConnectButton.extend`
  &:hover {
    background: #ff932e;
  }
  &:active {
    background: #f07f16;
  }
`;

const StyledLedgerButton = StyledConnectButton.extend`
  &:hover {
    background: #454852;
  }
  &:active {
    background: #2b2d33;
  }
`;

// const StyledWalletConnectButton = StyledConnectButton.extend`
//   &:hover {
//     background: #454852;
//   }
//   &:active {
//     background: #2b2d33;
//   }
// `;

class Home extends Component {
  onWalletConnectInit = () => {
    const storedAddress = getLocal('walletconnect');
    if (storedAddress) {
      this.props.accountUpdateAccountAddress(storedAddress, 'WALLETCONNECT');
      this.props.history.push('/wallet');
    } else {
      this.props.modalOpen('WALLET_CONNECT_INIT', null);
    }
  };
  render = () => (
    <BaseLayout>
      <StyledCardMetaMask>
        <StyledCardContainer>
          <StyledMetamaskConnect>
            <StyledMetamaskLogo />
            <p>Connect to the MetaMask Chrome extension.</p>
            <Link to="/metamask">
              <StyledMetamaskButton left color="orange">
                {lang.t('button.connect_metamask')}
              </StyledMetamaskButton>
            </Link>
          </StyledMetamaskConnect>
        </StyledCardContainer>
      </StyledCardMetaMask>

      <StyledCard>
        <StyledCardContainer>
          <StyledHardwareWallets>
            <StyledLedgerLogo />
            <p>Connect and sign with your Ledger hardware wallet.</p>
            <Link to="/ledger">
              <StyledLedgerButton left color="ledger">
                {lang.t('button.connect_ledger')}
              </StyledLedgerButton>
            </Link>
          </StyledHardwareWallets>
        </StyledCardContainer>
      </StyledCard>

      <StyledCardTrezor>
        <StyledCardContainer>
          <StyledHardwareWalletsTrezor>
            <StyledTrezorLogo />
            <p>Coming soon.</p>
            <SubscribeForm />
          </StyledHardwareWalletsTrezor>
        </StyledCardContainer>
      </StyledCardTrezor>

      {/* <StyledCard>
        <StyledCardContainer>
          <StyledWalletConnect>
            <StyledWalletConnectLogo />
            <p>Connect and sign with your WalletConnect-enabled mobile wallet.</p>
            <StyledWalletConnectButton left color="walletconnect" onClick={this.onWalletConnectInit}>
              {lang.t('button.connect_walletconnect')}
            </StyledWalletConnectButton>
          </StyledWalletConnect>
        </StyledCardContainer>
      </StyledCard> */}
    </BaseLayout>
  );
}

Home.propTypes = {
  modalOpen: PropTypes.func.isRequired,
  accountUpdateAccountAddress: PropTypes.func.isRequired
};

export default connect(null, {
  modalOpen,
  accountUpdateAccountAddress
})(Home);
