import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled, { injectGlobal } from 'styled-components';
import logo from '../assets/logo-light.png';
import Modal from '../components/Modal';
import IconPreload from '../components/IconPreload';
import Wrapper from '../components/Wrapper';
import Notification from '../components/Notification';
import Metamask from '../pages/Metamask';
import SelectWallet from '../pages/SelectWallet';
import { fonts, transitions, globalStyles } from '../styles';

// eslint-disable-next-line
injectGlobal`${globalStyles}`;

const StyledColumn = styled.div`
  transition: ${transitions.long};
  width: 100%;
  height: 100%;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-grow: 1;
  justify-content: ${({ center }) => (center ? 'center' : 'flex-start')};
  align-items: center;
  flex-direction: column;
`;

const StyledWrapper = styled(Wrapper)`
  height: 100%;
  min-height: 100vh;
  width: 100vw;
  text-align: center;
`;

const StyledHeaderWrapper = styled.div`
  width: 100%;
  margin: ${({ center }) => (center ? '15px 0' : '30px 0 15px')};
  display: block;
`;

const StyledHeader = styled.div`
  width: 100%;
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

const StyledContentWrapper = styled.div`
  width: 100%;
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
    <StyledWrapper>
      <IconPreload />
      <StyledColumn>
        <StyledHeaderWrapper>
          <StyledHeader>
            <StyledBranding>
              <StyledLogo src={logo} alt="Balance" />
              <StyledHero>
                <strong>Balance</strong> Manager
              </StyledHero>
            </StyledBranding>
            <div />
            {/* <StyledToolbar>
              <Dropdown />
            </StyledToolbar> */}
          </StyledHeader>
        </StyledHeaderWrapper>
        <StyledContentWrapper>{this.selectedWallet()}</StyledContentWrapper>
      </StyledColumn>
      <Modal />
      <Notification />
    </StyledWrapper>
  );
}

Root.propTypes = {
  selectedWallet: PropTypes.string.isRequired
};

const reduxProps = ({ accounts }) => ({
  selectedWallet: accounts.selectedWallet
});

export default connect(reduxProps, null)(Root);
