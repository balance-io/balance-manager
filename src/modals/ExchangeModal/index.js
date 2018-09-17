import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { lang } from 'balance-common';
import Card from '../../components/Card';
import Input from '../../components/Input';
import LineBreak from '../../components/LineBreak';
import AccountType from '../../components/AccountType';
import AssetIcon from '../../components/AssetIcon';
import DropdownAsset from '../../components/DropdownAsset';
import Button from '../../components/Button';
import Form from '../../components/Form';
import exchangeIcon from '../../assets/exchange-icon.svg';
import arrowUp from '../../assets/arrow-up.svg';
import { modalClose } from '../../reducers/_modal';
import {
  exchangeClearFields,
  exchangeModalInit,
  exchangeSendTransaction,
  exchangeUpdateWithdrawalAmount,
  exchangeUpdateWithdrawalNative,
  exchangeUpdateDepositAmount,
  exchangeUpdateDepositSelected,
  exchangeUpdateWithdrawalSelected,
  exchangeToggleConfirmationView,
  exchangeConfirmTransaction,
  exchangeToggleWithdrawalNative,
  exchangeMaxBalance,
} from '../../reducers/_exchange';
import { notificationShow } from '../../reducers/_notification';
import {
  add,
  capitalize,
  convertAmountFromBigNumber,
  convertAmountToDisplay,
  convertNumberToString,
  getCountdown,
  multiply,
  divide,
  greaterThan,
  smallerThan,
  convertAmountToBigNumber,
  handleSignificantDecimals,
} from 'balance-common';
import { fonts, colors, responsive, transitions } from '../../styles';

import {
  StyledAmountCurrency,
  StyledConversionContainer,
  StyledConversionIconContainer,
  StyledInputContainer,
} from '../modalStyles';

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
  width: ${({ spanWidth }) => (spanWidth ? '100%' : 'auto')};
  display: flex;
  flex-grow: 1;
  align-items: flex-start;
  position: relative;
  transform: none;
`;

const StyledColumn = styled(StyledFlex)`
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const StyledDropdownLabel = styled.p`
  color: rgb(${colors.grey});
  font-size: 13px;
  font-weight: ${fonts.weight.semibold};
  margin-bottom: 8px;
`;

const StyledHelperWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const StyledHelperContainer = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding-top: ${({ noPadding }) => (noPadding ? '0' : '16px')};
`;

const StyledHelperText = styled.div`
  width: 100%;
  text-align: left;
  opacity: ${({ fetching }) => (fetching ? `0.5` : `1.0`)};
  cursor: ${({ onClick }) =>
    typeof onClick !== 'undefined' ? 'pointer' : 'default'};
  ${({ onClick }) =>
    typeof onClick !== 'undefined' &&
    `
    &:hover {
      opacity: 0.7;
    }
  `};

  &:not(:first-child) {
    padding-left: 8px;
  }

  @media screen and (${responsive.xs.max}) {
    text-align: ${({ centerOnMobile }) => (centerOnMobile ? 'center' : 'left')};
  }

  & p {
    color: ${({ warn }) =>
      warn ? `rgb(${colors.red})` : `rgb(${colors.grey})`};
    font-size: 13px;
    font-weight: ${fonts.weight.normal};
  }

  & strong {
    color: ${({ warn }) =>
      warn ? `rgb(${colors.red})` : `rgb(${colors.grey})`};
    font-size: 13px;
    font-weight: ${fonts.weight.semibold};
    margin-bottom: 8px;
  }
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

const StyledStaticCurrency = styled(StyledAmountCurrency)`
  cursor: default;
  color: rgb(${colors.dark});
`;

const StyledDynamicCurrencyContainer = styled.div`
  position: absolute;
  right: 6px;
`;

