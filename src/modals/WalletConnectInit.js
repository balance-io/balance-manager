import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import lang from '../languages';
import Card from '../components/Card';
import QRCodeDisplay from '../components/QRCodeDisplay';
import Button from '../components/Button';
import { modalClose } from '../reducers/_modal';
import {
  walletConnectInit,
  walletConnectGetAddress,
  walletConnectClearFields
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

const StyledQRCodeDisplay = styled(QRCodeDisplay)`
  margin: 35px auto;
`;

const StyledCenter = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

class WalletConnectInit extends Component {
  componentDidMount() {
    this.props.walletConnectInit();
  }
  onClose = () => {
    this.props.modalClose();
    this.props.walletConnectClearFields();
  };
  render = () => (
    <Card maxWidth={400} background="white">
      <StyledContainer>
        {this.props.sessionToken && (
          <StyledQRCodeDisplay
            data={`{"domain":"https://walletconnect.balance.io","sessionToken":"${
              this.props.sessionToken
            }","publicKey":"${this.props.keypair.publicKey}"}`}
          />
        )}
        <StyledCenter>
          <Button color="walletconnect" onClick={this.onClose}>
            {lang.t('button.cancel')}
          </Button>
        </StyledCenter>
      </StyledContainer>
    </Card>
  );
}

WalletConnectInit.propTypes = {
  walletConnectInit: PropTypes.func.isRequired,
  walletConnectGetAddress: PropTypes.func.isRequired,
  modalClose: PropTypes.func.isRequired,
  sessionToken: PropTypes.string.isRequired
};

const reduxProps = ({ modal, walletconnect }) => ({
  sessionToken: walletconnect.sessionToken
});

export default connect(reduxProps, {
  modalClose,
  walletConnectInit,
  walletConnectGetAddress,
  walletConnectClearFields
})(WalletConnectInit);
