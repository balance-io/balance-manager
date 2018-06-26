import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import lang from '../../languages';

import QRCodeReader from '../../components/QRCodeReader';
import Card from '../../components/Card';
import Input from '../../components/Input';
import LineBreak from '../../components/LineBreak';
import GasPanel from '../../components/GasPanel';
import DropdownAsset from '../../components/DropdownAsset';
import Button from '../../components/Button';
import Form from '../../components/Form';

import SuccessModal from '../SuccessModal';
import ApproveTransactionModal from '../ApproveTransactionModal';

import convertIcon from '../../assets/convert-icon.svg';
import arrowUp from '../../assets/arrow-up.svg';
import qrIcon from '../../assets/qr-code-bnw.png';

import { modalClose } from '../../reducers/_modal';
import {
  sendModalInit,
  sendUpdateGasPrice,
  sendTransaction,
  sendClearFields,
  sendUpdateRecipient,
  sendUpdateNativeAmount,
  sendUpdateAssetAmount,
  sendUpdateSelected,
  sendMaxBalance,
  sendToggleConfirmationView,
} from '../../reducers/_send';
import { notificationShow } from '../../reducers/_notification';

import { isValidAddress } from '../../helpers/validators';
import { greaterThan } from '../../helpers/bignumber';

import {
  capitalize,
  transactionData,
  calcTxFee,
} from '../../helpers/utilities';

import {
  StyledIcon,
  StyledFlex,
  StyledBottomModal,
  StyledParagraph,
  StyledAmountCurrency,
  StyledConversionIcon,
  StyledSubTitle,
  StyledActions,
  StyledInvalidAddress,
  StyledQRIcon,
  StyledMaxBalance,
} from '../modalStyles';

const reduxProps = ({ modal, send, account }) => ({
  fetching: send.fetching,
  recipient: send.recipient,
  nativeAmount: send.nativeAmount,
  assetAmount: send.assetAmount,
  txHash: send.txHash,
  address: send.address,
  selected: send.selected,
  gasPrices: send.gasPrices,
  gasPrice: send.gasPrice,
  gasLimit: send.gasLimit,
  gasPriceOption: send.gasPriceOption,
  confirm: send.confirm,
  accountInfo: account.accountInfo,
  accountType: account.accountType,
  network: account.network,
  nativeCurrency: account.nativeCurrency,
  prices: account.prices,
});

class SendModal extends Component {
  propTypes = {
    sendModalInit: PropTypes.func.isRequired,
    sendUpdateGasPrice: PropTypes.func.isRequired,
    sendTransaction: PropTypes.func.isRequired,
    sendClearFields: PropTypes.func.isRequired,
    sendUpdateRecipient: PropTypes.func.isRequired,
    sendUpdateNativeAmount: PropTypes.func.isRequired,
    sendUpdateAssetAmount: PropTypes.func.isRequired,
    sendUpdateSelected: PropTypes.func.isRequired,
    sendMaxBalance: PropTypes.func.isRequired,
    sendToggleConfirmationView: PropTypes.func.isRequired,
    notificationShow: PropTypes.func.isRequired,
    modalClose: PropTypes.func.isRequired,
    fetching: PropTypes.bool.isRequired,
    recipient: PropTypes.string.isRequired,
    nativeAmount: PropTypes.string.isRequired,
    assetAmount: PropTypes.string.isRequired,
    txHash: PropTypes.string.isRequired,
    // address: PropTypes.string.isRequired,
    selected: PropTypes.object.isRequired,
    gasPrice: PropTypes.object.isRequired,
    gasPrices: PropTypes.object.isRequired,
    gasLimit: PropTypes.number.isRequired,
    gasPriceOption: PropTypes.string.isRequired,
    confirm: PropTypes.bool.isRequired,
    accountInfo: PropTypes.object.isRequired,
    accountType: PropTypes.string.isRequired,
    network: PropTypes.string.isRequired,
    nativeCurrency: PropTypes.string.isRequired,
    prices: PropTypes.object.isRequired,
  };

  state = {
    isValidAddress: true,
    showQRCodeReader: false,
  };

  componentDidMount() {
    this.props.sendModalInit();
  }