const StyledDynamicCurrency = styled(StyledAmountCurrency)`
  position: relative;
  display: inline-block;
  cursor: pointer;
  transition: ${transitions.short};
  color: ${({ selected }) =>
    selected ? `rgb(${colors.white})` : `rgba(${colors.darkGrey}, 0.7)`};
  background: ${({ fetching, selected }) =>
    fetching
      ? selected
        ? `rgba(${colors.dark}, 0.5)`
        : `none`
      : selected
        ? `rgb(${colors.dark})`
        : `rgb(${colors.white})`};
  &:hover {
    background: ${({ disabled, fetching, selected }) =>
      !fetching && !selected && !disabled && `rgb(${colors.dark}, 0.1)`};
  }
`;

const StyledNativeCurrency = styled(StyledDynamicCurrency)`
  margin-right: 4px;
`;

const StyledExchangeIconContainer = styled(StyledConversionIconContainer)`
  align-self: flex-start;
  height: 94px;

  @media screen and (${responsive.sm.max}) {
    height: 88px;
  }

  @media screen and (${responsive.xs.max}) {
    height: inherit;
  }
`;

const StyledExchangeIcon = styled.img`
  height: 15px;
  width: 20px;
  margin: 0 16px;

  @media screen and (${responsive.xs.max}) {
    margin: 16px 0 0;
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

export const StyledActions = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: ${({ single }) => (single ? `center` : `space-between`)};

  & button {
    margin: 0 5px;
  }

  @media screen and (${responsive.sm.max}) {
    > div {
      order: 1;
      width: 100%;
      margin-bottom: 8px;
      text-align: center;
    }

    button {
      &:first-child {
        order: 2;
      }

      &:last-child {
        order: 3;
      }
    }
  }

  @media screen and (${responsive.xxs.max}) {
    > div {
      margin-bottom: 16px;
    }
  }
`;

const StyledFees = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  ${StyledHelperText} {
    text-align: center;
  }
`;

const StyledMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(${colors.grey});
  font-weight: ${fonts.weight.medium};
`;

const StyledBlockedMessage = StyledMessage.extend`
  min-height: 400px;
  padding-bottom: 12px;

  & a {
    color: #657fe6 !important;
  }
`;

