import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { lang } from 'balance-common';
import Card from '../components/Card';
import Loader from '../components/Loader';
import QRCodeDisplay from '../components/QRCodeDisplay';
import Button from '../components/Button';
import { modalClose } from '../reducers/_modal';
import {
  walletConnectModalInit,
  walletConnectClearFields,
} from '../reducers/_walletconnect';
import { responsive } from '../styles';

const StyledCard = styled(Card)`
  margin: 0 16px;
  max-height: 500px;
`;

const StyledContainer = styled.div`
  padding: 0 0 16px;
`;

const StyledQRCodeWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledQRCodeDisplay = styled(QRCodeDisplay)`
  margin: 0 auto;
`;

const StyledCenter = styled.div`
  text-align: center;
`;

class WalletConnectModal extends Component {
  constructor(props) {
    super(props);
    this.isSmallScreen = window.innerWidth < 530;
  }
  componentDidMount() {
    this.props.walletConnectModalInit();
  }
  onClose = () => {
    this.props.walletConnectClearFields();
    this.props.modalClose();
  };

  render = () => {
    const { qrcode } = this.props;
    return (
      <StyledCard maxWidth={this.isSmallScreen ? 305 : 427} background="white">
        <StyledContainer>
          <StyledQRCodeWrapper>
            {qrcode ? (
              <StyledQRCodeDisplay
                data={qrcode}
                scale={this.isSmallScreen ? 5 : 7}
              />
            ) : (
              <Loader color="dark" background="white" />
            )}
          </StyledQRCodeWrapper>
          <StyledCenter>
            <Button
              color="walletconnect"
              hoverColor="walletconnectHover"
              activeColor="walletconnectActive"
              onClick={this.onClose}
            >
              {lang.t('button.close')}
            </Button>
          </StyledCenter>
        </StyledContainer>
      </StyledCard>
    );
  };
}

WalletConnectModal.propTypes = {
  walletConnectModalInit: PropTypes.func.isRequired,
  modalClose: PropTypes.func.isRequired,
};

const reduxProps = ({ modal, walletconnect }) => ({
  qrcode: walletconnect.qrcode,
});

export default connect(
  reduxProps,
  {
    modalClose,
    walletConnectModalInit,
    walletConnectClearFields,
  },
)(WalletConnectModal);
