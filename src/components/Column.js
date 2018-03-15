import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledColumn = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  align-items: center;
  justify-content: ${({ center }) => (center ? 'center' : 'flex-start')};
`;

const Column = ({ children, center, ...props }) => (
  <StyledColumn center={center} {...props}>
    {children}
  </StyledColumn>
);

Column.propTypes = {
  children: PropTypes.node.isRequired,
  center: PropTypes.bool
};

Column.defaultProps = {
  center: false
};

export default Column;
