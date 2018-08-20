import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import balancesTabIcon from '../assets/balances-tab.svg';
import circle from '../assets/circle.svg';
import { colors, fonts } from '../styles';

const StyledToggleIndicator = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;

  &:not(:last-child) {
    padding-right: 16px;
  }

  @media (hover: hover) {
    &:hover span {
      color: rgb(${colors.darkGrey});
    }
  }
`;

const StyledToggleIndicatorIcon = styled.span`
  display: inline-flex;
  height: 16px;
  width: 16px;
  margin-right: 8px;
  mask: ${({ show }) =>
    show
      ? `url(${circle}) center no-repeat`
      : `url(${balancesTabIcon}) center no-repeat`};
  background-color: rgb(${colors.grey});
`;

const StyledToggleIndicatorText = styled.p`
  display: inline-flex;
  text-align: left;
  font-family: ${fonts.family.SFProText};
  font-weight: ${fonts.weight.medium};
  font-size: 13px;
  color: rgb(${colors.grey});
`;

const ToggleIndicator = ({ children, show, ...props }) => (
  <StyledToggleIndicator {...props}>
    <StyledToggleIndicatorIcon show={show} />
    <StyledToggleIndicatorText>{children}</StyledToggleIndicatorText>
  </StyledToggleIndicator>
);

ToggleIndicator.propTypes = {
  show: PropTypes.bool,
};

ToggleIndicator.defaultProps = {
  show: false,
};

export default ToggleIndicator;
