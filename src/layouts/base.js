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
import logo from '../assets/logo-light.png';
import iconUSD from '../assets/usd.svg';
import iconGBP from '../assets/gbp.svg';
import iconEUR from '../assets/eur.svg';
import iconBTC from '../assets/btc.svg';
import iconETH from '../assets/eth.svg';
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
  margin: 30px 0 15px;
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
`;

const StyledLogo = styled.img`
  width: 20px;
`;

const StyledToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const nativeDropdown = {
  USD: {
    value: 'USD',
    icon: iconUSD
  },
  GBP: {
    value: 'GBP',
    icon: iconGBP
  },
  EUR: {
    value: 'EUR',
    icon: iconEUR
  },
  BTC: {
    value: 'BTC',
    icon: iconBTC
  },
  ETH: {
    value: 'ETH',
    icon: iconETH
  }
};

const BaseLayout = ({ children, accountsChangeNativeCurrency, ...props }) => (
  <StyledLayout>
    <Background />
    <IconPreload />
    <Column maxWidth={800}>
      <StyledHeader>
        <Link to="/">
          <StyledBranding>
            <StyledLogo src={logo} alt="Balance" />
            <StyledHero>
              <strong>Balance</strong> Manager
            </StyledHero>
          </StyledBranding>
        </Link>
        <StyledToolbar>
          <Dropdown options={nativeDropdown} onChange={accountsChangeNativeCurrency} />
        </StyledToolbar>
      </StyledHeader>
      <StyledContent>{children}</StyledContent>
    </Column>
    <Modal />
    <Notification />
  </StyledLayout>
);

BaseLayout.propTypes = {
  accountsChangeNativeCurrency: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired
};

export default connect(null, {
  accountsChangeNativeCurrency
})(BaseLayout);
