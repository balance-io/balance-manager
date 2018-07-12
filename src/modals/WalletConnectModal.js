import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import lang from '../languages';
import Card from '../components/Card';
import Loader from '../components/Loader';
import QRCodeDisplay from '../components/QRCodeDisplay';
import Button from '../components/Button';
import { modalClose } from '../reducers/_modal';
import {
  walletConnectModalInit,
  walletConnectGetSession,
  walletConnectClearFields,
} from '../reducers/_walletconnect';
import { responsive } from '../styles';

const StyledContainer = styled.div`
  padding: 22px;
  @media screen and (${responsive.sm.max}) {
    padding: 15px;
    & h4 {
      margin: 20px auto;
    }
  }
`;

const StyledQRCodeWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 500px;
`;

const StyledQRCodeDisplay = styled(QRCodeDisplay)`
  margin: 35px auto;
`;

const StyledCenter = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

class WalletConnectModal extends Component {
  componentDidMount() {
    this.props.walletConnectModalInit();
  }
  onClose = () => this.props.walletConnectClearFields();

  render = () => {
    const { qrcode } = this.props;
    return (
      <Card maxWidth={500} background="white">
        <StyledContainer>
          <StyledQRCodeWrapper>
            {qrcode ? (
              <StyledQRCodeDisplay data={qrcode} />
            ) : (
              <Loader color="dark" background="white" />
            )}
          </StyledQRCodeWrapper>
          <StyledCenter>
            <Button color="walletconnect" onClick={this.onClose}>
              {lang.t('button.close')}
            </Button>
          </StyledCenter>
        </StyledContainer>
      </Card>
    );
  };
}

WalletConnectModal.propTypes = {
  walletConnectModalInit: PropTypes.func.isRequired,
  walletConnectGetSession: PropTypes.func.isRequired,
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
    walletConnectGetSession,
    walletConnectClearFields,
  },
)(WalletConnectModal);
