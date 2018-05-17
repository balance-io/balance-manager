import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { colors } from '../styles';

const StyledLineBreakWrapper = styled.div`
  position: relative;
  width: 100% !important;
  padding: 0 !important;
  margin: 0 !important;
  margin-top: ${({ noMargin }) =>
    noMargin ? `0 !important` : `25px !important`};
  border-top: 2px solid rgb(241, 242, 246);
`;

const StyledLineBreakFiller = styled.div`
  transition: 0.32s cubic-bezier(0.77, 0, 0.175, 1);
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  transform-origin: 0;
  transform: ${({ percentage }) => `scale3d(${percentage / 100}, 1, 1)`};
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
  percentage: PropTypes.number,
};

LineBreak.defaultProps = {
  noMargin: false,
  color: '',
  percentage: 0,
};

export default LineBreak;