class ExchangeModal extends Component {
  state = {
    activeInput: '',
    showWithdrawalNative: false,
  };
  componentDidMount() {
    this.props.exchangeModalInit();
  }
  onChangeDepositSelected = value =>
    this.props.exchangeUpdateDepositSelected(value);
  onChangeWithdrawalSelected = value =>
    this.props.exchangeUpdateWithdrawalSelected(value);
  onChangeDepositInput = ({ target }) =>
    this.props.exchangeUpdateDepositAmount(target.value);
  onChangeWithdrawalInput = ({ target }) => {
    if (this.props.showWithdrawalNative) {
      this.props.exchangeUpdateWithdrawalNative(target.value);
    } else {
      this.props.exchangeUpdateWithdrawalAmount(target.value);
    }
  };
  onExchangeMin = () => {
    const exchangeDetails =
      Object.keys(this.props.exchangeDetails).length &&
      this.props.exchangeDetails.quotedRate
        ? this.props.exchangeDetails
        : null;
    if (exchangeDetails) {
      this.props.exchangeUpdateDepositAmount(exchangeDetails.min);
    }
  };
  onToggleWithdrawalNative = bool => {
    if (this.props.fetchingRate && this.state.activeInput !== 'WITHDRAWAL')
      return;
    this.props.exchangeToggleWithdrawalNative(bool);
  };
  onExchangeMaxBalance = () => this.props.exchangeMaxBalance();
  onExchangeAnother = () => {
    this.props.exchangeToggleConfirmationView();
    this.props.exchangeClearFields();
    this.props.exchangeModalInit();
  };
  onGoBack = () => this.props.exchangeToggleConfirmationView();
  onFocus = activeInput => this.setState({ activeInput });
  onBlur = () => this.setState({ activeInput: '' });
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
      if (this.props.depositSelected.symbol === 'ETH') {
        const ethereum = this.props.accountInfo.assets.filter(
          asset => asset.symbol === 'ETH',
        )[0];
        const balanceAmount = ethereum.balance.amount;
        const balance = convertAmountFromBigNumber(balanceAmount);
        const requestedAmount = convertNumberToString(this.props.depositAmount);
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
        const tokenBalanceAmount = this.props.depositSelected.balance.amount;
        const tokenBalance = convertAmountFromBigNumber(tokenBalanceAmount);
        const requestedAmount = convertNumberToString(this.props.depositAmount);
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
      this.props.exchangeConfirmTransaction();
    } else {
      this.props.exchangeSendTransaction();
    }
  };
  onClose = () => {
    this.props.exchangeClearFields();
    this.props.modalClose();
  };
  render = () => {
    const withdrawalAssets = this.props.withdrawalAssets.filter(
      asset => asset.symbol !== this.props.depositSelected.symbol,
    );
    const balance = this.props.accountInfo.assets.filter(
      asset => asset.symbol === this.props.depositSelected.symbol,
    )[0].balance.display;
    const depositNative = this.props.accountInfo.assets.filter(
      asset => asset.symbol === this.props.depositSelected.symbol,
    )[0].native;
    const depositValue = depositNative
      ? this.props.accountInfo.assets.filter(
          asset => asset.symbol === this.props.depositSelected.symbol,
        )[0].native.balance.display
      : '';
    const exchangeDetails =
      Object.keys(this.props.exchangeDetails).length &&
      this.props.exchangeDetails.quotedRate
        ? this.props.exchangeDetails
        : null;
    const rate = exchangeDetails
      ? convertAmountToDisplay(
          convertAmountToBigNumber(divide(1, exchangeDetails.quotedRate)),
          null,
          this.props.depositSelected,
        )
      : null;
    const depositPrices =
      exchangeDetails &&
      this.props.prices[this.props.nativeCurrency] &&
      this.props.prices[this.props.nativeCurrency][
        this.props.depositSelected.symbol
      ] &&
      Object.keys(exchangeDetails).length
        ? this.props.prices[this.props.nativeCurrency][
            this.props.depositSelected.symbol
          ]
        : null;
    const depositMin = exchangeDetails
      ? convertAmountToDisplay(
          convertAmountToBigNumber(exchangeDetails.min),
          null,
          this.props.depositSelected,
        )
      : null;
    const depositMax = exchangeDetails
      ? convertAmountToDisplay(
          convertAmountToBigNumber(exchangeDetails.maxLimit),
          null,
          this.props.depositSelected,
        )
      : null;
    const depositUnder = exchangeDetails
      ? this.props.depositAmount !== ''
        ? smallerThan(this.props.depositAmount, exchangeDetails.min)
        : false
      : false;
    const depositOver = exchangeDetails
      ? this.props.depositAmount !== ''
        ? greaterThan(this.props.depositAmount, exchangeDetails.maxLimit)
        : false
      : false;
    const exchangeFeeValue = exchangeDetails
      ? convertAmountToDisplay(
          convertAmountToBigNumber(exchangeDetails.minerFee),
          null,
          this.props.withdrawalSelected,
        )
      : null;
    const exchangeFeeNative =
      exchangeDetails && depositPrices
        ? convertAmountToDisplay(
            convertAmountToBigNumber(
              multiply(
                exchangeDetails.minerFee,
                multiply(
                  convertAmountFromBigNumber(depositPrices.price.amount),
                  divide(1, exchangeDetails.quotedRate),
                ),
              ),
            ),
            this.props.prices,
          )
        : null;
    const withdrawalValue =
      this.props.showWithdrawalNative && this.props.withdrawalAmount
        ? `${handleSignificantDecimals(this.props.withdrawalAmount, 8)} ${
            this.props.withdrawalSelected.symbol
          }`
        : this.props.withdrawalAmount &&
          this.props.withdrawalPrice &&
          this.props.withdrawalPrice.amount
          ? convertAmountToDisplay(
              convertAmountFromBigNumber(
                multiply(
                  convertAmountToBigNumber(this.props.withdrawalAmount),
                  this.props.withdrawalPrice.amount,
                ),
              ),
              this.props.prices,
            )
          : null;
    return (
      <Card
        allowOverflow
        background="lightGrey"
        fetching={this.props.fetching || this.props.fetchingShapeshift}
      >
        {this.props.shapeshiftAvailable ? (
          !this.props.txHash ? (
            !this.props.confirm ? (
              <Form onSubmit={this.onSubmit}>
                <StyledSubTitle>
                  <StyledIcon color="grey" icon={arrowUp} />
                  {lang.t('modal.exchange_title', {
                    walletName: capitalize(
                      `${this.props.accountType}${lang.t(
                        'modal.default_wallet',
                      )}`,
                    ),
                  })}
                </StyledSubTitle>
                <StyledConversionContainer>
                  <StyledFlex>
                    <StyledHelperWrapper spanWidth>
                      <StyledDropdownLabel>
                        {lang.t('modal.deposit_dropdown_label')}
                      </StyledDropdownLabel>
                      <DropdownAsset
                        noBalance
                        selected={this.props.depositSelected.symbol}
                        assets={this.props.depositAssets}
                        onChange={this.onChangeDepositSelected}
                      />
                      <StyledHelperContainer>
                        <StyledHelperText
                          centerOnMobile
                          fetching={this.props.fetchingRate}
                        >
                          <strong>{lang.t('modal.helper_balance')}</strong>
                          <p>{balance || '———'}</p>
                        </StyledHelperText>
                        <StyledHelperText
                          centerOnMobile
                          fetching={this.props.fetchingRate}
                        >
                          <strong>{lang.t('modal.helper_value')}</strong>
                          <p>{depositValue || '———'}</p>
                        </StyledHelperText>
                      </StyledHelperContainer>
                    </StyledHelperWrapper>
                  </StyledFlex>
                  <StyledFlex>
                    <StyledExchangeIconContainer>
                      <StyledExchangeIcon src={exchangeIcon} alt="conversion" />
                    </StyledExchangeIconContainer>
                  </StyledFlex>
                  <StyledFlex>
                    <StyledHelperWrapper spanWidth>
                      <StyledDropdownLabel>
                        {lang.t('modal.withdrawal_dropdown_label')}
                      </StyledDropdownLabel>
                      <DropdownAsset
                        noBalance
                        selected={this.props.withdrawalSelected.symbol}
                        assets={withdrawalAssets}
                        onChange={this.onChangeWithdrawalSelected}
                      />
                      <StyledHelperContainer>
                        <StyledHelperText
                          centerOnMobile
                          fetching={this.props.fetchingRate}
                        >
                          <strong>{lang.t('modal.helper_rate')}</strong>
                          <p>{rate || '———'}</p>
                        </StyledHelperText>
                        <StyledHelperText
                          centerOnMobile
                          fetching={this.props.fetchingRate}
                        >
                          <strong>{lang.t('modal.helper_price')}</strong>
                          <p>{this.props.withdrawalPrice.display || '———'}</p>
                        </StyledHelperText>
                      </StyledHelperContainer>
                    </StyledHelperWrapper>
                  </StyledFlex>
                </StyledConversionContainer>

                <StyledConversionContainer>
                  <StyledFlex spanWidth>
                    <StyledHelperWrapper>
                      <StyledInputContainer>
                        <Input
                          fetching={
                            this.props.fetchingRate &&
                            this.state.activeInput !== 'DEPOSIT'
                          }
                          onFocus={() => this.onFocus('DEPOSIT')}
                          onBlur={this.onBlur}
                          monospace
                          label={lang.t('modal.deposit_input_label')}
                          placeholder="0.0"
                          type="text"
                          value={this.props.depositAmount}
                          onChange={this.onChangeDepositInput}
                        >
                          <StyledStaticCurrency
                            disabled={
                              this.props.fetchingRate &&
                              this.state.activeInput !== 'DEPOSIT'
                            }
                          >
                            {this.props.depositSelected.symbol}
                          </StyledStaticCurrency>
                        </Input>
                        <StyledMaxBalance onClick={this.onExchangeMaxBalance}>
                          {lang.t('modal.exchange_max')}
                        </StyledMaxBalance>
                      </StyledInputContainer>

                      <StyledHelperContainer>
                        <StyledHelperText
                          centerOnMobile
                          onClick={this.onExchangeMin}
                          fetching={this.props.fetchingRate}
                          warn={!this.props.fetchingRate && depositUnder}
                        >
                          <strong>{lang.t('modal.helper_min')}</strong>
                          <p>{depositMin || '———'}</p>
                        </StyledHelperText>
                        <StyledHelperText
                          centerOnMobile
                          onClick={this.onExchangeMaxBalance}
                          fetching={this.props.fetchingRate}
                          warn={!this.props.fetchingRate && depositOver}
                        >
                          <strong>{lang.t('modal.helper_max')}</strong>
                          <p>{depositMax || '———'}</p>
                        </StyledHelperText>
                      </StyledHelperContainer>
                    </StyledHelperWrapper>
                  </StyledFlex>
                  <StyledFlex>
                    <StyledExchangeIconContainer>
                      <StyledExchangeIcon src={exchangeIcon} alt="conversion" />
                    </StyledExchangeIconContainer>
                  </StyledFlex>
                  <StyledFlex spanWidth>
                    <StyledHelperWrapper>
                      <StyledInputContainer>
                        <Input
                          fetching={
                            this.props.fetchingRate &&
                            this.state.activeInput !== 'WITHDRAWAL'
                          }
                          onFocus={() => this.onFocus('WITHDRAWAL')}
                          onBlur={this.onBlur}
                          monospace
                          placeholder="0.0"
                          label={lang.t('modal.withdrawal_input_label')}
                          type="text"
                          value={this.props.withdrawalInput}
                          onChange={this.onChangeWithdrawalInput}
                        >
                          <StyledDynamicCurrencyContainer>
                            <StyledNativeCurrency
                              onClick={() =>
                                this.onToggleWithdrawalNative(true)
                              }
                              selected={this.props.showWithdrawalNative}
                              disabled={
                                this.props.fetchingRate &&
                                this.state.activeInput !== 'WITHDRAWAL'
                              }
                            >
                              {this.props.prices && this.props.prices.selected
                                ? this.props.prices.selected.currency
                                : 'USD'}
                            </StyledNativeCurrency>
                            <StyledDynamicCurrency
                              onClick={() =>
                                this.onToggleWithdrawalNative(false)
                              }
                              selected={!this.props.showWithdrawalNative}
                              disabled={
                                this.props.fetchingRate &&
                                this.state.activeInput !== 'WITHDRAWAL'
                              }
                            >
                              {this.props.withdrawalSelected.symbol}
                            </StyledDynamicCurrency>
                          </StyledDynamicCurrencyContainer>
                        </Input>
                      </StyledInputContainer>
                      <StyledHelperContainer>
                        <StyledHelperText
                          fetching={this.props.fetchingRate}
                          warn={!this.props.fetchingRate && depositUnder}
                        >
                          <strong>{lang.t('modal.helper_value')}</strong>
                          <p>
                            {withdrawalValue
                              ? withdrawalValue
                              : this.props.showWithdrawalNative
                                ? `0.00 ${this.props.withdrawalSelected.symbol}`
                                : `${
                                    this.props.prices &&
                                    this.props.prices.selected
                                      ? this.props.prices.selected.symbol
                                      : '$'
                                  }0.00`}
                          </p>
                        </StyledHelperText>
                        <StyledHelperText />
                      </StyledHelperContainer>
                    </StyledHelperWrapper>
                  </StyledFlex>
                </StyledConversionContainer>

                <LineBreak />

                <StyledBottomModal>
                  <StyledActions>
                    <Button isModalButton onClick={this.onClose}>
                      {lang.t('button.cancel')}
                    </Button>
                    <StyledFees>
                      <StyledHelperContainer noPadding>
                        <StyledHelperText>
                          <strong>{lang.t('modal.tx_fee')}</strong>
                          <p>{`${
                            this.props.nativeCurrency !== 'ETH'
                              ? `${
                                  Object.keys(this.props.gasPrice).length &&
                                  this.props.gasPrice.txFee
                                    ? this.props.gasPrice.txFee.value.display
                                    : '0.000 ETH'
                                }  ≈ `
                              : ''
                          }${
                            Object.keys(this.props.gasPrice).length &&
                            this.props.gasPrice.txFee &&
                            this.props.gasPrice.txFee.native
                              ? this.props.gasPrice.txFee.native.value.display
                              : '$0.00'
                          }`}</p>
                        </StyledHelperText>
                        <StyledHelperText>
                          <strong>{lang.t('modal.exchange_fee')}</strong>
                          <p>{`${
                            exchangeFeeValue ? `${exchangeFeeValue}  ≈ ` : ''
                          }${
                            exchangeFeeNative ? exchangeFeeNative : '$0.00'
                          }`}</p>
                        </StyledHelperText>
                      </StyledHelperContainer>
                    </StyledFees>
                    <Button
                      left
                      isModalButton
                      color="brightGreen"
                      hoverColor="brightGreenHover"
                      activeColor="brightGreenHover"
                      icon={exchangeIcon}
                      disabled={
                        !this.props.depositAmount ||
                        !this.props.withdrawalAmount ||
                        depositUnder ||
                        depositOver
                      }
                      type="submit"
                    >
                      {lang.t('button.exchange')}
                    </Button>
                  </StyledActions>
                </StyledBottomModal>
              </Form>
            ) : (
              <StyledApproveTransaction>
                <StyledFlex>
                  <StyledColumn>
                    <AssetIcon
                      size={35}
                      asset={
                        this.props.depositSelected.symbol === 'ETH'
                          ? 'ETH'
                          : this.props.depositSelected.address
                      }
                    />
                    <StyledParagraph>{`${this.props.depositAmount} ${
                      this.props.depositSelected.symbol
                    }`}</StyledParagraph>
                  </StyledColumn>
                  <StyledFlex>
                    <StyledExchangeIcon src={exchangeIcon} alt="conversion" />
                  </StyledFlex>
                  <StyledColumn>
                    <AssetIcon
                      size={35}
                      asset={
                        this.props.withdrawalSelected.symbol === 'ETH'
                          ? 'ETH'
                          : this.props.withdrawalSelected.address
                      }
                    />
                    <StyledParagraph>{`${this.props.withdrawalAmount} ${
                      this.props.withdrawalSelected.symbol
                    }`}</StyledParagraph>
                  </StyledColumn>
                </StyledFlex>
                <StyledFlex>
                  <StyledParagraph>
                    {`Expiration time: ${getCountdown(this.props.countdown)}`}
                  </StyledParagraph>
                </StyledFlex>
                <AccountType accountType={this.props.accountType} />
                <StyledParagraph>
                  {lang.t('modal.approve_tx', {
                    walletType: capitalize(this.props.accountType),
                  })}
                </StyledParagraph>
                <StyledActions single>
                  <Button onClick={this.onGoBack}>
                    {lang.t('button.cancel')}
                  </Button>
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
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {lang.t('modal.tx_verify')}
                </a>
              </StyledParagraph>
              <StyledActions>
                <Button onClick={this.onExchangeAnother}>
                  {lang.t('button.exchange_again')}
                </Button>
                <Button color="red" onClick={this.onClose}>
                  {lang.t('button.close')}
                </Button>
              </StyledActions>
            </StyledSuccessMessage>
          )
        ) : (
          <StyledBlockedMessage>
            {lang.t('message.exchange_not_available')}
            .&nbsp;
            <a
              href="http://pleaseprotectconsumers.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              {lang.t('message.learn_more')}
            </a>
            .
          </StyledBlockedMessage>
        )}
      </Card>
    );
  };
}

