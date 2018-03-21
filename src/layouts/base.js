import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import Link from '../components/Link';
import Modal from '../components/Modal';
import Indicator from '../components/Indicator';
import Background from '../components/Background';
import IconPreload from '../components/IconPreload';
import Wrapper from '../components/Wrapper';
import Column from '../components/Column';
import Notification from '../components/Notification';
import Warning from '../components/Warning';
import logo from '../assets/logo-light.png';
import ethereumNetworks from '../libraries/ethereum-networks.json';
import supportedWallets from '../libraries/supported-wallets.json';
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
  margin-left: 10px;
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

const StyledLogo = styled.img`
  width: 20px;
  @media screen and (${responsive.sm.max}) {
    width: 16px;
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
const StyledActiveWallet = styled(Indicator)``;

const StyledVerticalLine = styled.div`
  height: 17px;
  border-left: 2px solid rgba(${colors.lightGrey}, 0.1);
`;

const BaseLayout = ({
  children,
  fetching,
  account,
  web3Network,
  web3Available,
  web3Connected,
  ...props
}) => {
  const showToolbar = window.location.pathname !== '/' && !fetching && web3Available && web3Network;
  return (
    <StyledLayout>
      <Background />
      <IconPreload />
      <Column maxWidth={900}>
        <StyledHeader>
          <Link to="/">
            <StyledBranding>
              <StyledLogo src={logo} alt="Balance" />
              <StyledHero>
                <strong>Balance.io</strong>
                <span>{` Manager`}</span>
              </StyledHero>
            </StyledBranding>
          </Link>
          <StyledIndicators show={showToolbar}>
            <StyledNetworkStatus
              selected={web3Network}
              iconColor={web3Connected ? 'green' : 'red'}
              options={ethereumNetworks}
            />
            <StyledVerticalLine />
            <StyledActiveWallet selected={account.type.toLowerCase()} options={supportedWallets} />
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
  web3Network: PropTypes.string.isRequired,
  web3Available: PropTypes.bool.isRequired,
  web3Connected: PropTypes.bool.isRequired
};

const reduxProps = ({ account }) => ({
  fetching: account.fetching,
  account: account.account,
  web3Network: account.web3Network,
  web3Available: account.web3Available,
  web3Connected: account.web3Connected
});

export default connect(reduxProps, null)(BaseLayout);
