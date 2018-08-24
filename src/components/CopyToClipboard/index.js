import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { lang } from 'balance-common';
import clipboardIcon from '../../assets/clipboard.png';
import { toChecksumAddress } from 'balance-common';
import { notificationShow } from '../../reducers/_notification';
import {
  StyledCopyToClipboard,
  StyledInput,
  StyledText,
  StyledIcon,
} from './styles';

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
    let {
      displayIcon,
      iconOnHover,
      isTopAddress,
      notificationShow,
      text,
      ...props
    } = this.props;

    text = toChecksumAddress(text);

    return (
      <StyledCopyToClipboard {...props} iconOnHover={iconOnHover}>
        <StyledInput
          value={text}
          spellCheck={false}
          isTopAddress={isTopAddress}
          onChange={() => {}}
          onClick={this.copyToCopyToClipboard}
        />
        <StyledText>{lang.t('message.click_to_copy_to_clipboard')}</StyledText>
        <StyledIcon
          src={clipboardIcon}
          alt="copy"
          onClick={this.simulateCopyToClipboard}
          displayIcon={displayIcon}
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
  displayIcon: false,
  iconOnHover: false,
  isTopAddress: false,
};

export default connect(
  null,
  { notificationShow },
)(CopyToClipboard);