ExchangeModal.propTypes = {
  modalClose: PropTypes.func.isRequired,
  exchangeClearFields: PropTypes.func.isRequired,
  exchangeModalInit: PropTypes.func.isRequired,
  exchangeSendTransaction: PropTypes.func.isRequired,
  exchangeUpdateWithdrawalAmount: PropTypes.func.isRequired,
  exchangeUpdateWithdrawalNative: PropTypes.func.isRequired,
  exchangeUpdateDepositAmount: PropTypes.func.isRequired,
  exchangeUpdateDepositSelected: PropTypes.func.isRequired,
  exchangeUpdateWithdrawalSelected: PropTypes.func.isRequired,
  exchangeToggleConfirmationView: PropTypes.func.isRequired,
  exchangeConfirmTransaction: PropTypes.func.isRequired,
  exchangeToggleWithdrawalNative: PropTypes.func.isRequired,
  exchangeMaxBalance: PropTypes.func.isRequired,
  notificationShow: PropTypes.func.isRequired,
  fetchingRate: PropTypes.bool.isRequired,
  fetchingFinal: PropTypes.bool.isRequired,
  fetching: PropTypes.bool.isRequired,
  gasPrice: PropTypes.object.isRequired,
  address: PropTypes.string.isRequired,
  recipient: PropTypes.string.isRequired,
  txHash: PropTypes.string.isRequired,
  confirm: PropTypes.bool.isRequired,
  countdown: PropTypes.string.isRequired,
  exchangeDetails: PropTypes.object.isRequired,
  depositAssets: PropTypes.array.isRequired,
  withdrawalAssets: PropTypes.array.isRequired,
  depositSelected: PropTypes.object.isRequired,
  withdrawalSelected: PropTypes.object.isRequired,
  depositAmount: PropTypes.string.isRequired,
  showWithdrawalNative: PropTypes.bool.isRequired,
  withdrawalInput: PropTypes.string.isRequired,
  withdrawalAmount: PropTypes.string.isRequired,
  withdrawalPrice: PropTypes.object.isRequired,
  accountInfo: PropTypes.object.isRequired,
  accountType: PropTypes.string.isRequired,
  network: PropTypes.string.isRequired,
  prices: PropTypes.object.isRequired,
  nativeCurrency: PropTypes.string.isRequired,
  shapeshiftAvailable: PropTypes.bool.isRequired,
  fetchingShapeshift: PropTypes.bool.isRequired,
};

