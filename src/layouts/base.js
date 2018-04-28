import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import Link from '../components/Link';
import Modal from '../components/Modal';
import Indicator from '../components/Indicator';
import DropdownNative from '../components/DropdownNative';
import Background from '../components/Background';
import Wrapper from '../components/Wrapper';
import Column from '../components/Column';
import Notification from '../components/Notification';
import Warning from '../components/Warning';
import balanceManagerLogo from '../assets/balance-manager-logo.svg';
import ethereumNetworks from '../libraries/ethereum-networks.json';
import nativeCurrencies from '../libraries/native-currencies.json';
import { accountChangeNativeCurrency } from '../reducers/_account';
import { colors, responsive } from '../styles';

const StyledLayout = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  text-align: center;
  padding: 0 16px;
`;

const StyledContent = styled(Wrapper)`
  width: 100%;
`;

const StyledHeader = styled.div`
  margin-top: -1px;
  margin-bottom: 1px;
  width: 100%;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  right: -36px;
  width: 28px;
  letter-spacing: .3px;
  font-size: 8px;
  font-weight: 500;
  padding: 2px 3.5px;
  border-radius: 4px;
  background: rgba(${colors.white}, 0.5);
  color: rgb(${colors.bodyBackground});
`;

const StyledIndicators = styled.div`
  opacity: ${({ show }) => (show ? 1 : 0)};
  visibility: ${({ show }) => (show ? 'visible' : 'hidden')};
  pointer-events: ${({ show }) => (show ? 'auto' : 'none')};
  display: flex;
  align-items: center;
  justify-content: flex-end;
  & > div {
    margin-left: 2px;
  }
`;

const StyledNetworkStatus = styled(Indicator)``;

const StyledVerticalLine = styled.div`
  height: 17px;
  border-left: 2px solid rgba(${colors.lightGrey}, 0.1);
`;

const BaseLayout = ({
  children,
  fetching,
  accountType,
  accountAddress,
  accountChangeNativeCurrency,
  nativeCurrency,
  network,
  web3Available,
  online,
  ...props
}) => {
  const showToolbar =
    window.location.pathname !== '/' &&
    !fetching &&
    ((accountType === 'METAMASK' && web3Available) || accountType !== 'METAMASK') &&
    accountAddress;
  return (
    <StyledLayout>
      <Background />
      <Column maxWidth={1000}>
        <StyledHeader>
          <Link to="/">
            <StyledBranding>
              <StyledBalanceLogo alt="Balance" />
              <StyledBeta>{'BETA'}</StyledBeta>
            </StyledBranding>
          </Link>
          <StyledIndicators show={showToolbar}>
            <StyledNetworkStatus
              selected={network}
              iconColor={online ? 'green' : 'red'}
              options={ethereumNetworks}
            />
            <StyledVerticalLine />
            <DropdownNative
              selected={nativeCurrency}
              options={nativeCurrencies}
              onChange={accountChangeNativeCurrency}
            />
          </StyledIndicators>
        </StyledHeader>
        <StyledContent>{children}</StyledContent>
      </Column>
      <Modal />
      <Notification />
      <Warning />
    </StyledLayout>
  );
};

BaseLayout.propTypes = {
  children: PropTypes.node.isRequired,
  fetching: PropTypes.bool.isRequired,
  accountType: PropTypes.string.isRequired,
  accountAddress: PropTypes.string.isRequired,
  nativeCurrency: PropTypes.string.isRequired,
  network: PropTypes.string.isRequired,
  web3Available: PropTypes.bool.isRequired,
  online: PropTypes.bool.isRequired
};

const reduxProps = ({ account, metamask, warning }) => ({
  accountType: account.accountType,
  accountAddress: account.accountAddress,
  nativeCurrency: account.nativeCurrency,
  fetching: metamask.fetching,
  network: metamask.network,
  web3Available: metamask.web3Available,
  online: warning.online
});

export default connect(reduxProps, { accountChangeNativeCurrency })(BaseLayout);
