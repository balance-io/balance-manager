import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled, { injectGlobal } from 'styled-components';
import logo from '../assets/logo-light.png';
import Modal from '../components/Modal';
import Background from '../components/Background';
import IconPreload from '../components/IconPreload';
import Wrapper from '../components/Wrapper';
import Column from '../components/Column';
import Notification from '../components/Notification';
import Metamask from '../pages/Metamask';
import SelectWallet from '../pages/SelectWallet';
import { fonts, globalStyles } from '../styles';

// eslint-disable-next-line
injectGlobal`${globalStyles}`;

const StyledLayout = styled.div`
  position: relative;
  height: 100%;
  min-height: 100vh;
  width: 100vw;
  text-align: center;
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

class Root extends Component {
  selectedWallet = () => {
    switch (this.props.selectedWallet) {
      case 'METAMASK':
        return <Metamask />;
      default:
        return <SelectWallet />;
    }
  };
  render = () => (
    <StyledLayout>
      <Background />
      <IconPreload />
      <Column maxWidth={800}>
        <StyledHeader>
          <StyledBranding>
            <StyledLogo src={logo} alt="Balance" />
            <StyledHero>
              <strong>Balance</strong> Manager
            </StyledHero>
          </StyledBranding>
          {/* <StyledToolbar>
              <Dropdown />
            </StyledToolbar> */}
        </StyledHeader>
        <StyledContent>{this.selectedWallet()}</StyledContent>
      </Column>
      <Modal />
      <Notification />
    </StyledLayout>
  );
}

Root.propTypes = {
  selectedWallet: PropTypes.string.isRequired
};

const reduxProps = ({ accounts }) => ({
  selectedWallet: accounts.selectedWallet
});

export default connect(reduxProps, null)(Root);
