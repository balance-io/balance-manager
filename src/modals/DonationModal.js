import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import lang from '../languages';
import Card from '../components/Card';
import Input from '../components/Input';
import LineBreak from '../components/LineBreak';
import GasPriceLineBreak from '../components/GasPriceLineBreak';
import DropdownAsset from '../components/DropdownAsset';
import Button from '../components/Button';
import Form from '../components/Form';
import MetamaskLogo from '../components/MetamaskLogo';
import LedgerLogo from '../components/LedgerLogo';
import TrezorLogo from '../components/TrezorLogo';
import convertIcon from '../assets/convert-icon.svg';
import arrowUp from '../assets/arrow-up.svg';
import { modalClose } from '../reducers/_modal';
import {
  sendModalInit,
  sendUpdateGasPrice,
  sendTransaction,
  sendClearFields,
  sendUpdateRecipient,
  sendUpdateNativeAmount,
  sendUpdateAssetAmount,
  sendToggleConfirmationView,
} from '../reducers/_send';
import { notificationShow } from '../reducers/_notification';
import {
  convertAmountFromBigNumber,
  convertNumberToString,
  add,
  greaterThan,
} from '../helpers/bignumber';
import { capitalize, getEth } from '../helpers/utilities';
import { fonts, colors } from '../styles';

const StyledSuccessMessage = styled.div`
  width: 100%;
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
  background-color: ${({ color }) =>
    color ? `rgb(${colors[color]})` : `rgb(${colors.dark})`};
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

const StyledAmountCurrency = styled.div`
  position: absolute;
  bottom: 10px;
  right: 6px;
  padding: 4px;
  border-radius: 6px;
  background: rgb(${colors.white});
  font-size: ${fonts.size.medium};
  color: rgba(${colors.darkGrey}, 0.7);
  opacity: ${({ disabled }) => (disabled ? '0.5' : '1')};
