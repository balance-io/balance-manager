import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import lang from '../languages';
import Card from '../components/Card';
import CopyToClipboard from '../components/CopyToClipboard';
import QRCodeDisplay from '../components/QRCodeDisplay';
import Button from '../components/Button';
import arrowUp from '../assets/arrow-up.svg';
import { modalClose } from '../reducers/_modal';
import { capitalize } from '../helpers/utilities';
import { fonts, colors, responsive } from '../styles';

const StyledContainer = styled.div`
  width: 100%;
  padding: 22px;
  @media screen and (${responsive.sm.max}) {
    padding: 15px;
    & h4 {
      margin: 20px auto;
    }
  }
`;

const StyledQRCodeDisplay = styled(QRCodeDisplay)`
  margin: 35px auto;
`;

const StyledIcon = styled.div`
  width: 14px;
  height: 14px;
  transform: ${({ rotation }) => (rotation ? `rotate(${rotation}deg)` : 'rotate(0deg)')};
  mask: ${({ icon }) => (icon ? `url(${icon}) center no-repeat` : 'none')};
  mask-size: 90%;
  background-color: ${({ color }) => (color ? `rgb(${colors[color]})` : `rgb(${colors.dark})`)};
`;

const StyledSubTitle = styled.div`
  display: flex;
  align-items: center;
  color: rgb(${colors.grey});
  font-size: ${fonts.size.h6};
  font-weight: ${fonts.weight.semibold};
  width: 100%;
  & ${StyledIcon} {
    margin-right: 5px;
  }
`;

const StyledJustifyContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledCopyToClipboard = styled(CopyToClipboard)`
  font-weight: ${fonts.weight.semibold};
  text-align: center;
  letter-spacing: 2px;
  background: rgb(${colors.white});
  border-radius: 8px;
  margin: 15px auto;
  padding: 12px 18px;
  & input {
    color: transparent;
    text-shadow: 0 0 0 rgba(${colors.darkGrey});
  }
  @media screen and (${responsive.sm.max}) {
    font-size: 3vw;
    letter-spacing: 0;
    padding: 12px;
  }
`;

class ReceiveModal extends Component {
  onClose = () => {
    this.props.modalClose();
  };
  render = () => (
    <Card background="lightGrey">
      <StyledContainer>
        <StyledJustifyContent>
          <StyledSubTitle>
            <StyledIcon color="grey" icon={arrowUp} rotation={180} />
            {lang.t('modal.receive_title', { walletName: capitalize(this.props.modalProps.name) })}
          </StyledSubTitle>
          <Button onClick={this.onClose}>{lang.t('button.close')}</Button>
        </StyledJustifyContent>
        <StyledQRCodeDisplay data={this.props.modalProps.address} />
        <StyledCopyToClipboard text={this.props.modalProps.address} />
      </StyledContainer>
    </Card>
  );
}

ReceiveModal.propTypes = {
  modalClose: PropTypes.func.isRequired,
  modalProps: PropTypes.object.isRequired
};

const reduxProps = ({ modal }) => ({
  modalProps: modal.modalProps
});

export default connect(reduxProps, {
  modalClose
})(ReceiveModal);