  componentDidUpdate(prevProps) {
    if (this.props.recipient.length >= 42) {
      if (this.props.selected.symbol !== prevProps.selected.symbol) {
        this.props.sendUpdateGasPrice();
      } else if (this.props.recipient !== prevProps.recipient) {
        this.props.sendUpdateGasPrice();
      } else if (this.props.assetAmount !== prevProps.assetAmount) {
        this.props.sendUpdateGasPrice();
      }
    }
  }

  onAddressInputFocus = () => this.setState({ isValidAddress: true });

  onAddressInputBlur = () =>
    this.setState({ isValidAddress: isValidAddress(this.props.recipient) });

  onGoBack = () => this.props.sendToggleConfirmationView(false);

  onSendMaxBalance = () => this.props.sendMaxBalance();

  onSendAnother = () => {
    this.props.sendToggleConfirmationView(false);
    this.props.sendClearFields();
    this.props.sendModalInit();
  };

  onSubmit = e => {
    e.preventDefault();

    if (!this.props.gasPrice.txFee) {
      this.props.notificationShow(
        lang.t('notification.error.generic_error'),
        true,
      );

      return;
    }

    if (!this.props.confirm) {
      if (!isValidAddress(this.props.recipient)) {
        this.props.notificationShow(
          lang.t('notification.error.invalid_address'),
          true,
        );

        return;
      } else if (this.props.selected.symbol === 'ETH') {
        const { requestedAmount, balance, amountWithFees } = transactionData(
          this.props.accountInfo,
          this.props.assetAmount,
          this.props.gasPrice,
        );

        if (greaterThan(requestedAmount, balance)) {
          this.props.notificationShow(
            lang.t('notification.error.insufficient_balance'),
            true,
          );

          return;
        } else if (greaterThan(amountWithFees, balance)) {
          this.props.notificationShow(
            lang.t('notification.error.insufficient_for_fees'),
            true,
          );

          return;
        }
      } else {
        const { requestedAmount, balance, amountWithFees } = transactionData(
          this.props.accountInfo,
          this.props.assetAmount,
          this.props.gasPrice,
        );

        if (greaterThan(requestedAmount, balance)) {
          this.props.notificationShow(
            lang.t('notification.error.insufficient_balance'),
            true,
          );

          return;
        } else if (greaterThan(amountWithFees, balance)) {
          this.props.notificationShow(
            lang.t('notification.error.insufficient_for_fees'),
            true,
          );

          return;
        }
      }

      this.props.sendTransaction({
        address: this.props.accountInfo.address,
        recipient: this.props.recipient,
        amount: this.props.assetAmount,
        asset: this.props.selected,
        gasPrice: this.props.gasPrice,
        gasLimit: this.props.gasLimit,
      });
    }

    this.props.sendToggleConfirmationView(true);
  };

  updateGasPrice = gasPrice => {
    this.props.sendUpdateGasPrice(gasPrice);
  };

  onClose = () => {
    this.props.sendClearFields();
    this.props.modalClose();
  };

  updateGasPrice = gasPrice => {
    this.props.sendUpdateGasPrice(gasPrice);
  };

  // QR Code Reader Handlers
  toggleQRCodeReader = () =>
    this.setState({ showQRCodeReader: !this.state.showQRCodeReader });

  onQRCodeValidate = rawData => {
    const data = rawData.match(/0x\w{40}/g)
      ? rawData.match(/0x\w{40}/g)[0]
      : null;
    const result = data ? isValidAddress(data) : false;
    const onError = () =>
      this.props.notificationShow(
        lang.t('notification.error.invalid_address_scanned'),
        true,
      );

    return { data, result, onError };
  };

  onQRCodeScan = data => {
    this.props.sendUpdateRecipient(data);
    this.setState({ showQRCodeReader: false });
  };

  onQRCodeError = () => {
    this.props.notificationShow(
      lang.t('notification.error.failed_scanning_qr_code'),
      true,
    );
  };

