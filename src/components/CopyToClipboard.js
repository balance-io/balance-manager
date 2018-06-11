import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import lang from '../languages';
import clipboardIcon from '../assets/copy-icon.svg';
import { toChecksumAddress } from '../handlers/web3';
import { notificationShow } from '../reducers/_notification';
import { fonts, colors, transitions, responsive } from '../styles';

const StyledIcon = styled.img`
  width: 11px;
  height: 11px;
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

const StyledCopyTextWidth = 68;
const StyledCopyText = styled.button`
  transition: all 200ms ease-in-out;
  font-weight: ${fonts.weight.medium};
  font-size: ${fonts.size.small};
  font-family: ${fonts.family.SFMono};
  padding: 3px;
  border-radius: 4px;
  background-color: ${({ copied }) => (copied ? '#26b881' : '#3f51b5')};
  color: #fff;
  width: ${StyledCopyTextWidth}px;
  height: 24px;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: space-around;
  right: -${StyledCopyTextWidth - 2}px;
  top: 0;
  cursor: pointer;
  transition: ${transitions.base};
  user-select: none;

  &:active {
    opacity: 0.9;
  }

  &:hover {
    opacity: 0.95;
  }
`;

const StyledCopyToClipboard = styled.div`
  width: 100%;
  min-height: 19px;
  position: relative;
`;

const StyledContainer = styled.div`
  position: relative;
  display: inline;
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
  font-size: ${fonts.size.medium};
  font-family: ${fonts.family.SFMono};
  line-height: 1.25;
  @media screen and (${responsive.sm.max}) {
    font-size: ${fonts.size.small};
  }
  background-color: #e2e0e0;
  border-radius: 2px;
  padding: 3px 5px;
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
  state = {
    copied: false,
  };
  timeoutHide = null;
  copyToCopyToClipboard = ({ target }) => {
    clearTimeout(timeout);
    target.select();
    document.execCommand('Copy');
    target.blur();
    this.onCopyButtonHandler();
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
    this.onCopyButtonHandler();
    this.props.notificationShow(
      lang.t('notification.info.address_copied_to_clipboard'),
    );
  };

  onCopyButtonHandler = () => {
    if (this.timeoutHide) clearTimeout(this.timeoutHide);
    this.setState({ copied: true });
    this.timeoutHide = setTimeout(() => this.setState({ copied: false }), 3000);
  };

  render() {
    let { notificationShow, text, ...props } = this.props;
    let { copied } = this.state;
    text = toChecksumAddress(text);
    return (
      <StyledCopyToClipboard {...props}>
        <StyledContainer>
          <StyledInvisible>{text}</StyledInvisible>
          <StyledInput
            value={text}
            spellCheck={false}
            onChange={() => {}}
            onClick={this.copyToCopyToClipboard}
          />
          <StyledText>
            {lang.t('message.click_to_copy_to_clipboard')}
          </StyledText>
          <StyledCopyText
            onClick={this.simulateCopyToClipboard}
            copied={copied}
          >
            <StyledIcon src={clipboardIcon} alt="copy" />
            {copied ? lang.t('message.copied') : lang.t('message.copy')}
          </StyledCopyText>
        </StyledContainer>
      </StyledCopyToClipboard>
    );
  }
}

CopyToClipboard.propTypes = {
  notificationShow: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
};

export default connect(null, { notificationShow })(CopyToClipboard);
