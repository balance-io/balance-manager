import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { saveLocal, getLocal } from '../handlers/localstorage';

const StyledReminderRibbon = styled.div`
  will-change: height;
  height: 0px;
  overflow: hidden;
  transition: height .5s ease;
  background: #647fe6;
`;

const StyledReminderRibbonCloseButton = styled.div`
  position: absolute;
  right: 0;
  height: 100%;
  cursor: pointer;
  width: 30px;
  color: white;
  height: 30px;
  top: 14px;
`;

const StyledReminderRibbonContent = styled.div`
  position: relative;
  margin: 0 auto;
`;

const StyledReminderRibbonMessage = styled.div`
  position: absolute;
  line-height: 38px;
  padding-left: 10px;
  margin-right: 35px;
`;

class ReminderRibbon extends Component {
  state = {
    show: !getLocal('supressreminderribbon')
  }

  ribbonController = () => {
    return (
      <StyledReminderRibbon style={{height: (this.state.show ? '40px' : '0')}}>
        <StyledReminderRibbonContent style={{maxWidth: this.props.maxWidth}}>
          <StyledReminderRibbonMessage>
            {this.bookmarkReminder()}
          </StyledReminderRibbonMessage>
          <StyledReminderRibbonCloseButton>
            <svg onClick={this.onClose} viewPort="0 0 12 12">
              <line x1="1" y1="11" x2="11" y2="1" stroke="white" stroke-width="2"/>
              <line x1="1" y1="1" x2="11" y2="11" stroke="white" stroke-width="2"/>
            </svg>
          </StyledReminderRibbonCloseButton>
        </StyledReminderRibbonContent>
      </StyledReminderRibbon>
    )

  };

  onClose = () => {
    this.setState({
      show: false
    });

    saveLocal('supressreminderribbon', true);
  };

  bookmarkReminder = () => {
    // Orientation only exists on mobile browsers. If not undefined, we are on mobile
    if (typeof window.orientation !== 'undefined') {
      return "Bookmark to protect against phishing attacks";
    } else {
      if(window.navigator.platform === 'MacIntel') {
        return "⌘+D to bookmark Balance Manager and protect yourself from phishing attacks";
      } else {
        return "CTRL+D to bookmark Balance Manger and protect yourself from phishing attacks";
      }

    }

  }

  render = () => {
    return this.ribbonController();
  };

}

ReminderRibbon.propTypes = {
  maxWidth: PropTypes.number
};

ReminderRibbon.defaultProps = {
  maxWidth: 600
};

export default ReminderRibbon;
