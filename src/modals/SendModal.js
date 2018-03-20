import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import BigNumber from 'bignumber.js';
import lang from '../languages';
import QRCodeReader from '../components/QRCodeReader';
import Card from '../components/Card';
import Input from '../components/Input';
import LineBreak from '../components/LineBreak';
import DropdownCrypto from '../components/DropdownCrypto';
import Button from '../components/Button';
import Form from '../components/Form';
import MetamaskLogo from '../components/MetamaskLogo';
import LedgerLogo from '../components/LedgerLogo';
import TrezorLogo from '../components/TrezorLogo';
import convertSymbol from '../assets/convert-symbol.svg';
import arrowUp from '../assets/arrow-up.svg';
import qrIcon from '../assets/qr-code-bnw.png';
import { modalClose } from '../reducers/_modal';
import {
  sendGetGasPrices,
  sendUpdateGasPrice,
  sendEtherMetamask,
  sendEtherClient,
  sendTokenMetamask,
  sendTokenClient,
  sendClearFields,
  sendUpdateRecipient,
  sendUpdateNativeAmount,
  sendUpdateCryptoAmount,
  sendUpdatePrivateKey,
  sendUpdateSelected,
  sendToggleConfirmationView
} from '../reducers/_send';
import { notificationShow } from '../reducers/_notification';
import { isValidAddress } from '../helpers/validators';
import {
  toWei,
  fromWei,
  convertToNativeString,
  getTimeString,
  capitalize
} from '../helpers/utilities';
import { fonts, colors } from '../styles';

const StyledSuccessMessage = styled.div`
  padding: 22px;
  & a {
    text-decoration: underline;
    font-weight: ${fonts.weight.semibold};
  }
  & > *:nth-child(n + 2) {
    margin-top: 24px;
  }
`;

const StyledIcon = styled.div`
  width: 14px;
  height: 14px;
  mask: ${({ icon }) => (icon ? `url(${icon}) center no-repeat` : 'none')};
  mask-size: 90%;
  background-color: ${({ color }) => (color ? `rgb(${colors[color]})` : `rgb(${colors.dark})`)};
`;

const StyledFlex = styled.div`
  display: flex;
  position: relative;
  transform: none;
`;

const StyledBottomModal = styled(StyledFlex)`
  & p {
    font-size: ${fonts.size.h6};
  }
  & > * {
    width: 100%;
  }
`;

const StyledParagraph = styled.p`
  margin: 10px 0;
  color: rgb(${colors.grey});
  font-weight: ${fonts.weight.medium};
`;

const StyledHash = styled.p`
  font-size: ${fonts.size.small};
  font-weight: 600;
  text-align: center;
  letter-spacing: -0.4px;
  background: rgb(${colors.white});
  border-radius: 8px;
  margin: 0 auto;
  padding: 12px 18px;
`;

const StyledQRIcon = styled.div`
  position: absolute;
  right: 22px;
  bottom: 0;
  width: 43px;
  border-radius: 0 8px 8px 0;
  height: 43px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  margin: 0;
  background-color: rgb(${colors.lightGrey});
  & img {
    width: 100%;
    height: 100%;
    border-radius: 4px;
  }
  @media (hover: hover) {
    &:hover {
      opacity: 0.6;
    }
  }
`;

const StyledAmountCurrency = styled.div`
  position: absolute;
  bottom: 12px;
  right: 12px;
  font-size: ${fonts.size.medium};
  color: rgba(${colors.darkGrey}, 0.7);
`;

const StyledConversionSymbol = styled.div`
  width: 46px;
  position: relative;
  & img {
    width: 20px;
    position: absolute;
    bottom: 12px;
    left: calc(50% - 10px);
  }
`;

const StyledGasOptions = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0;
  & button {
    background-color: transparent;
    box-shadow: none;
    color: rgb(${colors.darkGrey});
    height: 64px;
    margin: 0;
    border-radius: 0;
    &:hover,
    &:active,
    &:focus {
      box-shadow: none !important;
      outline: none !important;
    }
  }
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

