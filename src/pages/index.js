import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { accountInitializeState, lang } from 'balance-common';
import Link from '../components/Link';
import BaseLayout from '../layouts/base';
import Card from '../components/Card';
import Button from '../components/Button';
import metamaskLogoImage from '../assets/metamask-logo.png';
import ledgerLogoImage from '../assets/ledger-logo.svg';
import walletConnectLogoImage from '../assets/walletconnect-logo-and-type.svg';
import trezorLogoImage from '../assets/trezor-logo.svg';
import trustWalletLogoImage from '../assets/trustwallet-logo.svg';
import braveLogoImage from '../assets/brave-logo.svg';
import braveLogoText from '../assets/brave-text.svg';
import chromeLogoImage from '../assets/chrome-logo.svg';
import chromeLogoText from '../assets/chrome-text.svg';
import firefoxLogoImage from '../assets/firefox-logo.svg';
import firefoxLogoText from '../assets/firefox-text.svg';
import operaLogoImage from '../assets/opera-logo.svg';
import operaLogoText from '../assets/opera-text.svg';
import { walletConnectHasValidSession } from '../reducers/_walletconnect';
import { modalOpen } from '../reducers/_modal';
import { colors, fonts, responsive } from '../styles';

import { isMobile, isValidBrowser } from '../helpers/device';

const StyledCard = styled(Card)`
  background: #f5f6fa;
  display: flex;
  min-height: 102px;
  overflow: visible;
  width: 100%;

  &:not(:last-child) {
    margin-bottom: 18px;
  }
`;

const ContentContainer = styled.div`
  width: 100%;
`;

const CardContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding-left: 28px;
  padding-right: 28px;
  width: 100%;
`;

const CardContainerMobile = CardContainer.extend`
  align-items: flex-start;
  padding-left: 14px;
  padding-right: 14px;
  flex-direction: column;
`;

const ConnectButton = styled(Button)`
  border-radius: 8px;
  display: inline-block;
  font-size: ${fonts.size.medium};
  height: 44px;
  padding: 0 15px 2px 15px;
  white-space: nowrap;
  width: ${({ width }) => (width ? width : null)};
`;

const LogoSection = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  margin-right: 20px;
`;

const LogoSectionMobile = styled.div`
  align-items: center;
  display: flex;
  margin-bottom: 12px;
`;

const LogoText = styled.p`
  color: #666;
  flex: 1;
  font-size: ${fonts.size.smedium};
  font-weight: ${fonts.weight.medium};
  line-height: 20px;
  margin-left: 20px;
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
  background-size: cover;
  height: 28px;
  width: 100px;

  @media screen and (${responsive.xxs.max}) {
    width: 22px;
  }
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

const ReassuranceCard = StyledCard.extend`
  background: #34363d;
  border: 1px solid #42444b;
  display: flex;
  margin-bottom: 0;
  padding: 26px 0;
`;

const ReassuranceContainer = CardContainer.extend`
  align-items: flex-start;

  @media screen and (${responsive.sm.max}) {
    flex-direction: column;
  }
`;

const ReassuranceSection = styled.div`
  max-width: 424px;
  width: 100%;

  &:not(:last-child) {
    padding-right: 18px;
  }

  @media screen and (${responsive.sm.max}) {
    max-width: 100%;

    &:not(:last-child) {
      padding: 0 0 28px;
    }
  }
`;

const ReassuranceTitle = styled.p`
  color: #f5f6fa;
  font-size: ${fonts.size.large};
  font-weight: ${fonts.weight.medium};
  line-height: 1;
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};
  margin-bottom: 12px;
`;

const ReassuranceExplanation = ReassuranceTitle.extend`
  color: #f5f6fa;
  font-size: ${fonts.size.smedium};
  font-weight: ${fonts.weight.normal};
  line-height: 22px;
  opacity: 0.7;
  text-align: ${({ textAlign }) => (textAlign ? textAlign : null)};
`;

const ReassuranceLink = LedgerAffiliateLink.extend`
  font-size: ${fonts.size.medium};
`;

const TrezorLogo = styled.div`
  background-image: url(${trezorLogoImage});
  background-repeat: no-repeat;
  background-size: cover;
  height: 31px;
  width: 109px;

  @media screen and (${responsive.xxs.max}) {
    width: 22px;
  }
`;

const TrustWalletLink = styled(Link)`
  margin: 0 auto;
  max-width: 315px;
  width: 100%;
`;

const TrustWalletLogo = styled.img`
  border-radius: 8px;
  width: 52px;
