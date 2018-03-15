import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Loader from './Loader';
import { colors, fonts, shadows, transitions } from '../styles';

const StyledIcon = styled.div`
  position: absolute;
  height: 15px;
  width: 15px;
  margin: 0 8px;
  top: calc((100% - 15px) / 2);
`;

const StyledButton = styled.button`
  transition: ${transitions.base};
  position: relative;
  border: none;
  border-style: none;
  box-sizing: border-box;
  background-color: ${({ outline, color }) => (outline ? 'transparent' : `rgb(${colors[color]})`)};
  border: ${({ outline, color }) => (outline ? `1px solid rgb(${colors[color]})` : 'none')};
  color: ${({ outline, color }) => (outline ? `rgb(${colors[color]})` : `rgb(${colors.white})`)};
  box-shadow: ${({ outline }) => (outline ? 'none' : `${shadows.soft}`)};
  border-radius: 6px;
  font-size: ${fonts.size.h6};
  font-weight: ${fonts.weight.semibold};
  padding: ${({ icon, left }) =>
    icon ? (left ? '8px 12px 8px 28px' : '8px 28px 8px 12px') : '8px 12px'};
  margin: 5px;
  height: 30px;
  cursor: ${({ disabled }) => (disabled ? 'auto' : 'pointer')};
  will-change: transform;

  &:disabled {
    opacity: 0.6;
    box-shadow: ${({ outline }) => (outline ? 'none' : `${shadows.soft}`)} !important;
  }

  &:active,
  &:focus {
    opacity: 1;
    box-shadow: ${({ outline }) => (outline ? 'none' : `${shadows.soft}`)} !important;
  }

  & ${StyledIcon} {
    right: ${({ left }) => (left ? 'auto' : '0')};
    left: ${({ left }) => (left ? '0' : 'auto')};
    display: ${({ icon }) => (icon ? 'block' : 'none')};
    mask: ${({ icon }) => (icon ? `url(${icon}) center no-repeat` : 'none')};
    mask-size: 90%;
    background-color: ${({ outline, color }) =>
      outline ? `rgb(${colors[color]})` : `rgb(${colors.white})`};
  }

  @media (hover: hover) {
    &:hover {
      opacity: 0.6;
      box-shadow: ${({ outline }) => (outline ? 'none' : `${shadows.soft}`)} !important;
    }
  }
`;

const Button = ({
  children,
  fetching,
  outline,
  type,
  color,
  disabled,
  icon,
  left,
  round,
  ...props
}) => (
  <StyledButton
    type={type}
    outline={outline}
    color={color}
    disabled={disabled}
    icon={icon}
    left={left}
    {...props}
  >
    <StyledIcon />
    {fetching ? <Loader size={20} color="white" background={color} /> : children}
  </StyledButton>
);

Button.propTypes = {
  children: PropTypes.node.isRequired,
  fetching: PropTypes.bool,
  outline: PropTypes.bool,
  type: PropTypes.string,
  color: PropTypes.string,
  disabled: PropTypes.bool,
  icon: PropTypes.any,
  left: PropTypes.bool
};

Button.defaultProps = {
  fetching: false,
  outline: false,
  type: 'button',
  color: 'darkGrey',
  disabled: false,
  icon: null,
  left: false
};

export default Button;
