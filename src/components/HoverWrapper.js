import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { shadows, transitions } from '../styles';

const StyledHoverWrapper = styled.div`
  position: relative;
  width: 100%;
  box-shadow: ${({ hover }) => (hover ? shadows.big : '0')};
  z-index: ${({ hover }) => (hover ? 20 : 0)};
`;

const StyledRelative = styled.div`
  width: 100%;
  transition: ${transitions.base};
  position: relative;
`;
const StyledHover = styled.div`
  width: 100%;
  transition: ${transitions.base};
  position: absolute;
`;

const HoverWrapper = ({ hover, children, ...props }) => (
  <StyledHoverWrapper hover={hover} {...props}>
    <StyledHover hover={hover}>{children}</StyledHover>
    <StyledRelative hover={hover}>{children}</StyledRelative>
  </StyledHoverWrapper>
);

HoverWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  hover: PropTypes.bool.isRequired
};

export default HoverWrapper;
