import React from 'react';
import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;

const StyledWrapper = styled.div`
  will-change: transform, opacity;
  animation: ${fadeIn} 0.7s ease 0s normal 1;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Wrapper = ({ children, ...otherProps }) => (
  <StyledWrapper {...otherProps}>{children}</StyledWrapper>
);

Wrapper.propTypes = {
  children: PropTypes.node.isRequired
};

export default Wrapper;
