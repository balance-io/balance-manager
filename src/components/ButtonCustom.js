import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Loader from './Loader';
import { colors, fonts, shadows, transitions } from '../styles';

const StyledIconImage = styled.div`
  position: absolute;
  height: 15px;
  width: 15px;
  margin: 0 8px;
  top: calc((100% - 15px) / 2);
  & img {
    width: 100%;
    height: 100%;
  }
`;

const StyledButton = styled.button`
  transition: ${transitions.base};
  position: relative;
  border: none;
  border-style: none;
  box-sizing: border-box;
  background-color: ${({ bgColor }) => `rgb(${colors[bgColor]})`};
  color: ${({ txtColor }) => `rgb(${colors[txtColor]})`};
  box-shadow: ${shadows.soft};
  border-radius: 7px;
  font-size: 0.75em;
  font-weight: ${fonts.weight.semibold};
  padding: ${({ img, left }) =>
    img ? (left ? '8px 12px 8px 28px' : '8px 28px 8px 12px') : '8px 12px'};
  margin: 5px;
  height: 27px;
  cursor: ${({ disabled }) => (disabled ? 'auto' : 'pointer')};
  will-change: transform;

  &:disabled {
    opacity: 0.6;
    box-shadow: ${({ outline }) =>
      outline ? 'none' : `${shadows.soft}`} !important;
  }

  &:active,
  &:focus {
    opacity: 1;
    box-shadow: ${({ outline }) =>
      outline ? 'none' : `${shadows.soft}`} !important;
  }

  & ${StyledIconImage} {
    right: ${({ left }) => (left ? 'auto' : '0')};
    left: ${({ left }) => (left ? '0' : 'auto')};
    display: ${({ img }) => (img ? 'block' : 'none')};
  }

  @media (hover: hover) {
    &:hover {
      opacity: 0.6;
      box-shadow: ${({ outline }) =>
        outline ? 'none' : `${shadows.soft}`} !important;
    }
  }
`;

const Button = ({
  children,
  fetching,
  outline,
  txtColor,
  bgColor,
  type,
  disabled,
  img,
  left,
  round,
  ...props
}) => (
  <StyledButton
    type={type}
    txtColor={txtColor}
    bgColor={bgColor}
    disabled={disabled}
    img={img}
    left={left}
    {...props}
  >
    <StyledIconImage>
      <img src={img} alt="icon" />
    </StyledIconImage>
    {fetching ? (
      <Loader size={20} color={txtColor} background={bgColor} />
    ) : (
      children
    )}
  </StyledButton>
);

Button.propTypes = {
  children: PropTypes.node.isRequired,
  img: PropTypes.string.isRequired,
  fetching: PropTypes.bool,
  type: PropTypes.string,
  txtColor: PropTypes.string,
  bgColor: PropTypes.string,
  disabled: PropTypes.bool,
  left: PropTypes.bool,
};

Button.defaultProps = {
  fetching: false,
  type: 'button',
  txtColor: 'dark',
  bgColor: 'white',
  disabled: false,
  left: false,
};

export default Button;
