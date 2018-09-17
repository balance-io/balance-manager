import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import Loader from './Loader';
import { colors, fonts, shadows, transitions } from '../styles';

const StyledIcon = styled.span`
  height: 16px;
  margin-right: 6px;
  width: 16px;
`;

const StyledButton = styled.button`
  transition: ${transitions.button};
  border: none;
  border-style: none;
  box-sizing: border-box;
  background-color: ${({ outline, color }) =>
    outline ? 'transparent' : `rgb(${colors[color]})`};
  border: ${({ outline, color }) =>
    outline ? `1px solid rgb(${colors[color]})` : 'none'};
  color: ${({ outline, color }) =>
    outline ? `rgb(${colors[color]})` : `rgb(${colors.white})`};
  box-shadow: ${({ outline }) => (outline ? 'none' : `${shadows.soft}`)};
  border-radius: 8px;
  font-size: ${fonts.size.h6};
  font-weight: ${fonts.weight.semibold};
  padding: ${({ icon, left }) =>
    icon ? (left ? '8px 12px' : '7px 28px 8px 12px') : '8px 12px'};
  cursor: ${({ disabled }) => (disabled ? 'auto' : 'pointer')};
  will-change: transform;

  ${({ isModalButton }) =>
    isModalButton &&
    css`
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
    `};

  &:disabled {
    opacity: 0.6;
    box-shadow: ${({ outline }) => (outline ? 'none' : `${shadows.soft}`)};
  }

  @media (hover: hover) {
    &:hover {
      transform: ${({ disabled }) => (!disabled ? 'translateY(-1px)' : 'none')};
      background-color: ${({ disabled, hoverColor, color }) =>
        !disabled
          ? hoverColor
            ? `rgb(${colors[hoverColor]})`
            : `rgb(${colors[color]})`
          : `rgb(${colors[color]})`};
      box-shadow: ${({ disabled, outline }) =>
        !disabled
          ? outline
            ? 'none'
            : `${shadows.hover}`
          : `${shadows.soft}`};
    }
  }

  &:active {
    transform: ${({ disabled }) => (!disabled ? 'translateY(1px)' : 'none')};
    background-color: ${({ disabled, activeColor, color }) =>
      !disabled
        ? activeColor
          ? `rgb(${colors[activeColor]})`
          : `rgb(${colors[color]})`
        : `rgb(${colors[color]})`};
    box-shadow: ${({ outline }) => (outline ? 'none' : `${shadows.soft}`)};
    color: ${({ outline, color }) =>
      outline ? `rgb(${colors[color]})` : `rgba(${colors.whiteTransparent})`};

    & ${StyledIcon} {
      opacity: 0.8;
    }
  }

  & ${StyledIcon} {
    display: ${({ icon }) => (icon ? 'inline-block' : 'none')};
    mask: ${({ icon }) => (icon ? `url(${icon}) center no-repeat` : 'none')};
    background-color: ${({ outline, color }) =>
      outline ? `rgb(${colors[color]})` : `rgb(${colors.white})`};
    transition: 0.15s ease;
    vertical-align: middle;
  }
`;

const Button = ({
  children,
  fetching,
  outline,
  type,
  color,
  hoverColor,
  activeColor,
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
    hoverColor={hoverColor}
    activeColor={activeColor}
    disabled={disabled}
    icon={icon}
    left={left}
    {...props}
  >
    <StyledIcon />
    {fetching ? (
      <Loader size={20} color="white" background={color} />
    ) : (
      children
    )}
  </StyledButton>
);

Button.propTypes = {
  children: PropTypes.node.isRequired,
  fetching: PropTypes.bool,
  outline: PropTypes.bool,
  type: PropTypes.string,
  color: PropTypes.string,
  hoverColor: PropTypes.string,
  activeColor: PropTypes.string,
  disabled: PropTypes.bool,
  icon: PropTypes.any,
  left: PropTypes.bool,
};

Button.defaultProps = {
  fetching: false,
  outline: false,
  type: 'button',
  color: 'darkGrey',
  hoverColor: 'darkGrey',
  activeColor: 'darkGrey',
  disabled: false,
  icon: null,
  left: false,
};

export default Button;
