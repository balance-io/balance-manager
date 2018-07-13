import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import elphLogo from '../assets/elph-logo.png';

const StyledElphLogo = styled.div`
  width: ${({ size }) => `${size}px`};
  height: ${({ size }) => `${size * 0.3}px`};
  & img {
    width: 100%;
  }
`;

const ElphLogo = ({ size, ...props }) => (
  <StyledElphLogo size={size} {...props}>
    <img src={elphLogo} alt="elph" />
  </StyledElphLogo>
);

ElphLogo.propTypes = {
  size: PropTypes.number,
};

ElphLogo.defaultProps = {
  size: 275,
};

export default ElphLogo;