const StyledGasButton = styled(Button)`
  width: 100%;
  height: 54px;
  & p {
    margin-top: 2px;
  }
  & p:first-child {
    font-weight: 500;
  }
  & p:last-child {
    font-weight: 400;
    font-size: 12px;
  }
`;

const StyledInvalidAddress = styled.p`
  position: absolute;
  top: 0;
  right: 0;
  margin: 22px;
  line-height: 1.8em;
  font-size: ${fonts.size.small};
  font-weight: ${fonts.weight.medium};
  color: rgba(${colors.red});
  @media (hover: hover) {
    &:hover {
      opacity: 0.6;
    }
  }
`;

const StyledMaxBalance = styled.p`
  position: absolute;
  cursor: pointer;
  top: 0;
  right: 0;
  line-height: 1.8em;
  font-size: ${fonts.size.small};
  font-weight: ${fonts.weight.medium};
  color: rgba(${colors.blue}, 0.8);
  @media (hover: hover) {
    &:hover {
      opacity: 0.6;
    }
  }
`;

const StyledApproveTransaction = styled.div`
  padding: 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
  & > div {
    margin-top: 15px;
  }
  & > p {
    margin-top: 32px;
  }
`;

const StyledActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${({ single }) => (single ? `center` : `space-between`)};
  & button {
    margin: 0 5px;
  }
