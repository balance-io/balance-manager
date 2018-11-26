import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

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
import { web3SendTransactionMultiWallet } from '../../handlers/web3';
import { notificationShow } from '../../reducers/_notification';

import {
  capitalize,
  getEth,
  lang,
  calcTxFee,
  withSendComponentWithData,
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
    notificationShow: PropTypes.func.isRequired,
    modalClose: PropTypes.func.isRequired,
  };

  onClose = () => {
    this.props.sendClearFields();
    this.props.modalClose();
  };

  render = () => {
    const {
      accountInfo,
      accountType,
      assetAmount,
      sendUpdateNativeAmount,
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
    notificationShow,
  },
)(withSendComponentWithData(DonateModal, web3SendTransactionMultiWallet));
