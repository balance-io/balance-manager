import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import lang from '../languages';
import QRCodeReader from '../components/QRCodeReader';
import Card from '../components/Card';
import Input from '../components/Input';
import LineBreak from '../components/LineBreak';
import DropdownAsset from '../components/DropdownAsset';
import Button from '../components/Button';
import Form from '../components/Form';
import AccountType from '../components/AccountType';
import AssetIcon from '../components/AssetIcon';
import convertIcon from '../assets/convert-icon.svg';
import arrowUp from '../assets/arrow-up.svg';
import qrIcon from '../assets/qr-code-bnw.png';
import { modalClose } from '../reducers/_modal';
import {
  sendModalInit,
  sendUpdateGasPrice,
  sendAllTransactions,
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
import {
  convertAmountFromBigNumber,
  convertNumberToString,
  add,
  greaterThan,
  multiply,
} from '../helpers/bignumber';
import { capitalize } from '../helpers/utilities';
import { fonts, colors } from '../styles';

import { estimateGasLimit } from '../handlers/web3';

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

const StyledFees = styled.div`
  margin: 10px 0;
  text-align: center;
  & p {
    color: rgb(${colors.grey});
    font-size: 13px;
    font-weight: ${fonts.weight.normal};
  }
  & strong {
    color: rgb(${colors.grey});
    font-size: 13px;
    font-weight: ${fonts.weight.semibold};
    margin-bottom: 8px;
  }
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

const StyledSendAllTokensButton = styled.a`
  font-size: 11px;
  float: right;
  display: inline-block;
  cursor: pointer;
  text-decoration: underline;
`;

const StyledSendAllTokensTransferLine = styled.div`
  display: flex;
  border-top: 1px solid rgba(${colors.rowDivider});
  background-color: rgb(${colors.white});

  & div {
    padding: 12px;
    display: flex;
    flex-direction: column;
    width: 31%;
    text-align: right;
    font-family: ${fonts.family.SFMono};
    font-size: ${fonts.size.smedium};
    color: rgba(${colors.darkGrey});

    &:first-child {
      width: 7%;
    }

    &:nth-child(2) {
      text-align: left;
      font-size: ${fonts.size.medium};
      font-weight: 500;
      font-family: ${fonts.family.SFProText};
    }
  }
`;

const StyledSendAllTokensHead = styled.div`
  text-transform: uppercase;
  font-family: ${fonts.family.SFProText}!important;
  font-size: ${fonts.size.small}!important;
  font-weight: 600!important;
  color: rgba(${colors.grey})!important;
`;

class SendModal extends Component {
  state = {
    isValidAddress: true,
    showQRCodeReader: false,
    showSendAllForm: false,
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
      } else if (this.state.showSendAllForm) {
        console.log('Send all');
        // Check for insufficient funds / sum everything up

        // this.props.sendTransaction(); for each
        this.props.sendAllTransactions();

        return;
      } else if (this.props.selected.symbol === 'ETH') {
        const ethereum = this.props.accountInfo.assets.filter(
          asset => asset.symbol === 'ETH',
        )[0];
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
      } else {
        const ethereum = this.props.accountInfo.assets.filter(
          asset => asset.symbol === 'ETH',
        )[0];
        const etherBalanceAmount = ethereum.balance.amount;
        const etherBalance = convertAmountFromBigNumber(etherBalanceAmount);
        const tokenBalanceAmount = this.props.selected.balance.amount;
        const tokenBalance = convertAmountFromBigNumber(tokenBalanceAmount);
        const requestedAmount = convertNumberToString(this.props.assetAmount);
        const includingFees = convertAmountFromBigNumber(
          this.props.gasPrice.txFee.value.amount,
        );
        if (greaterThan(requestedAmount, tokenBalance)) {
          this.props.notificationShow(
            lang.t('notification.error.insufficient_balance'),
            true,
          );
          return;
        } else if (greaterThan(includingFees, etherBalance)) {
          this.props.notificationShow(
            lang.t('notification.error.insufficient_for_fees'),
            true,
          );
          return;
        }
      }
      this.props.sendTransaction();
    }
    this.props.sendToggleConfirmationView(true);
  };

  onClose = () => {
    this.props.sendClearFields();
    this.props.modalClose();
  };

  // QR Code Reader Handlers
  toggleQRCodeReader = () =>
    this.setState({ showQRCodeReader: !this.state.showQRCodeReader });

  toggleSendAllForm = () => {
    this.setState({ showSendAllForm: !this.state.showSendAllForm });
    this.setState({
      sendAllGasLimits: [],
      sendAllGasPriceSum: 0,
    });

    if (!this.state.showSendAllForm) {
      this.props.accountInfo.assets.forEach(asset => {
        estimateGasLimit({
          asset: asset,
          address: this.props.address,
        }).then(gasLimit => {
          this.setState({
            sendAllGasLimits: [
              ...this.state.sendAllGasLimits,
              { asset: asset, gasLimit: gasLimit },
            ],
          });

          const sendAllGasPriceSum = (this.state.sendAllGasPriceSum + parseFloat(convertAmountFromBigNumber(multiply(gasLimit, this.props.gasPrice.value.amount))));

          const selectedCurrency = this.props.prices.selected.currency;
          const selectedCurrencyETHPrice = this.props.prices[selectedCurrency].ETH.price.amount;

          const sendAllGasPriceSumInSelectedCurrency = convertAmountFromBigNumber(multiply(selectedCurrencyETHPrice, sendAllGasPriceSum));

          this.setState({
            sendAllGasPriceSum: sendAllGasPriceSum,
            sendAllGasPriceSumInSelectedCurrency: sendAllGasPriceSumInSelectedCurrency
          });
        });
      });
    }
  };

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
    return (
      <Card background="lightGrey">
        {!this.props.txHash ? (
          !this.props.confirm ? (
            <Form onSubmit={this.onSubmit}>
              <StyledSubTitle>
                <StyledIcon color="grey" icon={arrowUp} />
                {lang.t('modal.send_title', {
                  walletName: capitalize(
                    `${this.props.accountType}${lang.t(
                      'modal.default_wallet',
                    )}`,
                  ),
                })}
              </StyledSubTitle>

              <div>
                <StyledSendAllTokensButton onClick={this.toggleSendAllForm}>
                  {!this.state.showSendAllForm && (
                    <span>{lang.t('modal.send_all_tokens_from_wallet')}</span>
                  )}

                  {this.state.showSendAllForm && (
                    <span>{lang.t('modal.send_specific_token')}</span>
                  )}
                </StyledSendAllTokensButton>
              </div>

              {!this.state.showSendAllForm && (
                <div>
                  <DropdownAsset
                    selected={this.props.selected.symbol}
                    assets={this.props.accountInfo.assets}
                    onChange={value => this.props.sendUpdateSelected(value)}
                  />
                </div>
              )}

              {this.state.showSendAllForm && (
                <div>
                  <StyledSendAllTokensTransferLine>
                    <StyledSendAllTokensHead>{lang.t('account.label_asset')}</StyledSendAllTokensHead>
                    <StyledSendAllTokensHead></StyledSendAllTokensHead>
                    <StyledSendAllTokensHead>{lang.t('account.label_quantity')}</StyledSendAllTokensHead>
                    <StyledSendAllTokensHead>{lang.t('account.tx_fee')}</StyledSendAllTokensHead>
                  </StyledSendAllTokensTransferLine>
                  {this.state.showSendAllForm &&
                    this.state.sendAllGasLimits.map((asset, key) => {
                      return (
                        <StyledSendAllTokensTransferLine key={key}>
                            <div>
                              <AssetIcon
                                asset={
                                  asset.asset.symbol === 'ETH' ? 'ETH' : asset.asset.address
                                }
                              />
                            </div>
                            <div>
                              {asset.asset.name}
                            </div>
                            <div>{asset.asset.balance.display}</div>
                            <div>{convertAmountFromBigNumber(
                              multiply(
                                asset.gasLimit,
                                this.props.gasPrice.value.amount,
                              ),
                            )}{' '}
                            ETH</div>
                        </StyledSendAllTokensTransferLine>
                      );
                    })}
                </div>
              )}

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
                    this.props.sendUpdateRecipient(target.value)
                  }
                />
                {this.props.recipient &&
                  !this.state.isValidAddress && (
                    <StyledInvalidAddress>
                      {lang.t('modal.invalid_address')}
                    </StyledInvalidAddress>
                  )}
                <StyledQRIcon onClick={this.toggleQRCodeReader}>
                  <img src={qrIcon} alt="recipient" />
                </StyledQRIcon>
              </StyledFlex>

              {!this.state.showSendAllForm && (
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
                    <StyledMaxBalance onClick={this.onSendMaxBalance}>
                      {lang.t('modal.send_max')}
                    </StyledMaxBalance>
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
              )}

              <LineBreak
                color={
                  this.props.gasPriceOption === 'slow'
                    ? 'red'
                    : this.props.gasPriceOption === 'average'
                      ? 'gold'
                      : 'lightGreen'
                }
                percentage={
                  this.props.gasPriceOption === 'slow'
                    ? 33
                    : this.props.gasPriceOption === 'average'
                      ? 66
                      : 100
                }
              />
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
                      : `${
                          this.props.prices && this.props.prices.selected
                            ? this.props.prices.selected.symbol
                            : '$'
                        }0.00`
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
                      : `${
                          this.props.prices && this.props.prices.selected
                            ? this.props.prices.selected.symbol
                            : '$'
                        }0.00`
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
                      : `${
                          this.props.prices && this.props.prices.selected
                            ? this.props.prices.selected.symbol
                            : '$'
                        }0.00`
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
                  <StyledFees>
                    <strong>{lang.t('modal.tx_fee')}</strong>
                    {!this.state.showSendAllForm && (
                      <p>{`${
                        this.props.nativeCurrency !== 'ETH'
                          ? `${
                              this.props.gasPrices[this.props.gasPriceOption]
                                ? this.props.gasPrices[this.props.gasPriceOption]
                                    .txFee.value.display
                                : '0.000 ETH'
                            } ≈ `
                          : ''
                      }${
                        this.props.gasPrices[this.props.gasPriceOption] &&
                        this.props.gasPrices[this.props.gasPriceOption].txFee
                          .native
                          ? this.props.gasPrices[this.props.gasPriceOption].txFee
                              .native.value.display
                          : `${
                              this.props.prices
                                ? this.props.prices.selected.symbol
                                : '$'
                            }0.00`
                      }`}</p>
                    )}

                    {this.state.showSendAllForm && (
                      <p>
                         {this.state.sendAllGasPriceSum} ETH
                          ≈
                          {this.props.prices.selected.symbol}{this.state.sendAllGasPriceSumInSelectedCurrency}
                      </p>
                    )}

                  </StyledFees>
                  <Button
                    left
                    color="blue"
                    icon={arrowUp}
                    disabled={
                      this.props.recipient.length !== 42 ||
                      (this.props.selected.symbol !== 'ETH' &&
                        !Number(this.props.assetAmount))
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
            <StyledApproveTransaction>
              <AccountType accountType={this.props.accountType} />
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
              <Button onClick={this.onSendAnother}>
                {lang.t('button.send_another')}
              </Button>
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
  sendModalInit: PropTypes.func.isRequired,
  sendUpdateGasPrice: PropTypes.func.isRequired,
  sendAllTransactions: PropTypes.func.isRequired,
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

export default connect(reduxProps, {
  modalClose,
  sendModalInit,
  sendUpdateGasPrice,
  sendAllTransactions,
  sendTransaction,
  sendClearFields,
  sendUpdateRecipient,
  sendUpdateNativeAmount,
  sendUpdateAssetAmount,
  sendUpdateSelected,
  sendMaxBalance,
  sendToggleConfirmationView,
  notificationShow,
})(SendModal);
