import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { colors, transitions } from '../styles';

const StyledLineBreakWrapper = styled.div`
  position: relative;
  width: 100% !important;
  padding: 0 !important;
  margin: 0 !important;
  margin-top: ${({ noMargin }) => (noMargin ? `0 !important` : `25px !important`)};
  border-top: 2px solid rgb(241, 242, 246);
`;

const StyledLineBreakFiller = styled.div`
  transition: ${transitions.long};
  position: absolute;
  left: 0;
  bottom: 0;
  width: ${({ percentage }) => `${percentage}%`};
  border-top: ${({ color }) =>
    color ? `2px solid rgb(${colors[color]})` : `2px solid rgb(241, 242, 246)`};
`;

const LineBreak = ({ noMargin, color, percentage, ...props }) => (
  <StyledLineBreakWrapper noMargin={noMargin} {...props}>
    <StyledLineBreakFiller color={color} percentage={percentage} />
  </StyledLineBreakWrapper>
);

LineBreak.propTypes = {
  noMargin: PropTypes.bool,
  color: PropTypes.string,
  percentage: PropTypes.number
};

LineBreak.defaultProps = {
  noMargin: false,
  color: '',
  percentage: 0
};

export default LineBreak;