`;

const WalletConnectLogo = styled.div`
  background-image: url(${walletConnectLogoImage});
  background-repeat: no-repeat;
  background-size: cover;
  height: 32px;
  width: 210px;

  @media screen and (${responsive.xs.max}) {
    width: 52px;
  }
`;

const WalletConnectButton = ConnectButton.extend`
  margin: 0 auto;
  max-width: 315px;
`;

const BrowserLogosContainer = styled.div`
  display: flex;
  align-items: flex-start;
`;

const BrowserLogo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  &:not(:last-child) {
    padding-right: 24px;
  }
`;

const BraveLogoImage = styled.img`
  margin-bottom: 9px;
  height: 48px;
`;

const BraveLogoText = styled.img`
  width: 52px;
`;

const ChromeLogoImage = styled.img`
  margin-bottom: 9px;
  width: 48px;
`;

const ChromeLogoText = styled.img`
  width: 60px;
`;

const FirefoxLogoImage = ChromeLogoImage.extend`
  width: 46px;
`;

const FirefoxLogoText = styled.img`
  width: 54px;
`;

const OperaLogoImage = ChromeLogoImage.extend`
  margin-bottom: 8px;
`;

const OperaLogoText = BraveLogoText.extend``;

class Home extends Component {
  componentDidMount = () => {
    this.props.accountInitializeState();
  };

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
      {isMobile() ? (
        <ContentContainer>
          <StyledCard padding={`14px 0`}>
            <CardContainerMobile>
              <LogoSectionMobile>
                <TrustWalletLogo
                  src={trustWalletLogoImage}
                  alt="Trust Wallet Logo"
                />
                <LogoText isAlwaysVisible>
                  {lang.t('homepage.connect_trustwallet.description_part_one')}
                  <LedgerAffiliateLink
                    href="https://trustwalletapp.com/"
                    target="_blank"
                    title={lang.t(
                      'homepage.connect_trustwallet.link_title_wallet',
                    )}
                  >
                    {lang.t('homepage.connect_trustwallet.link_text_wallet')}
                  </LedgerAffiliateLink>
                  {lang.t('homepage.connect_trustwallet.description_part_two')}
                  <LedgerAffiliateLink
                    href="https://trustwalletapp.com/features/trust-browser"
                    target="_blank"
                    title={lang.t(
                      'homepage.connect_trustwallet.link_title_browser',
                    )}
                  >
                    {lang.t('homepage.connect_trustwallet.link_text_browser')}
                  </LedgerAffiliateLink>
                  {lang.t(
                    'homepage.connect_trustwallet.description_part_three',
                  )}
                </LogoText>
              </LogoSectionMobile>
              <TrustWalletLink to="/metamask">
                <ConnectButton
                  color="trustwallet"
                  hoverColor="trustwalletHover"
                  activeColor="trustwalletActive"
                  width={`100%`}
                >
                  {lang.t('homepage.connect_trustwallet.button')}
                </ConnectButton>
              </TrustWalletLink>
            </CardContainerMobile>
          </StyledCard>
          <StyledCard padding={`14px 0`}>
            <CardContainerMobile>
              <LogoSectionMobile>
                <WalletConnectLogo />
                <LogoText isAlwaysVisible>
                  {lang.t('homepage.connect_walletconnect.description_mobile')}
                  <LedgerAffiliateLink
                    href="https://walletconnect.org/"
                    target="_blank"
                    title={lang.t(
                      'homepage.connect_walletconnect.link_title_mobile',
                    )}
                  >
                    {lang.t('homepage.connect_walletconnect.link_text_mobile')}
                  </LedgerAffiliateLink>
                  .
                </LogoText>
              </LogoSectionMobile>
              <WalletConnectButton
                color="walletconnect"
                hoverColor="walletconnectHover"
                activeColor="walletconnectActive"
                onClick={this.onWalletConnectInit}
                width={`100%`}
              >
                {lang.t('homepage.connect_walletconnect.button_mobile')}
              </WalletConnectButton>
            </CardContainerMobile>
          </StyledCard>
          <CardContainerMobile>
            <ReassuranceExplanation textAlign="left">
              {lang.t('homepage.reassurance.text_mobile')}
            </ReassuranceExplanation>
          </CardContainerMobile>
        </ContentContainer>
      ) : (
        <ContentContainer>
          <MetamaskCard minHeight={102}>
            <CardContainer>
              <MetamaskLogo />
              <LogoSection>
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
              </LogoSection>
              {isValidBrowser() ? (
                <Link to="/metamask">
                  <MetamaskButton left color="orange">
                    {lang.t('homepage.connect_metamask.button')}
                  </MetamaskButton>
                </Link>
              ) : (
                <BrowserLogosContainer>
                  <BrowserLogo>
                    <BraveLogoImage src={braveLogoImage} alt="Brave Logo" />
                    <BraveLogoText src={braveLogoText} alt="Brave Text" />
                  </BrowserLogo>
                  <BrowserLogo>
                    <FirefoxLogoImage
                      src={firefoxLogoImage}
                      alt="Firefox Logo"
                    />
                    <FirefoxLogoText src={firefoxLogoText} alt="Firefox Text" />
                  </BrowserLogo>
                  <BrowserLogo>
                    <OperaLogoImage src={operaLogoImage} alt="Opera Logo" />
                    <OperaLogoText src={operaLogoText} alt="Opera Text" />
                  </BrowserLogo>
                  <BrowserLogo>
                    <ChromeLogoImage src={chromeLogoImage} alt="Chrome Logo" />
                    <ChromeLogoText src={chromeLogoText} alt="Chrome Text" />
                  </BrowserLogo>
                </BrowserLogosContainer>
              )}
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
              {isValidBrowser() ? (
                <Link to="/ledger">
                  <LedgerButton left color="ledger">
                    {lang.t('homepage.connect_ledger.button')}
                  </LedgerButton>
                </Link>
              ) : (
                <BrowserLogo>
                  <ChromeLogoImage src={chromeLogoImage} alt="Chrome Logo" />
                  <ChromeLogoText src={chromeLogoText} alt="Chrome Text" />
                </BrowserLogo>
              )}
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
              {isValidBrowser() ? (
                <Link to="/trezor">
                  <LedgerButton left color="ledger">
                    {lang.t('homepage.connect_trezor.button')}
                  </LedgerButton>
                </Link>
              ) : (
                <BrowserLogosContainer>
                  <BrowserLogo>
                    <FirefoxLogoImage
                      src={firefoxLogoImage}
                      alt="Firefox Logo"
                    />
                    <FirefoxLogoText src={firefoxLogoText} alt="Firefox Text" />
                  </BrowserLogo>
                  <BrowserLogo>
                    <ChromeLogoImage src={chromeLogoImage} alt="Chrome Logo" />
                    <ChromeLogoText src={chromeLogoText} alt="Chrome Text" />
                  </BrowserLogo>
                </BrowserLogosContainer>
              )}
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
              <WalletConnectButton
                left
                color="walletconnect"
                hoverColor="walletconnectHover"
                activeColor="walletconnectActive"
                onClick={this.onWalletConnectInit}
              >
                {lang.t('homepage.connect_walletconnect.button')}
              </WalletConnectButton>
            </CardContainer>
          </StyledCard>

          {isValidBrowser() ? (
            <ReassuranceCard>
              <ReassuranceContainer>
                <ReassuranceSection>
                  <ReassuranceTitle>
                    {lang.t('homepage.reassurance.work_title')}
                  </ReassuranceTitle>
                  <ReassuranceExplanation>
                    {lang.t('homepage.reassurance.work')}
                  </ReassuranceExplanation>
                  <ReassuranceLink
                    href="https://www.youtube.com/watch?v=dMYa0-t4MAI"
                    target="_blank"
                    title={lang.t('homepage.reassurance.access_link')}
                  >
                    {lang.t('homepage.reassurance.access_link')}
                  </ReassuranceLink>
                </ReassuranceSection>
                <ReassuranceSection>
                  <ReassuranceTitle>
                    {lang.t('homepage.reassurance.security_title')}
                  </ReassuranceTitle>
                  <ReassuranceExplanation>
                    {lang.t('homepage.reassurance.security')}
                  </ReassuranceExplanation>
                  <ReassuranceLink
                    href="https://github.com/balance-io"
                    target="_blank"
                    title={lang.t('homepage.reassurance.access_link')}
                  >
                    {lang.t('homepage.reassurance.source')}
                  </ReassuranceLink>
                </ReassuranceSection>
              </ReassuranceContainer>
            </ReassuranceCard>
          ) : null}
        </ContentContainer>
      )}
    </BaseLayout>
  );
}

Home.propTypes = {
  accountInitializeState: PropTypes.func.isRequired,
  modalOpen: PropTypes.func.isRequired,
  walletConnectHasValidSession: PropTypes.func.isRequired,
};

export default connect(
  null,
  {
    accountInitializeState,
    modalOpen,
    walletConnectHasValidSession,
  },
)(Home);
