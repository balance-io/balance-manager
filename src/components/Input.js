import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import lang from '../languages';
import { colors, fonts, shadows, responsive } from '../styles';

const StyledInputWrapper = styled.div`
  width: 100%;
`;

const StyledLabel = styled.label`
  color: rgb(${colors.grey});
  font-size: 13px;
  font-weight: ${fonts.weight.semibold};
  width: 100%;
  opacity: ${({ hide }) => (hide ? 0 : 1)};
`;

const StyledInput = styled.input`
  width: 100%;
  margin-top: 8px;
  background: rgb(${colors.white});
  padding: 12px;
  border: none;
  border-style: none;
  font-family: ${({ monospace }) => (monospace ? `${fonts.family.SFMono}` : `inherit`)};
  font-size: ${fonts.size.h6};
  font-weight: ${fonts.weight.semibold};
  font-style: normal;
  font-stretch: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: left;
  border-radius: 8px;
  -webkit-box-shadow: ${shadows.medium};
  box-shadow: ${shadows.medium};
  outline: none;
  &::placeholder {
    color: rgba(${colors.grey}, 0.8);
    font-weight: ${fonts.weight.medium};
    opacity: 1;
  }
  @media screen and (${responsive.sm.max}) {
    padding: 8px 10px;
  }
`;

const Input = ({ label, type, placeholder, monospace, ...props }) => {
  let _label = label;
  let _placeholder = placeholder;
  if (!label) {
    if (type === 'email') {
      _label = lang.t('input.email');
      _placeholder = lang.t('input.email_placeholder');
    } else if (type === 'password') {
      _label = lang.t('input.password');
      _placeholder = lang.t('input.password_placeholder');
    } else if (type === 'text') {
      _label = lang.t('input.input_text');
    }
  }
  if (!placeholder) {
    if (type === 'email') {
      _placeholder = lang.t('input.email_placeholder');
    } else if (type === 'password') {
      _placeholder = lang.t('input.password_placeholder');
    } else if (type === 'text') {
      _placeholder = lang.t('input.input_placeholder');
    }
  }
  return (
    <StyledInputWrapper>
      <StyledLabel hide={_label === 'Input'}>{_label}</StyledLabel>
      <StyledInput type={type} placeholder={_placeholder} monospace={monospace} {...props} />
    </StyledInputWrapper>
  );
};

Input.propTypes = {
  type: PropTypes.string.isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  monospace: PropTypes.bool
};

Input.defaultProps = {
  label: '',
  placeholder: '',
  monospace: false
};

export default Input;
