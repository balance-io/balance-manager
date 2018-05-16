import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { shadows } from '../styles';

const StyledHoverWrapper = styled.div`
  position: relative;
  width: 100%;
  z-index: ${({ hover }) => (hover ? 20 : 0)};

  &:before {
    bottom: 0;
    box-shadow: ${shadows.big};
    content: " ";
    left: 0;
    opacity: ${({ hover }) => (hover ? 1 : 0)}
    position: absolute;
    right: 0;
    top: 0;
  }
`;

const HoverWrapper = ({ hover, children, ...props }) => (
  <StyledHoverWrapper hover={hover} {...props}>
    {children}
  </StyledHoverWrapper>
);

HoverWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  hover: PropTypes.bool.isRequired,
};

export default HoverWrapper;
