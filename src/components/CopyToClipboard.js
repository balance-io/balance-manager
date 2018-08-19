import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { lang } from 'balance-common';
import clipboardIcon from '../assets/clipboard.png';
import { toChecksumAddress } from 'balance-common';
import { notificationShow } from '../reducers/_notification';
import { fonts, colors, transitions, responsive } from '../styles';

const StyledIcon = styled.img`
  cursor: pointer;
  transition: ${transitions.base};
  width: 16px;
  height: 16px;
  opacity: 0;
  vertical-align: middle;

  @media screen and (${responsive.xxs.max}) {
    display: none;
  }
`;

const StyledText = styled.p`
  transition: ${transitions.base};
  font-weight: ${fonts.weight.medium};
  font-size: ${fonts.size.small};
  opacity: 0;
  position: absolute;
  top: 200%;
  right: calc(50% - 91px);
  font-family: ${fonts.family.SFMono};
  letter-spacing: -0.2px;
`;

const StyledCopyToClipboard = styled.div`
  @media (hover: hover) {
    &:hover ${StyledIcon} {
      opacity: ${({ iconOnHover }) => (iconOnHover ? '1' : '0')};
    }
    &:hover ${StyledText} {
      opacity: ${({ iconOnHover }) => (iconOnHover ? '0' : '0.7')};
    }
  }
`;

const StyledInputTextSize = `
  font-size: ${fonts.size.medium};
  max-width: 400px;
`;

const StyledInputTextSizeSMedium = `
  font-size: ${fonts.size.smedium};
  max-width: 370px;
`;

const StyledInputTextSizeSmall = `
  font-size: ${fonts.size.small};
  max-width: 320px;
`;

const StyledInputTextSizeXSmall = `
  font-size: ${fonts.size.xsmall};
  max-width: 294px;
`;

const StyledInputText = styled.input`
  background-color: transparent;
  color: transparent;
  text-shadow: 0 0 0 rgb(${colors.mediumGrey});
  font-style: normal;
  font-stretch: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: left;
  font-weight: ${fonts.weight.medium};
  font-family: ${fonts.family.SFMono};
  line-height: 1.25;
  width: 100%;
  ${StyledInputTextSize};

  @media screen and (max-width: 810px) {
    ${StyledInputTextSizeSMedium};
  }

  @media screen and (max-width: 780px) {
    ${StyledInputTextSizeSmall};
  }

  @media screen and (max-width: 730px) {
    ${StyledInputTextSizeXSmall};
  }

  @media screen and (max-width: 712px) {
    ${StyledInputTextSize};
  }

  @media screen and (${responsive.xs.max}) {
    ${StyledInputTextSizeSMedium};
  }

  @media screen and (max-width: 450px) {
    ${StyledInputTextSizeSmall};
  }

  @media screen and (max-width: 360px) {
    ${StyledInputTextSizeXSmall};
  }

  @media screen and (max-width: 336px) {
    font-size: ${fonts.size.tiny};
  }
`;

const StyledInput = styled(StyledInputText)`
  -webkit-appearance: none;
  border: none;
  cursor: pointer;
  display: inline-block;
  outline: none;
  vertical-align: middle;
`;

let timeout = null;

class CopyToClipboard extends Component {
  copyToCopyToClipboard = ({ target }) => {
    clearTimeout(timeout);
    target.select();
    document.execCommand('Copy');
    target.blur();
    this.props.notificationShow(
      lang.t('notification.info.address_copied_to_clipboard'),
    );
  };
  simulateCopyToClipboard = () => {
    const str = this.props.text;
    const element = document.createElement('textarea');
    element.value = str;
    document.body.appendChild(element);
    element.select();
    document.execCommand('copy');
    document.body.removeChild(element);
    this.props.notificationShow(
      lang.t('notification.info.address_copied_to_clipboard'),
    );
  };
  render() {
    let { notificationShow, iconOnHover, text, ...props } = this.props;
    text = toChecksumAddress(text);
    return (
      <StyledCopyToClipboard {...props} iconOnHover={iconOnHover}>
        <StyledInput
          value={text}
          spellCheck={false}
          onChange={() => {}}
          onClick={this.copyToCopyToClipboard}
        />
        <StyledText>{lang.t('message.click_to_copy_to_clipboard')}</StyledText>
        <StyledIcon
          src={clipboardIcon}
          alt="copy"
          onClick={this.simulateCopyToClipboard}
        />
      </StyledCopyToClipboard>
    );
  }
}

CopyToClipboard.propTypes = {
  notificationShow: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
  iconOnHover: PropTypes.bool,
};

CopyToClipboard.defaultProps = {
  iconOnHover: false,
};

export default connect(
  null,
  { notificationShow },
)(CopyToClipboard);
