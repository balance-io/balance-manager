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
import balanceLogo from '../assets/balance-logo.svg';
import ethereumNetworks from '../libraries/ethereum-networks.json';
import nativeCurrencies from '../libraries/native-currencies.json';
import { accountChangeNativeCurrency } from '../reducers/_account';
import { colors, fonts, responsive } from '../styles';

const StyledLayout = styled.div`
  position: relative;
  height: 100%;
  min-height: 100vh;
  width: 100vw;
  text-align: center;
  @media screen and (${responsive.sm.max}) {
    padding: 15px;
  }
`;

const StyledContent = styled(Wrapper)`
  width: 100%;
`;

const StyledHeader = styled.div`
  width: 100%;
  margin: 42px 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  @media screen and (${responsive.sm.max}) {
    margin: 0;
    margin-bottom: 15px;
  }
`;

const StyledBranding = styled.div`
  display: flex;
  align-items: center;
`;

const StyledHero = styled.h1`
  margin-left: 4px;
  font-family: ${fonts.family.FFMarkPro} !important;
  font-size: ${fonts.size.h4};
  font-weight: normal;
  & strong {
    font-weight: bold;
  }
  & span {
    opacity: 0.5;
  }
  @media screen and (${responsive.sm.max}) {
    font-size: ${fonts.size.medium};
  }
`;

const StyledBalanceLogo = styled.img`
  width: 105px;
  @media screen and (${responsive.sm.max}) {
    width: 84px;
  }
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
  account,
  accountChangeNativeCurrency,
  nativeCurrency,
  network,
  web3Available,
  online,
  ...props
}) => {
  const showToolbar = window.location.pathname !== '/' && !fetching && web3Available && network;
  return (
    <StyledLayout>
      <Background />
      <Column maxWidth={1000}>
        <StyledHeader>
          <Link to="/">
            <StyledBranding>
              <StyledBalanceLogo src={balanceLogo} alt="Balance" />
              <StyledHero>
                <span>{` Manager`}</span>
              </StyledHero>
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
  account: PropTypes.object.isRequired,
  nativeCurrency: PropTypes.string.isRequired,
  network: PropTypes.string.isRequired,
  web3Available: PropTypes.bool.isRequired,
  online: PropTypes.bool.isRequired
};

const reduxProps = ({ account, metamask, warning }) => ({
  account: account.accountInfo,
  nativeCurrency: account.nativeCurrency,
  fetching: metamask.fetching,
  network: metamask.network,
  web3Available: metamask.web3Available,
  online: warning.online
});

export default connect(reduxProps, { accountChangeNativeCurrency })(BaseLayout);
