import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import trezorLogo from '../assets/trezor-logo.png';

const StyledTrezorLogo = styled.div`
  width: ${({ size }) => `${size}px`};
  height: ${({ size }) => `${size * 0.3}px`};
  & img {
    width: 100%;
  }
`;

const TrezorLogo = ({ size, ...props }) => (
  <StyledTrezorLogo size={size} {...props}>
    <img src={trezorLogo} alt="trezor" />
  </StyledTrezorLogo>
);

TrezorLogo.propTypes = {
  size: PropTypes.number,
};

TrezorLogo.defaultProps = {
  size: 275,
};

export default TrezorLogo;
