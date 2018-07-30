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
import walletConnectLogoImage from '../assets/walletconnect-logo-and-type.svg';
import trezorLogoImage from '../assets/trezor-logo.svg';
import { walletConnectHasValidSession } from '../reducers/_walletconnect';
import { getWalletConnectAccount } from '../handlers/localstorage';
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

const ReassuranceCard = StyledCard.extend`
  background: #34363d;
  padding: 15px 0px;
  display: flex;
  background-border: 1px solid #42444b;
`;

const ReassuranceSection = styled.div`
  flex: 1;
  position: relative;
  padding: 10px;
`;

const ReassuranceTitle = styled.p`
  color: #f5f6fa;
  font-size: ${fonts.size.large};
  font-weight: ${fonts.weight.medium};
  margin-top: 6px;
  // align-items: flex-start;
  // flex-direction: column;
  //Fix with Mike
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};
  @media screen and (max-width: 50%) {
    display: ${({ isAlwaysVisible }) => (isAlwaysVisible ? 'block' : 'none')};
  }
`;

const ReassuranceExplanation = ReassuranceTitle.extend`
  color: #f5f6fa;
  opacity: 0.7;
  font-size: ${fonts.size.medium};
  font-weight: ${fonts.weight.normal};
  // flex-direction: column;
  // align-items: flex-start;
  // Fix with Mike
  @media screen and (max-width: 50%) {
    display: ${({ isAlwaysVisible }) => (isAlwaysVisible ? 'block' : 'none')};
  }
`;

const ReassuranceLinks = ReassuranceTitle.extend`
  color: #fff;
  margin-top: 10px;
  font-size: ${fonts.size.medium};
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
  color: #666;
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
  margin: 0 20px 0 176px;
`;

const TrezorLogo = styled.div`
  background-image: url(${trezorLogoImage});
  background-repeat: no-repeat;
  background-size: 100%;
  height: 31px;
  width: 109px;
`;

const WalletConnectLogo = styled.div`
  background-image: url(${walletConnectLogoImage});
  background-size: 100%;
  background-repeat: no-repeat;
  margin: 22px 0 8px 0;
  height: 32px;
  width: 200px;
`;

const StyledWalletConnectButton = ConnectButton.extend`
  &:hover {
    background: #454852;
  }
  &:active {
    background: #2b2d33;
  }
`;

class Home extends Component {
  onWalletConnectInit = () => {
    this.props
      .walletConnectHasValidSession()
      .then(isValid => {
        if (isValid) {
          this.props.history.push('/wallet');
        } else {
          this.props.modalOpen('WALLET_CONNECT', null);
        }
      })
      .catch(error => {
        console.log('error checking valid session', error);
        this.props.modalOpen('WALLET_CONNECT', null);
      });
  };
  render = () => (
    <BaseLayout>
      <MetamaskCard minHeight={102}>
        <CardContainer>
          <MetamaskLogo />
          <MetamaskLogoText>
            {lang.t('homepage.connect_metamask.description')}
            <LedgerAffiliateLink
              href="https://metamask.io"
              target="_blank"
              title={lang.t('homepage.connect_metamask.link_title')}
            >
              {lang.t('homepage.connect_metamask.link_text')}
            </LedgerAffiliateLink>
            .
          </MetamaskLogoText>
          <Link to="/metamask">
            <MetamaskButton left color="orange">
              {lang.t('homepage.connect_metamask.button')}
            </MetamaskButton>
          </Link>
        </CardContainer>
      </MetamaskCard>

      <StyledCard minHeight={102}>
        <CardContainer>
          <LogoSection>
            <LedgerLogo />
            <LogoText>
              {lang.t('homepage.connect_ledger.description')}
              <LedgerAffiliateLink
                href="https://www.ledgerwallet.com/r/7931"
                target="_blank"
                title={lang.t('homepage.connect_ledger.link_title')}
              >
                {lang.t('homepage.connect_ledger.link_text')}
              </LedgerAffiliateLink>
              .
            </LogoText>
          </LogoSection>
          <Link to="/ledger">
            <LedgerButton left color="ledger">
              {lang.t('homepage.connect_ledger.button')}
            </LedgerButton>
          </Link>
        </CardContainer>
      </StyledCard>

      <StyledCard minHeight={102}>
        <CardContainer>
          <LogoSection>
            <TrezorLogo />
            <LogoText>
              {lang.t('homepage.connect_trezor.description')}
              <LedgerAffiliateLink
                href="https://shop.trezor.io/?a=balance.io"
                target="_blank"
                title={lang.t('homepage.connect_trezor.link_title')}
              >
                {lang.t('homepage.connect_trezor.link_text')}
              </LedgerAffiliateLink>
              .
            </LogoText>
          </LogoSection>
          <Link to="/trezor">
            <LedgerButton left color="ledger">
              {lang.t('homepage.connect_trezor.button')}
            </LedgerButton>
          </Link>
        </CardContainer>
      </StyledCard>

      <StyledCard>
        <CardContainer>
          <LogoSection>
            <WalletConnectLogo />
            <LogoText>
              {lang.t('homepage.connect_walletconnect.description')}
              <LedgerAffiliateLink
                href="https://walletconnect.org/"
                target="_blank"
                title={lang.t('homepage.connect_walletconnect.link_title')}
              >
                {lang.t('homepage.connect_walletconnect.link_text')}
              </LedgerAffiliateLink>
              .
            </LogoText>
          </LogoSection>
          <StyledWalletConnectButton
            left
            color="walletconnect"
            onClick={this.onWalletConnectInit}
          >
            {lang.t('homepage.connect_walletconnect.button')}
          </StyledWalletConnectButton>
        </CardContainer>
      </StyledCard>

      <ReassuranceCard>
        <CardContainer>
          <ReassuranceSection>
            <ReassuranceTitle>
              {lang.t('homepage.reassurance.work_title')}
            </ReassuranceTitle>
            <ReassuranceExplanation>
              {lang.t('homepage.reassurance.work')}
            </ReassuranceExplanation>
            <ReassuranceLinks>
              <LedgerAffiliateLink
                href="https://www.youtube.com/watch?v=dMYa0-t4MAI"
                target="_blank"
                title={lang.t('homepage.reassurance.access_link')}
              >
                {lang.t('homepage.reassurance.access_link')}
              </LedgerAffiliateLink>
            </ReassuranceLinks>
          </ReassuranceSection>
          <ReassuranceSection>
            <ReassuranceTitle>
              {lang.t('homepage.reassurance.security_title')}
            </ReassuranceTitle>
            <ReassuranceExplanation>
              {lang.t('homepage.reassurance.security')}
            </ReassuranceExplanation>
            <ReassuranceLinks>
              <LedgerAffiliateLink
                href="https://github.com/balance-io"
                target="_blank"
                title={lang.t('homepage.reassurance.access_link')}
              >
                {lang.t('homepage.reassurance.source')}
              </LedgerAffiliateLink>
            </ReassuranceLinks>
          </ReassuranceSection>
        </CardContainer>
      </ReassuranceCard>
    </BaseLayout>
  );
}

Home.propTypes = {
  modalOpen: PropTypes.func.isRequired,
  walletConnectHasValidSession: PropTypes.func.isRequired,
};

export default connect(
  null,
  {
    modalOpen,
    walletConnectHasValidSession,
  },
)(Home);