const reduxProps = ({ modal, exchange, account }) => ({
  fetchingRate: exchange.fetchingRate,
  fetchingFinal: exchange.fetchingFinal,
  fetching: exchange.fetching,
  gasPrice: exchange.gasPrice,
  address: exchange.address,
  recipient: exchange.recipient,
  txHash: exchange.txHash,
  confirm: exchange.confirm,
  countdown: exchange.countdown,
  exchangeDetails: exchange.exchangeDetails,
  depositAssets: exchange.depositAssets,
  withdrawalAssets: exchange.withdrawalAssets,
  depositSelected: exchange.depositSelected,
  withdrawalSelected: exchange.withdrawalSelected,
  depositAmount: exchange.depositAmount,
  showWithdrawalNative: exchange.showWithdrawalNative,
  withdrawalInput: exchange.withdrawalInput,
  withdrawalAmount: exchange.withdrawalAmount,
  withdrawalPrice: exchange.withdrawalPrice,
  accountInfo: account.accountInfo,
  accountType: account.accountType,
  network: account.network,
  prices: account.prices,
  nativeCurrency: account.nativeCurrency,
  shapeshiftAvailable: account.shapeshiftAvailable,
  fetchingShapeshift: account.fetchingShapeshift,
});

export default connect(
  reduxProps,
  {
    modalClose,
    exchangeClearFields,
    exchangeModalInit,
    exchangeSendTransaction,
    exchangeUpdateWithdrawalAmount,
    exchangeUpdateWithdrawalNative,
    exchangeUpdateDepositAmount,
    exchangeUpdateDepositSelected,
    exchangeUpdateWithdrawalSelected,
    exchangeToggleConfirmationView,
    exchangeConfirmTransaction,
    exchangeToggleWithdrawalNative,
    exchangeMaxBalance,
    notificationShow,
  },
)(ExchangeModal);
