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
import { getLocal } from '../handlers/localstorage';
import { modalOpen } from '../reducers/_modal';
import { colors, fonts, responsive } from '../styles';

const StyledCard = styled(Card)`
  background: #f5f6fa;
  display: block;
  margin-bottom: 18px;
  min-height: 102px;
  overflow: visible;
  width: 100%;
`;

const CardContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding-left: 28px;
  padding-right: 28px;
  width: 100%;

  @media screen and (${responsive.sm.max}) {
    align-items: flex-start;
    flex-direction: column;
    padding-bottom: 28px;
    padding-top: 28px;
  }
`;

const ConnectButton = styled(Button)`
  border-radius: 8px;
  font-size: ${fonts.size.medium};
  height: 44px;
  padding: 0 15px 2px 15px;
  position: absolute;
  right: 29px;
  top: 29px;
`;

const LogoSection = styled.div`
  flex: none;
  position: relative;
`;

const LogoText = styled.p`
  color: #a1a2a9;
  font-size: ${fonts.size.smedium};
  font-weight: ${fonts.weight.medium};
  margin-top: 6px;
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};
  @media screen and (max-width: 736px) {
    display: ${({ isAlwaysVisible }) => (isAlwaysVisible ? 'block' : 'none')};
  }
`;

const LedgerAffiliateLink = styled.a`
  color: rgb(${colors.blue});

  &:hover {
    color: rgb(${colors.blueHover});
  }
  &:active {
    color: rgb(${colors.blueActive});
  }
`;

const LedgerButton = ConnectButton.extend`
  &:hover {
    background: #454852;
  }
  &:active {
    background: #2b2d33;
  }
`;

const LedgerLogo = styled.div`
  background-image: url(${ledgerLogoImage});
  background-repeat: no-repeat;
  background-size: 100%;
  height: 28px;
  width: 100px;
`;

const MetamaskButton = ConnectButton.extend`
  &:hover {
    background: #ff932e;
  }
  &:active {
    background: #f07f16;
  }
`;

// Necessary to fix weird border radius bug with the background image
const MetamaskCard = StyledCard.extend`
  border-radius: 14px 10px 10px 14px;
`;

const MetamaskLogo = styled.div`
  background-size: cover;
  background-image: url(${metamaskLogoImage});
  background-repeat: no-repeat;
  border-radius: 10px 0 0 10px;
  height: 102px;
  left: 0;
  position: absolute;
  top: 0;
  width: 173px;
`;

const MetamaskLogoText = styled(LogoText)`
  margin: 0 20px 0 196px;
`;

const StyledSubscribeForm = styled(SubscribeForm)`
  @media screen and (${responsive.sm.max}) {
    margin-top: 28px;
  }
`;

const TrezorLogo = styled.div`
  background-image: url(${trezorLogoImage});
  background-repeat: no-repeat;
  background-size: 100%;
  height: 31px;
  width: 109px;
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
      <MetamaskCard minHeight={102}>
        <CardContainer>
          <MetamaskLogo />
          <MetamaskLogoText>
            {lang.t('homepage.connect_metamask')}
          </MetamaskLogoText>
          <Link to="/metamask">
            <MetamaskButton left color="orange">
              {lang.t('button.connect_metamask')}
            </MetamaskButton>
          </Link>
        </CardContainer>
      </MetamaskCard>

      <StyledCard minHeight={102}>
        <CardContainer>
          <LogoSection>
            <LedgerLogo />
            <LogoText>
              {lang.t('homepage.connect_ledger')}
              <LedgerAffiliateLink
                href="https://www.ledgerwallet.com/r/7931"
                target="_blank"
                title="Buy a Ledger hardware wallet"
              >
                {lang.t('homepage.connect_ledger_link')}
              </LedgerAffiliateLink>
              .
            </LogoText>
          </LogoSection>
          <Link to="/ledger">
            <LedgerButton left color="ledger">
              {lang.t('button.connect_ledger')}
            </LedgerButton>
          </Link>
        </CardContainer>
      </StyledCard>

      <StyledCard minHeight={102}>
        <CardContainer>
          <LogoSection>
            <TrezorLogo />
            <LogoText disabled isAlwaysVisible>
              {lang.t('homepage.coming_soon')}
            </LogoText>
          </LogoSection>
          <StyledSubscribeForm />
        </CardContainer>
      </StyledCard>

      {/*
      <StyledCard>
        <CardContainer>
          <StyledWalletConnect>
            <StyledWalletConnectLogo />
            <p>{lang.t('homepage.connect_walletconnect')}</p>
            <StyledWalletConnectButton
              left
              color="walletconnect"
              onClick={this.onWalletConnectInit}
            >
              {lang.t('button.connect_walletconnect')}
            </StyledWalletConnectButton>
          </StyledWalletConnect>
        </CardContainer>
      </StyledCard>
    */}
    </BaseLayout>
  );
}

Home.propTypes = {
  modalOpen: PropTypes.func.isRequired,
  accountUpdateAccountAddress: PropTypes.func.isRequired,
};

export default connect(null, {
  modalOpen,
  accountUpdateAccountAddress,
})(Home);
