import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  getSupressReminderRibbon,
  saveSupressReminderRibbon,
} from '../handlers/localstorage';
import cross from '../assets/cross.svg';
import { colors } from '../styles';

const StyledReminderRibbon = styled.div`
  will-change: height;
  height: ${({ show }) => (show ? '40px' : 0)};
  overflow: hidden;
  transition: height 0.5s ease;
  background: #647fe6;
`;

const StyledReminderRibbonCloseButton = styled.div`
  position: absolute;
  cursor: pointer;
  width: 18px;
  height: 18px;
  top: 12px;
  right: 16px;
  background-color: rgb(${colors.white});
  mask: url(${cross}) center no-repeat;
  mask-size: 90%;
`;

const StyledReminderRibbonContent = styled.div`
  position: relative;
  margin: 0 auto;
  max-width: ${({ maxWidth }) => `${maxWidth}px`};
`;

const StyledReminderRibbonMessage = styled.div`
  position: absolute;
  line-height: 40px;
  margin: 0 16px;
`;

class ReminderRibbon extends Component {
  state = {
    show: false,
  };

  componentDidMount() {
    getSupressReminderRibbon()
      .then(suppressReminder => {
        this.setState({ show: !suppressReminder });
      })
      .catch(error => {
        this.setState({ show: true });
      });
  }

  onClose = () => {
    this.setState({ show: false });
    saveSupressReminderRibbon(true);
  };

  bookmarkReminder = () => {
    if (typeof window.orientation !== 'undefined') {
      return 'Bookmark to protect against phishing attacks';
    } else {
      if (window.navigator.platform === 'MacIntel') {
        return '⌘+D to bookmark Balance Manager and protect yourself from phishing attacks';
      } else {
        return 'CTRL+D to bookmark Balance Manager and protect yourself from phishing attacks';
      }
    }
  };

  render = () => (
    <StyledReminderRibbon show={this.state.show}>
      <StyledReminderRibbonContent maxWidth={this.props.maxWidth}>
        <StyledReminderRibbonMessage>
          {this.bookmarkReminder()}
        </StyledReminderRibbonMessage>
        <StyledReminderRibbonCloseButton onClick={this.onClose} />
      </StyledReminderRibbonContent>
    </StyledReminderRibbon>
  );
}

ReminderRibbon.propTypes = {
  maxWidth: PropTypes.number,
};

ReminderRibbon.defaultProps = {
  maxWidth: 600,
};

export default ReminderRibbon;
