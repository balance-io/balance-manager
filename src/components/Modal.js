import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import Column from '../components/Column';
import SendEtherModal from '../modals/SendEtherModal';
import ReceiveEtherModal from '../modals/ReceiveEtherModal';
import { modalClose } from '../reducers/_modal';
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
  display: flex;
  align-items: center;
  justify-content: center;
`;

class Modal extends Component {
  modalController = () => {
    switch (this.props.modal) {
      case 'SEND_ETHER':
        return (
          <SendEtherModal modalProps={this.props.modalProps} closeModal={this.props.modalClose} />
        );
      case 'RECEIVE_ETHER':
        return (
          <ReceiveEtherModal
            modalProps={this.props.modalProps}
            closeModal={this.props.modalClose}
          />
        );
      default:
        return <div />;
    }
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
        <Column center>{this.modalController()}</Column>
      </StyledLightbox>
    );
  };
}

Modal.propTypes = {
  modalClose: PropTypes.func.isRequired,
  modal: PropTypes.string.isRequired,
  modalProps: PropTypes.object.isRequired
};

const reduxProps = ({ modal }) => ({
  modal: modal.modal,
  modalProps: modal.modalProps
});

export default connect(reduxProps, { modalClose })(Modal);
