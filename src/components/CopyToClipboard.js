import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import clipboardIcon from '../assets/clipboard.png';
import { notificationShow } from '../reducers/_notification';
import { fonts, colors, transitions, responsive } from '../styles';

const StyledIcon = styled.img`
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
  top: 85%;
  right: calc(50% - 91px);
  font-family: ${fonts.family.SFMono};
  letter-spacing: -0.2px;
`;

const StyledCopyToClipboard = styled.div`
  width: 100%;
  position: relative;
  @media (hover: hover) {
    &:hover ${StyledIcon} {
      opacity: ${({ iconOnHover }) => (iconOnHover ? '1' : '0')};
    }
    &:hover ${StyledText} {
      opacity: ${({ iconOnHover }) => (iconOnHover ? '0' : '0.7')};
    }
  }
`;

const StyledContainer = styled.div`
  position: relative;
  display: inline;
  padding: 6px 6px 6px 0;
`;

const StyledInput = styled.input`
  width: 100%;
  position: absolute;
  left: 0;
  top: 3px;
  margin: 0;
  cursor: pointer;
  border: none;
  -webkit-appearance: none;
  outline: none;
  border-style: none;
  font-style: normal;
  font-stretch: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: left;
  opacity: 0.7;
  color: transparent;
  text-shadow: 0 0 0 rgb(${colors.dark});
  font-weight: ${fonts.weight.semibold};
  font-size: ${fonts.size.medium};
  font-family: ${fonts.family.SFProText};
  line-height: 1.25;
  letter-spacing: -0.2px;
  @media screen and (${responsive.sm.max}) {
    font-size: ${fonts.size.small};
  }
  @media screen and (${responsive.xs.max}) {
    font-size: ${fonts.size.tiny};
  }
`;

const StyledInvisible = styled.p`
  width: auto;
  display: inline;
  border-style: none;
  font-style: normal;
  font-stretch: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: left;
  font-weight: ${fonts.weight.semibold};
  font-size: ${fonts.size.medium};
  font-family: ${fonts.family.SFProText};
  line-height: 1.25;
  letter-spacing: -0.2px;
  opacity: 0;
`;

let timeout = null;

class CopyToClipboard extends Component {
  copyToCopyToClipboard = ({ target }) => {
    clearTimeout(timeout);
    target.select();
    document.execCommand('Copy');
    target.blur();
    this.props.notificationShow(`Address copied to clipboard`);
  };
  render() {
    const { notificationShow, iconOnHover, text, ...props } = this.props;
    return (
      <StyledCopyToClipboard iconOnHover={iconOnHover} {...props}>
        <StyledContainer>
          <StyledInvisible>{text}</StyledInvisible>
          <StyledInput value={text} onChange={() => {}} onClick={this.copyToCopyToClipboard} />
          <StyledText>Click to copy to clipboard</StyledText>
          <StyledIcon src={clipboardIcon} alt="copy" />
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
