import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { lang, resources } from 'balance-common';
import Link from '../components/Link';
import Dropdown from '../components/Dropdown';
import Background from '../components/Background';
import TextButton from '../components/TextButton';
import Wrapper from '../components/Wrapper';
import Column from '../components/Column';
import Notification from '../components/Notification';
import Warning from '../components/Warning';
import { modalOpen } from '../reducers/_modal';
import Modals from '../modals';
import balanceManagerLogo from '../assets/balance-manager-logo.svg';
import ethereumNetworks from '../references/ethereum-networks.json';
import nativeCurrencies from '../references/native-currencies.json';
import { ledgerUpdateNetwork } from '../reducers/_ledger';
import { trezorUpdateNetwork } from '../reducers/_trezor';
import {
  accountChangeNativeCurrency,
  accountClearState,
  accountUpdateAccountAddress,
  accountChangeLanguage,
} from 'balance-common';
import { metamaskClearState } from '../reducers/_metamask';
import { ledgerClearState } from '../reducers/_ledger';
import { trezorClearState } from '../reducers/_trezor';
import { walletConnectClearState } from '../reducers/_walletconnect';
import { commonStorage } from 'balance-common';
import ReminderRibbon from '../components/ReminderRibbon';
import { colors, responsive } from '../styles';

const StyledLayout = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  text-align: center;
`;

const StyledContent = styled(Wrapper)`
  width: 100%;
  padding: 0 16px;
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  min-height: 72px;
  padding: 0 16px;
  width: 100%;

  @media screen and (max-width: ${({ isHomepage }) =>
      isHomepage ? '337px' : '505px'}) {
    padding: 16px 16px 0;
  }
`;

const StyledBranding = styled.div`
  align-items: center;
  display: flex;
`;

const StyledBalanceLogo = styled.div`
  background: url(${balanceManagerLogo}) no-repeat;
  height: 23px;
  margin-right: 8px;
  width: 198px;
`;

const StyledBeta = styled.div`
  background: rgba(${colors.white}, 0.5);
  border-radius: 4px;
  color: rgb(${colors.bodyBackground});
  font-size: 8px;
  font-weight: 500;
  letter-spacing: 0.4px;
  padding: 2px 3px;
`;

const StyledIndicators = styled.div`
  align-items: center;
  display: flex;

  & > div {
    margin-left: 2px;
  }

  @media screen and (max-width: ${({ isHomepage }) =>
      isHomepage ? '337px' : '505px'}) {
    margin: 0 auto;
    padding: 8px 0;
  }
`;

const StyledVerticalLine = styled.div`
  height: 17px;
  border-left: 2px solid rgba(${colors.lightGrey}, 0.1);
`;

const StyledFooter = styled.div`
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 8px 16px;
  display: flex;
