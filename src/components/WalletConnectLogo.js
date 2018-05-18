import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import walletConnectBlue from '../assets/walletconnect-blue.svg';

const StyledWalletConnectLogo = styled.div`
  width: ${({ size }) => `${size}px`};
  height: ${({ size }) => `${size * 0.68}px`};
  & img {
    width: 100%;
  }
`;

const WalletConnectLogo = ({ size, ...props }) => (
  <StyledWalletConnectLogo size={size} {...props}>
    <img src={walletConnectBlue} alt="WalletConnect" />
  </StyledWalletConnectLogo>
);

WalletConnectLogo.propTypes = {
  size: PropTypes.number,
};

WalletConnectLogo.defaultProps = {
  size: 250,
};

export default WalletConnectLogo;
