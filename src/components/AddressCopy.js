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

const StyledAddress = styled.div`
  width: 100%;
  position: relative;
  @media (hover: hover) {
    &:hover ${StyledIcon} {
      opacity: ${({ textHover }) => (textHover ? '0' : '1')};
    }
    &:hover ${StyledText} {
      opacity: ${({ textHover }) => (textHover ? '0.7' : '0')};
    }
  }
`;

const StyledInput = styled.input`
  width: 100%;
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
  line-height: 1.25;
  margin: 0.2em 0;
  letter-spacing: -0.2px;
  color: transparent;
  text-shadow: 0 0 0 rgb(${colors.dark});
  font-weight: ${fonts.weight.semibold};
  font-size: ${fonts.size.medium};
  font-family: ${fonts.family.SFProText};
  @media screen and (${responsive.sm.max}) {
    font-size: ${fonts.size.small};
  }
  @media screen and (${responsive.xs.max}) {
    font-size: ${fonts.size.tiny};
  }
`;

let timeout = null;

class Clipboard extends Component {
  copyToClipboard = ({ target }) => {
    clearTimeout(timeout);
    target.select();
    document.execCommand('Copy');
    target.blur();
    this.props.notificationShow(`Address copied to clipboard`);
  };
  render() {
    const { notificationShow, textHover, address, ...props } = this.props;
    return (
      <StyledAddress textHover={textHover}>
        <StyledInput
          value={address}
          onChange={() => {}}
          onClick={this.copyToClipboard}
          {...props}
        />
        <StyledText>Click to copy to clipboard</StyledText>
        <StyledIcon src={clipboardIcon} alt="copy" />
      </StyledAddress>
    );
  }
}

Clipboard.propTypes = {
  notificationShow: PropTypes.func.isRequired,
  address: PropTypes.string.isRequired
};

export default connect(null, { notificationShow })(Clipboard);
