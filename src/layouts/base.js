import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import lang from '../languages';
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
  accountUpdateAccountAddress,
  accountChangeLanguage,
} from '../reducers/_account';
import ReminderRibbon from '../components/ReminderRibbon';
import { colors, responsive } from '../styles';
import { resources } from '../languages';

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
  margin-top: -1px;
  margin-bottom: 1px;
  width: 100%;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
`;

const StyledBranding = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

const StyledBalanceLogo = styled.div`
  width: 198px;
  height: 23px;
  background: url(${balanceManagerLogo}) no-repeat;
  @media screen and (${responsive.sm.max}) {
  }
`;

const StyledBeta = styled.div`
  margin: 0;
  position: absolute;
  top: 5.5px;
  right: -40px;
  display: inline-block;
  letter-spacing: 0.4px;
  font-size: 8px;
  font-weight: 500;
  padding: 2px 3px;
  border-radius: 4px;
  background: rgba(${colors.white}, 0.5);
  color: rgb(${colors.bodyBackground});
`;

const StyledIndicators = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  & > div {
    margin-left: 2px;
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
  children,
  metamaskFetching,
  ledgerFetching,
  trezorFetching,
  accountType,
  accountAddress,
  ledgerAccounts,
  ledgerUpdateNetwork,
  trezorAccounts,
  trezorUpdateNetwork,
  accountChangeNativeCurrency,
  accountUpdateAccountAddress,
  accountChangeLanguage,
  nativeCurrency,
  language,
  network,
  web3Available,
  online,
  modalOpen,
  ...props
}) => {
  const addresses = {};
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
    window.location.pathname !== '/' &&
    (!metamaskFetching || !ledgerFetching || !trezorFetching) &&
    ((accountType === 'METAMASK' && web3Available) ||
      accountType !== 'METAMASK') &&
    accountAddress;
  const openSendModal = () => modalOpen('DONATION_MODAL');
  return (
    <StyledLayout>
      <ReminderRibbon maxWidth={1000} />
      <Background />
      <Column maxWidth={1000}>
        <StyledHeader>
          <Link to="/">
            <StyledBranding>
              <StyledBalanceLogo alt="Balance" />
              <StyledBeta>{'BETA'}</StyledBeta>
            </StyledBranding>
          </Link>
          <StyledIndicators>
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
          <div />
        </StyledFooterLeft>
        <StyledFooterRight>
          {window.location.pathname !== '/' && (
            <TextButton onClick={openSendModal}>
              {lang.t('button.donate')}
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
  children: PropTypes.node.isRequired,
  metamaskFetching: PropTypes.bool.isRequired,
  ledgerFetching: PropTypes.bool.isRequired,
  ledgerUpdateNetwork: PropTypes.func.isRequired,
  trezorFetching: PropTypes.bool.isRequired,
  trezorUpdateNetwork: PropTypes.func.isRequired,
  accountChangeNativeCurrency: PropTypes.func.isRequired,
  accountUpdateAccountAddress: PropTypes.func.isRequired,
  accountChangeLanguage: PropTypes.func.isRequired,
  accountType: PropTypes.string.isRequired,
  accountAddress: PropTypes.string.isRequired,
  nativeCurrency: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
  network: PropTypes.string.isRequired,
  web3Available: PropTypes.bool.isRequired,
  online: PropTypes.bool.isRequired,
  modalOpen: PropTypes.func.isRequired,
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
    ledgerUpdateNetwork,
    trezorUpdateNetwork,
    accountChangeNativeCurrency,
    accountUpdateAccountAddress,
    modalOpen,
    accountChangeLanguage,
  },
)(BaseLayout);
