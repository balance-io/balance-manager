import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Card from '../components/Card';
import QRCodeDisplay from '../components/QRCodeDisplay';
import Button from '../components/Button';
import arrowUp from '../assets/arrow-up.svg';
import { fonts, colors, responsive } from '../styles';

const StyledContainer = styled.div`
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

const StyledAddress = styled.div`
  font-weight: ${fonts.weight.semibold};
  text-align: center;
  letter-spacing: 2px;
  background: rgb(${colors.white});
  border-radius: 8px;
  margin: 15px auto;
  padding: 12px 18px;
  @media screen and (${responsive.sm.max}) {
    font-size: 3vw;
    letter-spacing: 0;
    padding: 12px;
  }
`;

class ReceiveEtherModal extends Component {
  onClose = () => {
    this.props.closeModal();
  };
  render = () => (
    <Card background="lightGrey">
      <StyledContainer>
        <StyledJustifyContent>
          <StyledSubTitle>
            <StyledIcon color="grey" icon={arrowUp} rotation={180} />
            {`Receive to ${this.props.modalProps.name}`}
          </StyledSubTitle>
          <Button onClick={this.onClose}>Close</Button>
        </StyledJustifyContent>
        <StyledQRCodeDisplay data={this.props.modalProps.address} />
        <StyledAddress>{this.props.modalProps.address}</StyledAddress>
      </StyledContainer>
    </Card>
  );
}

ReceiveEtherModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  modalProps: PropTypes.object.isRequired
};

export default ReceiveEtherModal;
