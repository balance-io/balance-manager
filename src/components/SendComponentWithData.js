import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { get } from 'lodash';
import lang from '../languages';
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
} from '../reducers/_send';
import { notificationShow } from '../reducers/_notification';

import { isValidAddress } from '../helpers/validators';
import { convertAmountFromBigNumber, greaterThan } from '../helpers/bignumber';

import { transactionData } from '../helpers/utilities';

const reduxProps = ({ send, account }) => ({
  fetching: send.fetching,
  recipient: send.recipient,
  nativeAmount: send.nativeAmount,
  assetAmount: send.assetAmount,
  isSufficientGas: send.isSufficientGas,
  isSufficientBalance: send.isSufficientBalance,
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

/**
 * Create SendComponent connected to redux with actions for sending assets.
 * @param  {Component}  SendComponent                     React component for sending.
 * @param  {Object}     options
 *         {Function}   options.sendTransactionCallback   Function to be run after sendTransaction redux action.
 *         {String}     options.defaultAsset              Symbol for default asset to send.
 * @return {Component}                                    SendComponent connected to redux.
 */
export const withSendComponentWithData = (SendComponent, options) => {
  class SendComponentWithData extends Component {
    static propTypes = {
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
      fetching: PropTypes.bool.isRequired,
      recipient: PropTypes.string.isRequired,
      nativeAmount: PropTypes.string.isRequired,
      assetAmount: PropTypes.string.isRequired,
      isSufficientGas: PropTypes.func.isRequired,
      isSufficientBalance: PropTypes.func.isRequired,
      txHash: PropTypes.string.isRequired,
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

    constructor(props) {
      super(props);

      this.state = {
        isValidAddress: false,
        showQRCodeReader: false,
      };

      this.defaultAsset = options.defaultAsset || 'ETH';
      this.gasFormat = options.gasFormat || 'long';
      this.sendTransactionCallback =
        options.sendTransactionCallback || function noop() {};
    }

    componentDidMount() {
      this.props.sendModalInit({
        defaultAsset: this.defaultAsset,
        gasFormat: this.gasFormat,
      });
    }

    componentDidUpdate(prevProps) {
      const {
        assetAmount,
        recipient,
        selected,
        sendUpdateGasPrice,
      } = this.props;

      if (recipient.length >= 42) {
        if (selected.symbol !== prevProps.selected.symbol) {
          sendUpdateGasPrice();
        } else if (recipient !== prevProps.recipient) {
          sendUpdateGasPrice();
        } else if (assetAmount !== prevProps.assetAmount) {
          sendUpdateGasPrice();
        }
      }

      if (recipient !== prevProps.recipient) {
        this.setState({ isValidAddress: isValidAddress(recipient) });
      }
    }

    onAddressInputFocus = () => {
      const { recipient } = this.props;

      this.setState({ isValidAddress: isValidAddress(recipient) });
    };

    onAddressInputBlur = () => {
      const { recipient } = this.props;

      this.setState({ isValidAddress: isValidAddress(recipient) });
    };

    onGoBack = () => this.props.sendToggleConfirmationView(false);

    onSendMaxBalance = () => this.props.sendMaxBalance();

    onSendAnother = () => {
      this.props.sendToggleConfirmationView(false);
      this.props.sendClearFields();
      this.props.sendModalInit({ defaultAsset: this.defaultAsset });
    };

    onSubmit = event => {
      if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
      }

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
          const { requestedAmount, balance, txFee } = transactionData(
            this.props.accountInfo,
            this.props.assetAmount,
            this.props.gasPrice,
          );

          const tokenBalanceAmount = get(this.props, 'selected.balance.amount');
          const tokenBalance = convertAmountFromBigNumber(tokenBalanceAmount);

          if (greaterThan(requestedAmount, tokenBalance)) {
            this.props.notificationShow(
              lang.t('notification.error.insufficient_balance'),
              true,
            );

            return;
          } else if (greaterThan(txFee, balance)) {
            this.props.notificationShow(
              lang.t('notification.error.insufficient_for_fees'),
              true,
            );

            return;
          }
        }

        this.props.sendToggleConfirmationView(true);

        return this.props.sendTransaction(
          {
            address: this.props.accountInfo.address,
            recipient: this.props.recipient,
            amount: this.props.assetAmount,
            asset: this.props.selected,
            gasPrice: this.props.gasPrice,
            gasLimit: this.props.gasLimit,
          },
          this.sendTransactionCallback,
        );
      }
    };

    updateGasPrice = gasPrice => {
      this.props.sendUpdateGasPrice(gasPrice);
    };

    onClose = () => {
      this.props.sendClearFields();
      // TODO: close function ?? (previously was to hit modal reducer)
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

    render() {
      return (
        <SendComponent
          isValidAddress={this.state.isValidAddress}
          onSendMaxBalance={this.onSendMaxBalance}
          onAddressInputFocus={this.onAddressInputFocus}
          onAddressInputBlur={this.onAddressInputBlur}
          onClose={this.onClose}
          onQRCodeValidate={this.onQRCodeValidate}
          onQRCodeScan={this.onQRCodeScan}
          onQRCodeError={this.onQRCodeError}
          onSubmit={this.onSubmit}
          showQRCodeReader={this.state.showQRCodeReader}
          toggleQRCodeReader={this.toggleQRCodeReader}
          updateGasPrice={this.updateGasPrice}
          {...this.props}
        />
      );
    }
  }

  return connect(
    reduxProps,
    {
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
  )(SendComponentWithData);
};
