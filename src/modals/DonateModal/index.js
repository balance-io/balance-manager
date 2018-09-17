import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { lang } from 'balance-common';

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

import { modalClose } from '../../reducers/_modal';
import {
  sendModalInit,
  sendUpdateGasPrice,
  sendTransaction,
  sendClearFields,
  sendUpdateRecipient,
  sendUpdateNativeAmount,
  sendUpdateAssetAmount,
  sendToggleConfirmationView,
} from 'balance-common';
import { web3SendTransactionMultiWallet } from '../../handlers/web3';
import { notificationShow } from '../../reducers/_notification';

import {
  capitalize,
  getEth,
  greaterThan,
  transactionData,
  calcTxFee,
} from 'balance-common';

import {
  StyledIcon,
  StyledFlex,
  StyledBottomModal,
  StyledParagraph,
  StyledAmountCurrency,
  StyledConversionIcon,
  StyledSubTitle,
  StyledActions,
} from '../modalStyles';

const balanceManagerEthAddress =
  process.env.REACT_APP_DONATION_ADDRESS ||
  '0x0000000000000000000000000000000000000000';

const reduxProps = ({ modal, send, account }) => ({
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

class DonateModal extends Component {
  static propTypes = {
    sendModalInit: PropTypes.func.isRequired,
    sendUpdateGasPrice: PropTypes.func.isRequired,
    sendTransaction: PropTypes.func.isRequired,
    sendClearFields: PropTypes.func.isRequired,
    sendUpdateRecipient: PropTypes.func.isRequired,
    sendUpdateNativeAmount: PropTypes.func.isRequired,
    sendUpdateAssetAmount: PropTypes.func.isRequired,
    sendToggleConfirmationView: PropTypes.func.isRequired,
    notificationShow: PropTypes.func.isRequired,
    modalClose: PropTypes.func.isRequired,
    recipient: PropTypes.string.isRequired,
    nativeAmount: PropTypes.string.isRequired,
    assetAmount: PropTypes.string.isRequired,
    txHash: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
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

  componentDidMount() {
    this.props.sendModalInit();
  }

  onSubmit = e => {
    e.preventDefault();

    const data = transactionData(
      this.props.accountInfo,
      this.props.assetAmount,
      this.props.gasPrice,
    );

    if (!this.props.gasPrice.txFee) {
      this.props.notificationShow(
        lang.t('notification.error.generic_error'),
        true,
      );
      return;
    }

    if (!this.props.confirm) {
      if (this.props.selected.symbol !== 'ETH') {
        return;
      }

      if (greaterThan(data.requestedAmount, data.balance)) {
        this.props.notificationShow(
          lang.t('notification.error.insufficient_balance'),
          true,
        );
        return;
      } else if (greaterThan(data.amountWithFees, data.balance)) {
        this.props.notificationShow(
          lang.t('notification.error.insufficient_for_fees'),
          true,
        );

        return;
      }

      this.props.sendTransaction(
        {
          address: this.props.accountInfo.address,
          recipient: balanceManagerEthAddress,
          amount: this.props.assetAmount,
          asset: this.props.selected,
          gasPrice: this.props.gasPrice,
          gasLimit: this.props.gasLimit,
        },
        web3SendTransactionMultiWallet,
      );
    }

    this.props.sendToggleConfirmationView(true);
  };

  onClose = () => {
    this.props.sendClearFields();
    this.props.modalClose();
  };

  updateGasPrice = gasPrice => {
    this.props.sendUpdateGasPrice(gasPrice);
  };

  render = () => {
    const {
      accountInfo,
      accountType,
      assetAmount,
      sendUpdateAssetAmount,
      selected,
      prices,
      nativeCurrency,
      gasPriceOption,
      nativeAmount,
      gasPrices,
      txHash,
      network,
      confirm,
    } = this.props;

    return (
      <Card background="lightGrey">
        {!txHash ? (
          !confirm ? (
            <Form onSubmit={this.onSubmit}>
              <StyledSubTitle>
                <StyledIcon color="grey" icon={arrowUp} />
                {lang.t('modal.donate_title', {
                  walletName: capitalize(
                    `${accountType}${lang.t('modal.default_wallet')}`,
                  ),
                })}
              </StyledSubTitle>

              <div>
                <DropdownAsset
                  selected={'ETH'}
                  assets={[getEth(accountInfo.assets)]}
                />
              </div>

              <StyledFlex>
                <Input
                  monospace
                  label={lang.t('input.donation_address')}
                  spellCheck="false"
                  type="text"
                  value={balanceManagerEthAddress}
                  placeholder={balanceManagerEthAddress}
                  disabled
                />
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
                      this.props.nativeCurrency,
                    )}`}</span>
                  </StyledParagraph>

                  <Button
                    left
                    color="blue"
                    icon={arrowUp}
                    disabled={
                      balanceManagerEthAddress.length !== 42 ||
                      (selected.symbol !== 'ETH' && !Number(assetAmount))
                    }
                    type="submit"
                  >
                    {lang.t('button.send')}
                  </Button>
                </StyledActions>
              </StyledBottomModal>
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
    sendToggleConfirmationView,
    notificationShow,
  },
)(DonateModal);
