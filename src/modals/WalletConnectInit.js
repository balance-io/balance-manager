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
  wallletConnectModalInit,
  walletConnectGetAddress,
  wallletConnectClearFields
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
    this.props.wallletConnectModalInit();
  }
  onClose = () => {
    this.props.modalClose();
    this.props.wallletConnectClearFields();
  };
  render = () => (
    <Card background="white">
      <StyledContainer>
        {this.props.uuid && <StyledQRCodeDisplay data={this.props.uuid} />}
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
  wallletConnectModalInit: PropTypes.func.isRequired,
  walletConnectGetAddress: PropTypes.func.isRequired,
  modalClose: PropTypes.func.isRequired,
  fetching: PropTypes.bool.isRequired,
  uuid: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired
};

const reduxProps = ({ modal, walletconnect }) => ({
  fetching: walletconnect.fetching,
  uuid: walletconnect.uuid,
  address: walletconnect.address
});

export default connect(reduxProps, {
  modalClose,
  wallletConnectModalInit,
  walletConnectGetAddress,
  wallletConnectClearFields
})(WalletConnectInit);
