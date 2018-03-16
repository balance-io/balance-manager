import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledColumn = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  max-width: ${({ maxWidth }) => `${maxWidth}px`};
  margin: 0 auto;
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  align-items: center;
  justify-content: ${({ center }) => (center ? 'center' : 'flex-start')};
`;

const Column = ({ children, maxWidth, center, ...props }) => (
  <StyledColumn maxWidth={maxWidth} center={center} {...props}>
    {children}
  </StyledColumn>
);

Column.propTypes = {
  children: PropTypes.node.isRequired,
  maxWidth: PropTypes.number,
  center: PropTypes.bool
};

Column.defaultProps = {
  maxWidth: 600,
  center: false
};

export default Column;