`;

class SendModal extends Component {
  componentDidMount() {
    this.props.sendGetGasPrices();
  }
  state = {
    isValidAddress: false,
    showQRCodeReader: false,
    QRCodeReaderTarget: ''
  };
  componentWillReceiveProps(newProps) {
    if (newProps.recipient.length >= 42) {
      if (newProps.selected.symbol !== this.props.selected.symbol) {
        this.props.sendUpdateGasPrice();
      } else if (newProps.recipient !== this.props.recipient) {
        this.props.sendUpdateGasPrice();
      } else if (newProps.cryptoAmount !== this.props.cryptoAmount) {
        this.props.sendUpdateGasPrice();
      }
    }
  }
  onChangeSelected = value => {
    let selected = this.props.modalProps.crypto.filter(crypto => crypto.symbol === 'ETH')[0];
    if (value !== 'ETH') {
      selected = this.props.modalProps.crypto.filter(crypto => crypto.symbol === value)[0];
    }
    this.props.sendUpdateSelected(selected);
  };
  onAddressInputFocus = () => this.setState({ isValidAddress: true });
  onAddressInputBlur = () =>
    this.setState({ isValidAddress: isValidAddress(this.props.recipient) });
  onGoBack = () => {
    if (this.props.modalProps.type === 'COLD') {
      this.props.sendUpdatePrivateKey('');
    }
    this.props.sendToggleConfirmationView(false);
  };
  onSendEntireBalance = () => {
    if (this.props.selected.symbol === 'ETH') {
      const ethereum = this.props.modalProps.crypto.filter(crypto => crypto.symbol === 'ETH')[0];
      const balanceWei = toWei(ethereum.balance);
      const txFeeWei = toWei(this.props.txFee);
      const remaining = balanceWei - txFeeWei;
      const ether = fromWei(remaining < 0 ? 0 : remaining);
      this.props.sendUpdateCryptoAmount(ether, 'ETH', this.props.modalProps.prices);
    } else {
      this.props.sendUpdateCryptoAmount(
        this.props.selected.balance.replace(/[^0-9.]/gi, ''),
        this.props.selected.symbol,
        this.props.modalProps.prices
      );
    }
  };
  onSendAnother = () => {
    this.props.sendGetGasPrices();
    this.props.sendToggleConfirmationView(false);
    this.props.sendClearFields();
  };
  onSubmit = e => {
    e.preventDefault();
    const request = {
      address: this.props.modalProps.address,
      recipient: this.props.recipient,
      amount: this.props.cryptoAmount,
      privateKey: this.props.privateKey,
      tokenObject: this.props.selected,
      gasPrice: this.props.gasPrice
    };
    if (this.props.modalProps.type === 'METAMASK') {
      if (this.props.selected.symbol === 'ETH') {
        this.props.sendEtherMetamask(request);
      } else {
        this.props.sendTokenMetamask(request);
      }
      this.props.sendToggleConfirmationView(true);
    } else if (!this.props.confirm) {
      if (!isValidAddress(this.props.recipient)) {
        this.props.notificationShow(lang.t('notification.error.invalid_address'), true);
        return;
      } else if (this.props.selected.symbol === 'ETH') {
        const balance = Number(this.props.modalProps.balance);
        const requestedAmount = Number(this.props.cryptoAmount);
        const includingFees = requestedAmount + Number(this.props.txFee);
        if (requestedAmount > balance) {
          this.props.notificationShow(lang.t('notification.error.insufficient_balance'), true);
          return;
        } else if (includingFees > balance) {
          this.props.notificationShow(lang.t('notification.error.insufficient_for_fees'), true);
          return;
        }
      } else {
        const etherBalance = Number(this.props.modalProps.balance);
        const tokenBalance = this.props.selected.balance;
        const requestedAmount = Number(this.props.cryptoAmount);
        const includingFees = Number(this.props.txFee);
        if (requestedAmount > tokenBalance) {
          this.props.notificationShow(lang.t('notification.error.insufficient_balance'), true);
          return;
        } else if (includingFees > etherBalance) {
          this.props.notificationShow(lang.t('notification.error.insufficient_for_fees'), true);
          return;
        }
      }
      this.props.sendToggleConfirmationView(true);
    } else {
      if (this.props.selected.symbol === 'ETH') {
        this.props.sendEtherClient(request);
      } else {
        this.props.sendTokenClient(request);
      }
    }
  };
  toggleQRCodeReader = target =>
    this.setState({ showQRCodeReader: !this.state.showQRCodeReader, QRCodeReaderTarget: target });
  onQRCodeValidate = rawData => {
    if (this.state.QRCodeReaderTarget === 'recipient') {
      const data = rawData.match(/0x\w{40}/g) ? rawData.match(/0x\w{40}/g)[0] : null;
      const result = data ? isValidAddress(data) : false;
      const onError = () =>
        this.props.notificationShow(lang.t('notification.error.invalid_address_scanned'), true);
      return { data, result, onError };
    } else if (this.state.QRCodeReaderTarget === 'privateKey') {
      const data = rawData.match(/0x\w{64}/g) ? rawData.match(/0x\w{64}/g)[0] : null;
      const result = !!data;
      const onError = () =>
        this.props.notificationShow(lang.t('notification.error.invalid_private_key_scanned'), true);
      return { data, result, onError };
    }
  };
  onQRCodeScan = data => {
    if (this.state.QRCodeReaderTarget === 'recipient') {
      this.props.sendUpdateRecipient(data);
    } else if (this.state.QRCodeReaderTarget === 'privateKey') {
      this.props.sendUpdatePrivateKey(data);
    }
    this.setState({ showQRCodeReader: false, QRCodeReaderTarget: '' });
  };
  onQRCodeError = () => {
    this.props.notificationShow(lang.t('notification.error.failed_scanning_qr_code'), true);
  };
  onClose = () => {
    this.props.sendClearFields();
    this.props.modalClose();
  };
  render = () => {
    return (
      <Card background="lightGrey">
        {!this.props.transaction ? (
          !this.props.confirm ? (
            <Form onSubmit={this.onSubmit}>
              <StyledSubTitle>
                <StyledIcon color="grey" icon={arrowUp} />
                {lang.t('modal.receive_title', {
                  walletName: capitalize(this.props.modalProps.name)
                })}
              </StyledSubTitle>

              <div>
                <DropdownCrypto
                  selected={this.props.selected.symbol}
                  crypto={this.props.modalProps.crypto}
                  onChange={this.onChangeSelected}
                />
              </div>

              <StyledFlex>
                <Input
                  monospace
                  label={lang.t('input.recipient_address')}
                  spellCheck="false"
                  placeholder="0x..."
                  type="text"
                  value={this.props.recipient}
                  onFocus={this.onAddressInputFocus}
                  onBlur={this.onAddressInputBlur}
                  onChange={({ target }) =>
                    this.props.sendUpdateRecipient(target.value, this.props.selected.symbol)
                  }
                />
                {this.props.recipient &&
                  !this.state.isValidAddress && (
                    <StyledInvalidAddress>{lang.t('modal.invalid_address')}</StyledInvalidAddress>
                  )}
                <StyledQRIcon onClick={() => this.toggleQRCodeReader('recipient')}>
                  <img src={qrIcon} alt="recipient" />
                </StyledQRIcon>
              </StyledFlex>

              <StyledFlex>
                <StyledFlex>
                  <Input
                    monospace
                    label={lang.t('input.crypto_amount')}
                    placeholder="0.0"
                    type="text"
                    value={this.props.cryptoAmount}
                    onChange={({ target }) =>
                      this.props.sendUpdateCryptoAmount(
                        target.value,
                        this.props.selected.symbol,
                        this.props.modalProps.prices
                      )
                    }
                  />
                  <StyledMaxBalance onClick={this.onSendEntireBalance}>
                    {lang.t('modal.maximum_balance')}
                  </StyledMaxBalance>
                  <StyledAmountCurrency>{this.props.selected.symbol}</StyledAmountCurrency>
                </StyledFlex>
                <StyledFlex>
                  <StyledConversionSymbol>
                    <img src={convertSymbol} alt="conversion" />
                  </StyledConversionSymbol>
                </StyledFlex>
                <StyledFlex>
                  <Input
                    monospace
                    placeholder="0.0"
                    type="text"
                    value={this.props.nativeAmount}
                    onChange={({ target }) =>
                      this.props.sendUpdateNativeAmount(
                        target.value,
                        this.props.selected.symbol,
                        this.props.modalProps.prices
                      )
                    }
                  />
                  <StyledAmountCurrency>{this.props.modalProps.prices.native}</StyledAmountCurrency>
                </StyledFlex>
              </StyledFlex>

              {this.props.modalProps.type === 'COLD' && (
                <StyledFlex>
                  <Input
                    monospace
                    placeholder={lang.t('input.private_key')}
                    type="text"
                    value={this.props.privateKey}
                    onChange={({ target }) => this.props.sendUpdatePrivateKey(target.value)}
                  />
                  <StyledQRIcon onClick={() => this.toggleQRCodeReader('privateKey')}>
                    <img src={qrIcon} alt="privateKey" />
                  </StyledQRIcon>
                </StyledFlex>
              )}
              <LineBreak
                color={
                  this.props.gasPriceOption === 'safeLow'
                    ? 'red'
                    : this.props.gasPriceOption === 'average' ? 'gold' : 'lightGreen'
                }
                percentage={
                  this.props.gasPriceOption === 'safeLow'
                    ? 33
                    : this.props.gasPriceOption === 'average' ? 66 : 100
                }
              />
              <StyledGasOptions>
                <StyledGasButton dark onClick={() => this.props.sendUpdateGasPrice('safeLow')}>
                  <p>{`${lang.t('modal.gas_slow')}: ${convertToNativeString(
                    fromWei((this.props.gasPrices.safeLow || 0) * 21000 * 10 ** 9),
                    'ETH',
                    this.props.modalProps.prices
                  )}`}</p>
                  <p>{`~ ${getTimeString(this.props.gasPrices.safeLowWait || 0, 'minutes')}`}</p>
                </StyledGasButton>
                <StyledGasButton dark onClick={() => this.props.sendUpdateGasPrice('average')}>
                  <p>{`${lang.t('modal.gas_average')}: ${convertToNativeString(
                    fromWei((this.props.gasPrices.average || 0) * 21000 * 10 ** 9),
                    'ETH',
                    this.props.modalProps.prices
                  )}`}</p>
                  <p>{`~ ${getTimeString(this.props.gasPrices.avgWait || 0, 'minutes')}`}</p>
                </StyledGasButton>
                <StyledGasButton dark onClick={() => this.props.sendUpdateGasPrice('fast')}>
                  <p>{`${lang.t('modal.gas_fast')}: ${convertToNativeString(
                    fromWei((this.props.gasPrices.fast || 0) * 21000 * 10 ** 9),
                    'ETH',
                    this.props.modalProps.prices
                  )}`}</p>
                  <p>{`~ ${getTimeString(this.props.gasPrices.fastWait || 0, 'minutes')}`}</p>
                </StyledGasButton>
              </StyledGasOptions>
              <LineBreak noMargin />
              <StyledBottomModal>
                <StyledActions>
                  <Button onClick={this.onClose}>{lang.t('button.cancel')}</Button>
                  <StyledParagraph>
                    {`${lang.t('modal.gas_fee')}:`}
                    {this.props.txFee
                      ? ` ${BigNumber(this.props.txFee).toFormat(6)} ETH (${convertToNativeString(
                          this.props.txFee,
                          'ETH',
                          this.props.modalProps.prices
                        )})`
                      : ` 0.000000 ETH ($0.00)`}
                  </StyledParagraph>
                  <Button
                    left
                    color="blue"
                    icon={arrowUp}
                    disabled={
                      this.props.recipient.length !== 42 ||
                      (this.props.selected.symbol !== 'ETH' && !Number(this.props.cryptoAmount)) ||
                      (this.props.modalProps.type === 'COLD' && this.props.privateKey.length < 64)
                    }
                    type="submit"
                  >
                    {lang.t('button.send')}
                  </Button>
                </StyledActions>
              </StyledBottomModal>
              {this.state.showQRCodeReader && (
                <QRCodeReader
                  onValidate={this.onQRCodeValidate}
                  onScan={this.onQRCodeScan}
                  onError={this.onQRCodeError}
                  onClose={() => this.toggleQRCodeReader('')}
                />
              )}
            </Form>
          ) : this.props.modalProps.type !== 'COLD' ? (
            <StyledApproveTransaction>
              {(() => {
                switch (this.props.modalProps.type) {
                  case 'METAMASK':
                    return <MetamaskLogo />;
                  case 'LEDGER':
                    return <LedgerLogo />;
                  case 'TREZOR':
                    return <TrezorLogo />;
                  default:
                    return <div />;
                }
              })()}
              <StyledParagraph>
                {lang.t('modal.approve_tx', { walletType: capitalize(this.props.modalProps.type) })}
              </StyledParagraph>
              <StyledActions single>
                <Button onClick={this.onClose}>{lang.t('button.close')}</Button>
              </StyledActions>
            </StyledApproveTransaction>
          ) : (
            <Form onSubmit={this.onSubmit}>
              <StyledSubTitle>
                <StyledIcon color="grey" icon={arrowUp} />
                {lang.t('modal.confirm_tx', { walletName: capitalize(this.props.modalProps.name) })}
              </StyledSubTitle>
              <div>
                <StyledParagraph>
                  <strong>{`${lang.t('modal.tx_confirm_sender')}:`}</strong>
                  {` ${this.props.modalProps.address}`}
                </StyledParagraph>
                <StyledParagraph>
                  <strong>{`${lang.t('modal.tx_confirm_recipient')}:`}</strong>
                  {` ${this.props.recipient}`}
                </StyledParagraph>
                <StyledParagraph>
                  <strong>{`${lang.t('modal.tx_confirm_amount')}:`}</strong>
                  {this.props.cryptoAmount &&
                    ` ${BigNumber(this.props.cryptoAmount).toFormat(6)} ${
                      this.props.selected.symbol
                    } ${
                      convertToNativeString(
                        this.props.cryptoAmount,
                        this.props.selected.symbol,
                        this.props.modalProps.prices
                      )
                        ? `(${convertToNativeString(
                            this.props.cryptoAmount,
                            this.props.selected.symbol,
                            this.props.modalProps.prices
                          )})`
                        : ``
                    }`}
                </StyledParagraph>
                <StyledParagraph>
                  <strong>{`${lang.t('modal.tx_confirm_fee')}:`}</strong>
                  {this.props.txFee &&
                    ` ${BigNumber(this.props.txFee).toFormat(6)} ETH (${convertToNativeString(
                      this.props.txFee,
                      'ETH',
                      this.props.modalProps.prices
                    )})`}
                </StyledParagraph>
              </div>

              <StyledActions>
                <Button onClick={this.onGoBack}>{lang.t('button.go_back')}</Button>
                <Button left color="blue" icon={arrowUp} type="submit">
                  {lang.t('button.send')}
                </Button>
              </StyledActions>
            </Form>
          )
        ) : (
          <StyledSuccessMessage>
            <StyledSubTitle>
              <StyledIcon color="grey" icon={arrowUp} />
              {`Success`}
            </StyledSubTitle>
            <div>
              <StyledParagraph>
                <strong>{`${lang.t('modal.tx_hash')}:`}</strong>
              </StyledParagraph>
              <StyledHash>{` ${this.props.transaction}`}</StyledHash>
            </div>
            <StyledParagraph>
              <a
                href={`https://${
                  this.props.web3Network !== 'mainnet' ? `${this.props.web3Network}.` : ''
                }etherscan.io/tx/${this.props.transaction}`}
                target="_blank"
              >
                {lang.t('modal.tx_verify')}
              </a>
            </StyledParagraph>
            <StyledActions>
              <Button onClick={this.onSendAnother}>{lang.t('button.send_another')}</Button>
              <Button color="red" onClick={this.onClose}>
                {lang.t('button.close')}
              </Button>
            </StyledActions>
          </StyledSuccessMessage>
        )}
      </Card>
    );
  };
}

SendModal.propTypes = {
  sendGetGasPrices: PropTypes.func.isRequired,
  sendUpdateGasPrice: PropTypes.func.isRequired,
  sendEtherMetamask: PropTypes.func.isRequired,
  sendEtherClient: PropTypes.func.isRequired,
  sendTokenMetamask: PropTypes.func.isRequired,
  sendTokenClient: PropTypes.func.isRequired,
  sendClearFields: PropTypes.func.isRequired,
  sendUpdateRecipient: PropTypes.func.isRequired,
  sendUpdateNativeAmount: PropTypes.func.isRequired,
  sendUpdateCryptoAmount: PropTypes.func.isRequired,
  sendUpdatePrivateKey: PropTypes.func.isRequired,
  sendUpdateSelected: PropTypes.func.isRequired,
  sendToggleConfirmationView: PropTypes.func.isRequired,
  notificationShow: PropTypes.func.isRequired,
  modalClose: PropTypes.func.isRequired,
  modalProps: PropTypes.object.isRequired,
  fetching: PropTypes.bool.isRequired,
  recipient: PropTypes.string.isRequired,
  nativeAmount: PropTypes.string.isRequired,
  cryptoAmount: PropTypes.string.isRequired,
  transaction: PropTypes.string.isRequired,
  privateKey: PropTypes.string.isRequired,
  selected: PropTypes.object.isRequired,
  fetchingGasPrices: PropTypes.bool.isRequired,
  gasPrices: PropTypes.object.isRequired,
  gasPrice: PropTypes.number.isRequired,
  gasPriceOption: PropTypes.string.isRequired,
  txFee: PropTypes.string.isRequired,
  confirm: PropTypes.bool.isRequired,
  web3Network: PropTypes.string.isRequired
};

const reduxProps = ({ modal, send, account }) => ({
  modalProps: modal.modalProps,
  fetching: send.fetching,
  recipient: send.recipient,
  nativeAmount: send.nativeAmount,
  cryptoAmount: send.cryptoAmount,
  transaction: send.transaction,
  privateKey: send.privateKey,
  selected: send.selected,
  fetchingGasPrices: send.fetchingGasPrices,
  gasPrices: send.gasPrices,
  gasPrice: send.gasPrice,
  gasPriceOption: send.gasPriceOption,
  txFee: send.txFee,
  confirm: send.confirm,
  web3Network: account.web3Network
});

export default connect(reduxProps, {
  modalClose,
  sendGetGasPrices,
  sendUpdateGasPrice,
  sendEtherMetamask,
  sendEtherClient,
  sendTokenMetamask,
  sendTokenClient,
  sendClearFields,
  sendUpdateRecipient,
  sendUpdateNativeAmount,
  sendUpdateCryptoAmount,
  sendUpdatePrivateKey,
  sendUpdateSelected,
  sendToggleConfirmationView,
  notificationShow
})(SendModal);
