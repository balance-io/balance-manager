import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import Link from '../components/Link';
import Modal from '../components/Modal';
import Dropdown from '../components/Dropdown';
import Background from '../components/Background';
import IconPreload from '../components/IconPreload';
import Wrapper from '../components/Wrapper';
import Column from '../components/Column';
import Notification from '../components/Notification';
import Warning from '../components/Warning';
import logo from '../assets/logo-light.png';
import ethereumNetworks from '../libraries/ethereum-networks';
import nativeCurrencies from '../libraries/native-currencies';
import { accountsChangeNativeCurrency } from '../reducers/_accounts';
import { fonts, responsive } from '../styles';

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
  margin-left: 10px;
  font-family: ${fonts.family.FFMarkPro} !important;
  font-size: ${fonts.size.h4};
  font-weight: normal;
  & strong {
    font-weight: bold;
  }
  @media screen and (${responsive.sm.max}) {
    font-size: ${fonts.size.medium};
  }
`;

const StyledLogo = styled.img`
  width: 20px;
  @media screen and (${responsive.sm.max}) {
    width: 16px;
  }
`;

const StyledToolbar = styled.div`
  opacity: ${({ show }) => (show ? 1 : 0)};
  visibility: ${({ show }) => (show ? 'visible' : 'hidden')};
  pointer-events: ${({ show }) => (show ? 'auto' : 'none')};
  display: flex;
  align-items: center;
  justify-content: flex-end;
  & > div {
    margin-left: 10px;
  }
`;

const BaseLayout = ({
  children,
  fetching,
  nativeCurrency,
  web3Network,
  web3Available,
  web3Connected,
  accountsChangeNativeCurrency,
  ...props
}) => {
  const showToolbar = window.location.pathname !== '/' && !fetching && web3Available && web3Network;
  return (
    <StyledLayout>
      <Background />
      <IconPreload />
      <Column spanHeight maxWidth={800}>
        <StyledHeader>
          <Link to="/">
            <StyledBranding>
              <StyledLogo src={logo} alt="Balance" />
              <StyledHero>
                <strong>Balance</strong> Manager
              </StyledHero>
            </StyledBranding>
          </Link>
          <StyledToolbar show={showToolbar}>
            <Dropdown
              selected={web3Network}
              iconColor={web3Connected ? 'green' : 'red'}
              options={ethereumNetworks}
            />
            <Dropdown
              selected={nativeCurrency}
              options={nativeCurrencies}
              onChange={accountsChangeNativeCurrency}
            />
          </StyledToolbar>
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
  accountsChangeNativeCurrency: PropTypes.func.isRequired,
  fetching: PropTypes.bool.isRequired,
  nativeCurrency: PropTypes.string.isRequired,
  web3Network: PropTypes.string.isRequired,
  web3Available: PropTypes.bool.isRequired,
  web3Connected: PropTypes.bool.isRequired
};

const reduxProps = ({ accounts }) => ({
  fetching: accounts.fetching,
  nativeCurrency: accounts.nativeCurrency,
  web3Network: accounts.web3Network,
  web3Available: accounts.web3Available,
  web3Connected: accounts.web3Connected
});

export default connect(reduxProps, {
  accountsChangeNativeCurrency
})(BaseLayout);