  render = () => {
    const {
      txHash,
      confirm,
      selected,
      accountInfo,
      sendUpdateSelected,
      recipient,
      sendUpdateRecipient,
      assetAmount,
      sendUpdateAssetAmount,
      nativeAmount,
      prices,
      gasPrices,
      gasPriceOption,
      accountType,
      nativeCurrency,
      network,
    } = this.props;

    return (
      <Card background="lightGrey">
        {!txHash ? (
          !confirm ? (
            <Form onSubmit={this.onSubmit}>
              <StyledSubTitle>
                <StyledIcon color="grey" icon={arrowUp} />
                {lang.t('modal.send_title', {
                  walletName: capitalize(
                    `${accountType}${lang.t('modal.default_wallet')}`,
                  ),
                })}
              </StyledSubTitle>

              <div>
                <DropdownAsset
                  selected={selected.symbol}
                  assets={accountInfo.assets}
                  onChange={value => sendUpdateSelected(value)}
                />
              </div>

              <StyledFlex>
                <Input
                  monospace
                  label={lang.t('input.recipient_address')}
                  spellCheck="false"
                  placeholder="0x..."
                  type="text"
                  value={recipient}
                  onFocus={this.onAddressInputFocus}
                  onBlur={this.onAddressInputBlur}
                  onChange={({ target }) => sendUpdateRecipient(target.value)}
                />

                {recipient &&
                  !this.state.isValidAddress && (
                    <StyledInvalidAddress>
                      {lang.t('modal.invalid_address')}
                    </StyledInvalidAddress>
                  )}
                <StyledQRIcon onClick={this.toggleQRCodeReader}>
                  <img src={qrIcon} alt="recipient" />
                </StyledQRIcon>
              </StyledFlex>

              <StyledFlex>
                <StyledFlex>
                  <Input
                    monospace
                    label={lang.t('input.asset_amount')}
                    placeholder="0.0"
                    type="text"
                    value={assetAmount}
                    onChange={({ target }) =>
                      sendUpdateAssetAmount(target.value)
                    }
                  />

                  <StyledMaxBalance onClick={this.onSendMaxBalance}>
                    {lang.t('modal.send_max')}
                  </StyledMaxBalance>

                  <StyledAmountCurrency>{selected.symbol}</StyledAmountCurrency>
                </StyledFlex>

                <StyledFlex>
                  <StyledConversionIcon>
                    <img src={convertIcon} alt="≈" />
                  </StyledConversionIcon>
                </StyledFlex>

                <StyledFlex>
                  <Input
                    monospace
                    placeholder="0.0"
                    type="text"
                    value={nativeAmount}
                    disabled={
                      !prices[nativeCurrency] ||
                      !prices[nativeCurrency][selected.symbol]
                    }
                    onChange={({ target }) =>
                      sendUpdateNativeAmount(target.value)
                    }
                  />
                  <StyledAmountCurrency disabled={!prices[selected.symbol]}>
                    {prices && prices.selected ? prices.selected.currency : ''}
                  </StyledAmountCurrency>
                </StyledFlex>
              </StyledFlex>

              <GasPanel
                gasPriceOption={gasPriceOption}
                gasPrices={gasPrices}
                updateGasPrice={this.updateGasPrice}
              />

              <LineBreak noMargin />

              <StyledBottomModal>
                <StyledActions>
                  <Button onClick={this.onClose}>
                    {lang.t('button.cancel')}
                  </Button>

                  <StyledParagraph>
                    <span>{`${lang.t('modal.gas_fee')}: ${calcTxFee(
                      this.props.gasPrices,
                      this.props.gasPriceOption,
                    )}`}</span>
                  </StyledParagraph>

                  <Button
                    left
                    color="blue"
                    icon={arrowUp}
                    disabled={
                      recipient.length !== 42 ||
                      (selected.symbol !== 'ETH' && !Number(assetAmount))
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
                  onClose={this.toggleQRCodeReader}
                />
              )}
            </Form>
          ) : (
            <ApproveTransactionModal
              accountType={accountType}
              onClose={this.onClose}
            />
          )
        ) : (
          <SuccessModal
            txHash={txHash}
            network={network}
            onClose={this.onClose}
          />
        )}
      </Card>
    );
  };
}

export default connect(
  reduxProps,
  {
    modalClose,
    sendModalInit,
    sendUpdateGasPrice,
    sendTransaction,
    sendClearFields,
    sendUpdateRecipient,
    sendUpdateNativeAmount,
    sendUpdateAssetAmount,
    sendUpdateSelected,
    sendMaxBalance,
    sendToggleConfirmationView,
    notificationShow,
  },
)(SendModal);