`;

const StyledConversionIcon = styled.div`
  width: 46px;
  position: relative;
  & img {
    width: 15px;
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
      background-color: transparent !important;
      color: rgb(${colors.darkGrey}) !important;
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
  &:hover,
  &:active,
  &:focus,
  &:disabled {
    outline: none !important;
    box-shadow: none !important;
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

const balanceManagerEthAddress =
  process.env.REACT_APP_DONATION_ADDRESS ||
  '0x0000000000000000000000000000000000000000';

class DonationModal extends Component {
  componentDidMount() {
    this.props.sendModalInit();
  }
  onSubmit = e => {
    e.preventDefault();
    const request = {
      address: this.props.accountInfo.address,
      recipient: balanceManagerEthAddress,
      amount: this.props.assetAmount,
      asset: this.props.selected,
      gasPrice: this.props.gasPrice,
      gasLimit: this.props.gasLimit,
    };
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
      const ethereum = getEth(this.props.accountInfo.assets);
      const balanceAmount = ethereum.balance.amount;
      const balance = convertAmountFromBigNumber(balanceAmount);
      const requestedAmount = convertNumberToString(this.props.assetAmount);
      const txFeeAmount = this.props.gasPrice.txFee.value.amount;
      const txFee = convertAmountFromBigNumber(txFeeAmount);
      const includingFees = add(requestedAmount, txFee);
      if (greaterThan(requestedAmount, balance)) {
        this.props.notificationShow(
          lang.t('notification.error.insufficient_balance'),
          true,
        );
        return;
      } else if (greaterThan(includingFees, balance)) {
        this.props.notificationShow(
          lang.t('notification.error.insufficient_for_fees'),
          true,
        );
        return;
      }
      this.props.sendTransaction(request);
    }
    this.props.sendToggleConfirmationView(true);
  };
  onClose = () => {
    this.props.sendClearFields();
    this.props.modalClose();
  };
  render = () => {
    return (
      <Card background="lightGrey">
        {!this.props.txHash ? (
          !this.props.confirm ? (
            <Form onSubmit={this.onSubmit}>
              <StyledSubTitle>
                <StyledIcon color="grey" icon={arrowUp} />
                {lang.t('modal.donate_title', {
                  walletName: capitalize(
                    `${this.props.accountType}${lang.t(
                      'modal.default_wallet',
                    )}`,
                  ),
                })}
              </StyledSubTitle>

              <div>
                <DropdownAsset
                  selected={'ETH'}
                  assets={[getEth(this.props.accountInfo.assets)]}
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
                    value={this.props.assetAmount}
                    onChange={({ target }) =>
                      this.props.sendUpdateAssetAmount(target.value)
                    }
                  />
                  <StyledAmountCurrency>
                    {this.props.selected.symbol}
                  </StyledAmountCurrency>
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
                    value={this.props.nativeAmount}
                    disabled={
                      !this.props.prices[this.props.nativeCurrency] ||
                      !this.props.prices[this.props.nativeCurrency][
                        this.props.selected.symbol
                      ]
                    }
                    onChange={({ target }) =>
                      this.props.sendUpdateNativeAmount(target.value)
                    }
                  />
                  <StyledAmountCurrency
                    disabled={!this.props.prices[this.props.selected.symbol]}
                  >
                    {this.props.prices && this.props.prices.selected
                      ? this.props.prices.selected.currency
                      : ''}
                  </StyledAmountCurrency>
                </StyledFlex>
              </StyledFlex>
              <GasPriceLineBreak gasPriceOption={this.props.gasPriceOption} />
              <StyledGasOptions>
                <StyledGasButton
                  dark
                  disabled={!this.props.gasPrices.slow}
                  onClick={() => this.props.sendUpdateGasPrice('slow')}
                >
                  <p>{`${lang.t('modal.gas_slow')}: ${
                    this.props.gasPrices.slow &&
                    this.props.gasPrices.slow.txFee.native
                      ? this.props.gasPrices.slow.txFee.native.value.display
                      : '$0.00'
                  }`}</p>
                  <p>{`~ ${
                    this.props.gasPrices.slow
                      ? this.props.gasPrices.slow.estimatedTime.display
                      : '0 secs'
                  }`}</p>
                </StyledGasButton>
                <StyledGasButton
                  dark
                  disabled={!this.props.gasPrices.average}
                  onClick={() => this.props.sendUpdateGasPrice('average')}
                >
                  <p>{`${lang.t('modal.gas_average')}: ${
                    this.props.gasPrices.average &&
                    this.props.gasPrices.average.txFee.native
                      ? this.props.gasPrices.average.txFee.native.value.display
                      : '$0.00'
                  }`}</p>
                  <p>{`~ ${
                    this.props.gasPrices.average
                      ? this.props.gasPrices.average.estimatedTime.display
                      : '0 secs'
                  }`}</p>
                </StyledGasButton>
                <StyledGasButton
                  dark
                  disabled={!this.props.gasPrices.fast}
                  onClick={() => this.props.sendUpdateGasPrice('fast')}
                >
                  <p>{`${lang.t('modal.gas_fast')}: ${
                    this.props.gasPrices.fast &&
                    this.props.gasPrices.fast.txFee.native
                      ? this.props.gasPrices.fast.txFee.native.value.display
                      : '$0.00'
                  }`}</p>
                  <p>{`~ ${
                    this.props.gasPrices.fast
                      ? this.props.gasPrices.fast.estimatedTime.display
                      : '0 secs'
                  }`}</p>
                </StyledGasButton>
              </StyledGasOptions>
              <LineBreak noMargin />
              <StyledBottomModal>
                <StyledActions>
                  <Button onClick={this.onClose}>
                    {lang.t('button.cancel')}
                  </Button>
                  <StyledParagraph>
                    <span>{`${lang.t('modal.gas_fee')}: `}</span>
                    <span>{`${
                      this.props.gasPrices[this.props.gasPriceOption] &&
                      this.props.gasPrices[this.props.gasPriceOption].txFee
                        .native
                        ? this.props.gasPrices[this.props.gasPriceOption].txFee
                            .native.value.display
                        : '$0.00'
                    }${
                      this.props.nativeCurrency !== 'ETH'
                        ? ` (${
                            this.props.gasPrices[this.props.gasPriceOption]
                              ? this.props.gasPrices[this.props.gasPriceOption]
                                  .txFee.value.display
                              : '0.000 ETH'
                          })`
                        : ''
                    }`}</span>
                  </StyledParagraph>
                  <Button
                    left
                    color="blue"
                    icon={arrowUp}
                    disabled={
                      balanceManagerEthAddress.length !== 42 ||
                      (this.props.selected.symbol !== 'ETH' &&
                        !Number(this.props.assetAmount))
                    }
                    type="submit"
                  >
                    {lang.t('button.send')}
                  </Button>
                </StyledActions>
              </StyledBottomModal>
            </Form>
          ) : (
            <StyledApproveTransaction>
              {(() => {
                switch (this.props.accountType) {
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
                {lang.t('modal.approve_tx', {
                  walletType: capitalize(this.props.accountType),
                })}
              </StyledParagraph>
              <StyledActions single>
                <Button onClick={this.onClose}>{lang.t('button.close')}</Button>
              </StyledActions>
            </StyledApproveTransaction>
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
              <StyledHash>{` ${this.props.txHash}`}</StyledHash>
            </div>
            <StyledParagraph>
              <a
                href={`https://${
                  this.props.network !== 'mainnet'
                    ? `${this.props.network}.`
                    : ''
                }etherscan.io/tx/${this.props.txHash}`}
                target="_blank"
              >
                {lang.t('modal.tx_verify')}
              </a>
            </StyledParagraph>
            <StyledActions>
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

DonationModal.propTypes = {
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
  fetching: PropTypes.bool.isRequired,
  recipient: PropTypes.string.isRequired,
  nativeAmount: PropTypes.string.isRequired,
  assetAmount: PropTypes.string.isRequired,
  txHash: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
  selected: PropTypes.object.isRequired,
  fetchingGasPrices: PropTypes.bool.isRequired,
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

const reduxProps = ({ modal, send, account }) => ({
  fetching: send.fetching,
  recipient: send.recipient,
  nativeAmount: send.nativeAmount,
  assetAmount: send.assetAmount,
  txHash: send.txHash,
  address: send.address,
  selected: send.selected,
  fetchingGasPrices: send.fetchingGasPrices,
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
)(DonationModal);
