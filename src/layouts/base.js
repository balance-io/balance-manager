import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Link from '../components/Link';
import logo from '../assets/logo-light.png';
import Modal from '../components/Modal';
import Background from '../components/Background';
import IconPreload from '../components/IconPreload';
import Wrapper from '../components/Wrapper';
import Column from '../components/Column';
import Notification from '../components/Notification';
import { fonts } from '../styles';

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

const BaseLayout = ({ children, ...props }) => (
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
        {/* <StyledToolbar>
              <Dropdown />
            </StyledToolbar> */}
      </StyledHeader>
      <StyledContent>{children}</StyledContent>
    </Column>
    <Modal />
    <Notification />
  </StyledLayout>
);

BaseLayout.propTypes = {
  children: PropTypes.node.isRequired
};

export default BaseLayout;
