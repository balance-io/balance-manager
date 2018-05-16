import React from 'react';
import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components';
import spinnerImg from '../assets/spinner.png';

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const StyledSpinner = styled.img`
  width: ${({ size }) => `${size}px`};
  height: ${({ size }) => `${size}px`};

  animation: ${spin} 0.8s linear infinite;
`;

const Spinner = ({ size, ...props }) => (
  <StyledSpinner src={spinnerImg} size={size} {...props} />
);

Spinner.propTypes = {
  size: PropTypes.number,
};

Spinner.defaultProps = {
  size: 8,
};

export default Spinner;
