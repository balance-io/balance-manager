import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import balancesTabIcon from '../assets/balances-tab.svg';
import circle from '../assets/circle.svg';
import { colors } from '../styles';

const StyledToggleIndicator = styled.div`
  position: absolute;
  height: 14px;
  width: 14px;
  left: 0;
  top: calc((100% - 16px) / 2);
  mask: ${({ show }) =>
    show ? `url(${circle}) center no-repeat` : `url(${balancesTabIcon}) center no-repeat`};
  mask-size: ${({ show }) => (show ? `70%` : `auto`)};
  background-color: rgb(${colors.grey});
`;

const ToggleIndicator = ({ show, ...props }) => <StyledToggleIndicator show={show} {...props} />;

ToggleIndicator.propTypes = {
  show: PropTypes.bool
};

ToggleIndicator.defaultProps = {
  show: false
};

export default ToggleIndicator;