`;

const StyledFooterLeft = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const StyledFooterRight = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const BaseLayout = ({
  accountAddress,
  accountChangeLanguage,
  accountChangeNativeCurrency,
  accountClearState,
  accountType,
  accountUpdateAccountAddress,
  children,
  language,
  ledgerAccounts,
  ledgerClearState,
  ledgerFetching,
  ledgerUpdateNetwork,
  metamaskClearState,
  metamaskFetching,
  modalOpen,
  nativeCurrency,
  network,
  online,
  trezorAccounts,
  trezorClearState,
  trezorUpdateNetwork,
  trezorFetching,
  walletConnectClearState,
  web3Available,
  ...props
}) => {
  const addresses = {};
  const isHomepage = window.location.pathname === '/';
  if (accountType === 'LEDGER') {
    ledgerAccounts.forEach(account => {
      addresses[account.address] = account;
    });
  }
  if (accountType === 'TREZOR') {
    trezorAccounts.forEach(account => {
      addresses[account.address] = account;
    });
  }
  const languages = {};
  Object.keys(resources).forEach(resource => {
    languages[resource] = {
      code: resource,
      description: resource.toUpperCase(),
    };
  });
  const showToolbar =
    !isHomepage &&
    (!metamaskFetching || !ledgerFetching || !trezorFetching) &&
    ((accountType === 'METAMASK' && web3Available) ||
      accountType !== 'METAMASK') &&
    accountAddress;
  const openSendModal = () => modalOpen('DONATION_MODAL');
  const disconnectAccount = () => {
    accountClearState();
    commonStorage.resetAccount(accountAddress);
    if (accountType === 'TREZOR') {
      trezorClearState();
    } else if (accountType === 'LEDGER') {
      ledgerClearState();
    } else if (accountType === 'WALLETCONNECT') {
      walletConnectClearState();
      commonStorage.resetWalletConnect();
    } else if (accountType === 'METAMASK') {
      metamaskClearState();
    }
  };
  return (
    <StyledLayout>
      <ReminderRibbon maxWidth={1000} />
      <Background />
      <Column maxWidth={1000}>
        <StyledHeader isHomepage={isHomepage}>
          <Link to="/">
            <StyledBranding>
              <StyledBalanceLogo alt="Balance" />
              <StyledBeta>{'BETA'}</StyledBeta>
            </StyledBranding>
          </Link>
          <StyledIndicators isHomepage={isHomepage}>
            {showToolbar &&
              accountType === 'LEDGER' &&
              !!Object.keys(addresses).length && (
                <Fragment>
                  <Dropdown
                    monospace
                    displayKey={`address`}
                    selected={accountAddress}
                    options={addresses}
                    onChange={address =>
                      accountUpdateAccountAddress(address, 'LEDGER')
                    }
                  />
                  <StyledVerticalLine />
                </Fragment>
              )}
            {showToolbar &&
              accountType === 'TREZOR' &&
              !!Object.keys(addresses).length && (
                <Fragment>
                  <Dropdown
                    monospace
                    displayKey={`address`}
                    selected={accountAddress}
                    options={addresses}
                    onChange={address =>
                      accountUpdateAccountAddress(address, 'TREZOR')
                    }
                  />
                  <StyledVerticalLine />
                </Fragment>
              )}
            {showToolbar && (
              <Fragment>
                <Dropdown
                  displayKey={`value`}
                  selected={network}
                  iconColor={online ? 'green' : 'red'}
                  options={ethereumNetworks}
                  onChange={
                    accountType === 'LEDGER'
                      ? ledgerUpdateNetwork
                      : accountType === 'TREZOR'
                        ? trezorUpdateNetwork
                        : null
                  }
                />
                <StyledVerticalLine />
                <Dropdown
                  displayKey={`currency`}
                  selected={nativeCurrency}
                  options={nativeCurrencies}
                  onChange={accountChangeNativeCurrency}
                />
                <StyledVerticalLine />
              </Fragment>
            )}
            <Dropdown
              displayKey={`description`}
              selected={language}
              options={languages}
              onChange={accountChangeLanguage}
            />
          </StyledIndicators>
        </StyledHeader>
        <StyledContent>{children}</StyledContent>
      </Column>
      <StyledFooter>
        <StyledFooterLeft>
          {window.location.pathname !== '/' && (
            <TextButton onClick={openSendModal}>
              {lang.t('button.donate')}
            </TextButton>
          )}
        </StyledFooterLeft>
        <StyledFooterRight>
          {window.location.pathname !== '/' && (
            <TextButton onClick={disconnectAccount}>
              <Link to="/">{lang.t('button.disconnect_account')}</Link>
            </TextButton>
          )}
        </StyledFooterRight>
      </StyledFooter>
      <Modals />
      <Notification />
      <Warning />
    </StyledLayout>
  );
};

BaseLayout.propTypes = {
  accountChangeNativeCurrency: PropTypes.func.isRequired,
  accountClearState: PropTypes.func.isRequired,
  accountUpdateAccountAddress: PropTypes.func.isRequired,
  accountChangeLanguage: PropTypes.func.isRequired,
  accountType: PropTypes.string.isRequired,
  accountAddress: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  language: PropTypes.string.isRequired,
  ledgerClearState: PropTypes.func.isRequired,
  ledgerFetching: PropTypes.bool.isRequired,
  ledgerUpdateNetwork: PropTypes.func.isRequired,
  metamaskClearState: PropTypes.func.isRequired,
  metamaskFetching: PropTypes.bool.isRequired,
  modalOpen: PropTypes.func.isRequired,
  nativeCurrency: PropTypes.string.isRequired,
  network: PropTypes.string.isRequired,
  online: PropTypes.bool.isRequired,
  trezorClearState: PropTypes.func.isRequired,
  trezorFetching: PropTypes.bool.isRequired,
  trezorUpdateNetwork: PropTypes.func.isRequired,
  walletConnectClearState: PropTypes.func.isRequired,
  web3Available: PropTypes.bool.isRequired,
};

const reduxProps = ({ account, ledger, trezor, metamask, warning }) => ({
  accountType: account.accountType,
  accountAddress: account.accountAddress,
  nativeCurrency: account.nativeCurrency,
  metamaskFetching: metamask.fetching,
  language: account.language,
  ledgerFetching: ledger.fetching,
  trezorFetching: trezor.fetching,
  network: account.network,
  ledgerAccounts: ledger.accounts,
  trezorAccounts: trezor.accounts,
  web3Available: metamask.web3Available,
  online: warning.online,
});

export default connect(
  reduxProps,
  {
    accountChangeLanguage,
    accountChangeNativeCurrency,
    accountClearState,
    accountUpdateAccountAddress,
    ledgerClearState,
    ledgerUpdateNetwork,
    metamaskClearState,
    modalOpen,
    trezorClearState,
    trezorUpdateNetwork,
    walletConnectClearState,
  },
)(BaseLayout);
