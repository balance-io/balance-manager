import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';

import Column from '../components/Column';

import ExchangeModal from './ExchangeModal';
import SendModal from './SendModal';
import ReceiveModal from './ReceiveModal';
import DonateModal from './DonateModal';
import WalletConnectModal from './WalletConnectModal';
import { modalClose } from '../reducers/_modal';
import { sendClearFields } from 'balance-common';
import { exchangeClearFields } from '../reducers/_exchange';

import { colors, transitions } from '../styles';

const StyledLightbox = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  transition: ${transitions.base};
  opacity: ${({ modal }) => (modal ? 1 : 0)};
  visibility: ${({ modal }) => (modal ? 'visible' : 'hidden')};
  pointer-events: ${({ modal }) => (modal ? 'auto' : 'none')};
  background: rgba(${colors.dark}, 0.2);
`;

const StyledHitbox = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const StyledContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const reduxProps = ({ modal }) => ({
  modal: modal.modal,
});

class Modal extends Component {
  static propTypes = {
    modalClose: PropTypes.func.isRequired,
    sendClearFields: PropTypes.func.isRequired,
    exchangeClearFields: PropTypes.func.isRequired,
    modal: PropTypes.string.isRequired,
  };

  modalController = () => {
    switch (this.props.modal) {
      case 'EXCHANGE_MODAL':
        return <ExchangeModal />;
      case 'SEND_MODAL':
        return <SendModal />;
      case 'DONATION_MODAL':
        return <DonateModal />;
      case 'RECEIVE_MODAL':
        return <ReceiveModal />;
      case 'WALLET_CONNECT':
        return <WalletConnectModal />;
      default:
        return <div />;
    }
  };

  onClose = () => {
    this.props.sendClearFields();
    this.props.exchangeClearFields();
    this.props.modalClose();
  };

  render = () => {
    const body = document.body || document.getElementsByTagName('body')[0];

    if (this.props.modal) {
      body.style.overflow = 'hidden';
    } else {
      body.style.overflow = 'auto';
    }

    return (
      <StyledLightbox modal={this.props.modal}>
        <StyledContainer>
          <StyledHitbox onClick={this.onClose} />
          <Column center>{this.modalController()}</Column>
        </StyledContainer>
      </StyledLightbox>
    );
  };
}

export default connect(
  reduxProps,
  {
    modalClose,
    sendClearFields,
    exchangeClearFields,
  },
)(Modal);
