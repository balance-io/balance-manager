import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import metamaskOriginal from '../assets/metamask-original.png';

const StyledMetamaskLogo = styled.div`
  width: ${({ size }) => `${size}px`};
  height: ${({ size }) => `${size * 0.925}px`};
  & img {
    width: 100%;
  }
`;

const MetamaskLogo = ({ size, ...props }) => (
  <StyledMetamaskLogo size={size} {...props}>
    <img src={metamaskOriginal} alt="metamask" />
  </StyledMetamaskLogo>
);

MetamaskLogo.propTypes = {
  size: PropTypes.number,
};

MetamaskLogo.defaultProps = {
  size: 200,
};

export default MetamaskLogo;
