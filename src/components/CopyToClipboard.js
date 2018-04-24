import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import lang from '../languages';
import clipboardIcon from '../assets/clipboard.png';
import { notificationShow } from '../reducers/_notification';
import { fonts, colors, transitions, responsive } from '../styles';

const StyledIcon = styled.img`
  cursor: pointer;
  transition: ${transitions.base};
  position: absolute;
  right: -20px;
  top: calc(50% - 8px);
  width: 16px;
  height: 16px;
  opacity: 0;
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
  width: 100%;
  position: relative;
`;

const StyledContainer = styled.div`
  position: relative;
  display: inline;
  @media (hover: hover) {
    &:hover ${StyledIcon} {
      opacity: ${({ iconOnHover }) => (iconOnHover ? '1' : '0')};
    }
    &:hover ${StyledText} {
      opacity: ${({ iconOnHover }) => (iconOnHover ? '0' : '0.7')};
    }
  }
`;

const StyledInputText = styled.input`
  background-color: transparent;
  color: transparent;
  text-shadow: 0 0 0 rgba(${colors.darkGrey}, 0.8);
  font-style: normal;
  font-stretch: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: left;
  font-weight: ${fonts.weight.medium};
  font-size: ${fonts.size.medium};
  font-family: ${fonts.family.SFMono};
  line-height: 1.25;
  @media screen and (${responsive.sm.max}) {
    font-size: ${fonts.size.small};
  }
`;

const StyledInput = styled(StyledInputText)`
  width: 100%;
  position: absolute;
  left: 0;
  top: calc((100% - 1.25em) / 2)
  margin: 0;
  cursor: pointer;
  border: none;
  -webkit-appearance: none;
  outline: none;
`;

const StyledInputParagraph = StyledInputText.withComponent('p');

const StyledInvisible = styled(StyledInputParagraph)`
  width: auto;
  display: inline;
  opacity: 0;
  margin-left: 4px;
`;

let timeout = null;

class CopyToClipboard extends Component {
  copyToCopyToClipboard = ({ target }) => {
    clearTimeout(timeout);
    target.select();
    document.execCommand('Copy');
    target.blur();
    this.props.notificationShow(lang.t('notification.info.address_copied_to_clipboard'));
  };
  simulateCopyToClipboard = () => {
    const str = this.props.text;
    const element = document.createElement('textarea');
    element.value = str;
    document.body.appendChild(element);
    element.select();
    document.execCommand('copy');
    document.body.removeChild(element);
    this.props.notificationShow(lang.t('notification.info.address_copied_to_clipboard'));
  };
  render() {
    const { notificationShow, iconOnHover, text, ...props } = this.props;
    return (
      <StyledCopyToClipboard {...props}>
        <StyledContainer iconOnHover={iconOnHover}>
          <StyledInvisible>{text}</StyledInvisible>
          <StyledInput value={text} onChange={() => {}} onClick={this.copyToCopyToClipboard} />
          <StyledText>{lang.t('message.click_to_copy_to_clipboard')}</StyledText>
          <StyledIcon src={clipboardIcon} alt="copy" onClick={this.simulateCopyToClipboard} />
        </StyledContainer>
      </StyledCopyToClipboard>
    );
  }
}

CopyToClipboard.propTypes = {
  notificationShow: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
  iconOnHover: PropTypes.bool
};

CopyToClipboard.defaultProps = {
  iconOnHover: false
};

export default connect(null, { notificationShow })(CopyToClipboard);
