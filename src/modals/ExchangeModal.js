import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import lang from '../languages';
import Card from '../components/Card';
import Input from '../components/Input';
import LineBreak from '../components/LineBreak';
import DropdownAsset from '../components/DropdownAsset';
import Button from '../components/Button';
import Form from '../components/Form';
import AssetIcon from '../components/AssetIcon';
import exchangeIcon from '../assets/exchange-icon.svg';
import arrowUp from '../assets/arrow-up.svg';
import { modalClose } from '../reducers/_modal';
import {
  exchangeClearFields,
  exchangeModalInit,
  exchangeSendTransaction,
  exchangeUpdateWithdrawalAmount,
  exchangeUpdateDepositAmount,
  exchangeUpdateDepositSelected,
  exchangeUpdateWithdrawalSelected,
  exchangeToggleConfirmationView,
  exchangeConfirmTransaction,
  exchangeMaxBalance,
} from '../reducers/_exchange';
import { notificationShow } from '../reducers/_notification';
import {
  convertAmountFromBigNumber,
  convertAmountToDisplay,
  convertNumberToString,
  add,
  subtract,
  multiply,
  divide,
  greaterThan,
  smallerThan,
  convertAmountToBigNumber,
} from '../helpers/bignumber';
import { getTimeString } from '../helpers/time';
import { capitalize } from '../helpers/utilities';
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
  height: 34px;
  grid-template-columns: 1fr 1fr;
  padding-top: 16px;
`;

const StyledHelperText = styled.div`
  width: 100%;
  text-align: right;
  padding-right: 16px;
  opacity: ${({ fetching }) => (fetching ? `0.5` : `1.0`)};
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

const StyledAmountCurrency = styled.div`
  position: absolute;
  top: 34px;
  right: 6px;
  padding: 4px;
  border-radius: 6px;
  background: ${({ fetching }) => (fetching ? 'none' : `rgb(${colors.white})`)};
  font-size: ${fonts.size.medium};
  color: rgba(${colors.darkGrey}, 0.7);
  opacity: ${({ fetching }) => (fetching ? '0.5' : '1')};
`;

const StyledExchangeIcon = styled.div`
  width: 46px;
  position: relative;
  & img {
    width: 20px;
    position: absolute;
    top: 40px;
    left: calc(50% - 10px);
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

const StyledActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${({ single }) => (single ? `center` : `space-between`)};
  & button {
    margin: 0 5px;
  }
`;

const StyledFees = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

class ExchangeModal extends Component {
  state = {
    activeInput: '',
  };
  componentDidMount() {
    this.props.exchangeModalInit();
  }
  onChangeDepositSelected = value =>
    this.props.exchangeUpdateDepositSelected(value);
  onChangeWithdrawalSelected = value =>
    this.props.exchangeUpdateWithdrawalSelected(value);
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
    const request = {
      address: this.props.accountInfo.address,
      recipient: this.props.recipient,
      amount: this.props.depositAmount,
      asset: this.props.depositSelected,
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
      this.props.exchangeSendTransaction(request);
    }
  };
  onClose = () => {
    this.props.exchangeClearFields();
    this.props.modalClose();
  };
  render = () => {
    const quantity = this.props.accountInfo.assets.filter(
      asset => asset.symbol === this.props.depositSelected.symbol,
    )[0].balance.display;
    const depositNative = this.props.accountInfo.assets.filter(
      asset => asset.symbol === this.props.depositSelected.symbol,
    )[0].native;
    const total = depositNative
      ? this.props.accountInfo.assets.filter(
          asset => asset.symbol === this.props.depositSelected.symbol,
        )[0].native.balance.display
      : '';
    const exchangeDetails =
      Object.keys(this.props.exchangeDetails).length &&
      this.props.exchangeDetails.quotedRate
        ? this.props.exchangeDetails
        : null;
    const price = exchangeDetails
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
    const native =
      exchangeDetails && depositPrices
        ? convertAmountToDisplay(
            convertAmountToBigNumber(
              multiply(
                convertAmountFromBigNumber(depositPrices.price.amount),
                divide(1, exchangeDetails.quotedRate),
              ),
            ),
            this.props.prices,
          )
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
    const withdrawalMin = exchangeDetails
      ? convertAmountToDisplay(
          convertAmountToBigNumber(
            subtract(
              multiply(exchangeDetails.min, exchangeDetails.quotedRate),
              exchangeDetails.minerFee,
            ),
          ),
          null,
          this.props.withdrawalSelected,
        )
      : null;
    const withdrawalMax = exchangeDetails
      ? convertAmountToDisplay(
          convertAmountToBigNumber(
            subtract(
              multiply(exchangeDetails.maxLimit, exchangeDetails.quotedRate),
              exchangeDetails.minerFee,
            ),
          ),
          null,
          this.props.withdrawalSelected,
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
    const withdrawalUnder = exchangeDetails
      ? this.props.withdrawalAmount !== ''
        ? smallerThan(
            this.props.withdrawalAmount,
            subtract(
              multiply(exchangeDetails.min, exchangeDetails.quotedRate),
              exchangeDetails.minerFee,
            ),
          )
        : false
      : false;
    const withdrawalOver = exchangeDetails
      ? this.props.withdrawalAmount !== ''
        ? greaterThan(
            this.props.withdrawalAmount,
            subtract(
              multiply(exchangeDetails.maxLimit, exchangeDetails.quotedRate),
              exchangeDetails.minerFee,
            ),
          )
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
    return (
      <Card allowOverflow background="lightGrey" fetching={this.props.fetching}>
        {!this.props.txHash ? (
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

              <StyledFlex>
                <StyledHelperWrapper>
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
                    <StyledHelperText fetching={this.props.fetchingRate}>
                      <strong>Quantity</strong>
                      <p>{quantity || '———'}</p>
                    </StyledHelperText>
                    <StyledHelperText fetching={this.props.fetchingRate}>
                      <strong>Total</strong>
                      <p>{total || '———'}</p>
                    </StyledHelperText>
                  </StyledHelperContainer>
                </StyledHelperWrapper>
                <StyledFlex>
                  <StyledExchangeIcon>
                    <img src={exchangeIcon} alt="conversion" />
                  </StyledExchangeIcon>
                </StyledFlex>
                <StyledHelperWrapper>
                  <StyledDropdownLabel>
                    {lang.t('modal.withdrawal_dropdown_label')}
                  </StyledDropdownLabel>
                  <DropdownAsset
                    noBalance
                    selected={this.props.withdrawalSelected.symbol}
                    assets={this.props.withdrawalAssets}
                    onChange={this.onChangeWithdrawalSelected}
                  />
                  <StyledHelperContainer>
                    <StyledHelperText fetching={this.props.fetchingRate}>
                      <strong>Price</strong>
                      <p>{price || '———'}</p>
                    </StyledHelperText>
                    <StyledHelperText fetching={this.props.fetchingRate}>
                      <strong>Native</strong>
                      <p>{native || '———'}</p>
                    </StyledHelperText>
                  </StyledHelperContainer>
                </StyledHelperWrapper>
              </StyledFlex>

              <StyledFlex>
                <StyledFlex>
                  <StyledHelperWrapper>
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
                      onChange={({ target }) =>
                        this.props.exchangeUpdateDepositAmount(target.value)
                      }
                    />
                    <StyledMaxBalance onClick={this.onExchangeMaxBalance}>
                      {lang.t('modal.exchange_max')}
                    </StyledMaxBalance>
                    <StyledAmountCurrency
                      fetching={
                        this.props.fetchingRate &&
                        this.state.activeInput !== 'DEPOSIT'
                      }
                    >
                      {this.props.depositSelected.symbol}
                    </StyledAmountCurrency>
                    <StyledHelperContainer>
                      <StyledHelperText
                        fetching={this.props.fetchingRate}
                        warn={!this.props.fetchingRate && depositUnder}
                      >
                        <strong>Min</strong>
                        <p>{depositMin || '———'}</p>
                      </StyledHelperText>
                      <StyledHelperText
                        fetching={this.props.fetchingRate}
                        warn={!this.props.fetchingRate && depositOver}
                      >
                        <strong>Max</strong>
                        <p>{depositMax || '———'}</p>
                      </StyledHelperText>
                    </StyledHelperContainer>
                  </StyledHelperWrapper>
                </StyledFlex>
                <StyledFlex>
                  <StyledExchangeIcon>
                    <img src={exchangeIcon} alt="conversion" />
                  </StyledExchangeIcon>
                </StyledFlex>
                <StyledFlex>
                  <StyledHelperWrapper>
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
                      value={this.props.withdrawalAmount}
                      onChange={({ target }) =>
                        this.props.exchangeUpdateWithdrawalAmount(target.value)
                      }
                    />
                    <StyledAmountCurrency
                      fetching={
                        this.props.fetchingRate &&
                        this.state.activeInput !== 'WITHDRAWAL'
                      }
                    >
                      {this.props.withdrawalSelected.symbol}
                    </StyledAmountCurrency>
                    <StyledHelperContainer>
                      <StyledHelperText
                        fetching={this.props.fetchingRate}
                        warn={!this.props.fetchingRate && withdrawalUnder}
                      >
                        <strong>Min</strong>
                        <p>{withdrawalMin || '———'}</p>
                      </StyledHelperText>
                      <StyledHelperText
                        fetching={this.props.fetchingRate}
                        warn={!this.props.fetchingRate && withdrawalOver}
                      >
                        <strong>Max</strong>
                        <p>{withdrawalMax || '———'}</p>
                      </StyledHelperText>
                    </StyledHelperContainer>
                  </StyledHelperWrapper>
                </StyledFlex>
              </StyledFlex>

              <LineBreak />

              <StyledBottomModal>
                <StyledActions>
                  <Button onClick={this.onClose}>
                    {lang.t('button.cancel')}
                  </Button>
                  <StyledFees>
                    <StyledParagraph>
                      <span>{`${lang.t('modal.tx_fee')}: `}</span>
                      <span>{`${
                        Object.keys(this.props.gasPrice).length &&
                        this.props.gasPrice.txFee &&
                        this.props.gasPrice.txFee.native
                          ? this.props.gasPrice.txFee.native.value.display
                          : '$0.00'
                      }${
                        this.props.nativeCurrency !== 'ETH'
                          ? ` (${
                              Object.keys(this.props.gasPrice).length &&
                              this.props.gasPrice.txFee
                                ? this.props.gasPrice.txFee.value.display
                                : '0.000 ETH'
                            })`
                          : ''
                      }`}</span>
                    </StyledParagraph>
                    <StyledParagraph>
                      <span>{`${lang.t('modal.exchange_fee')}: `}</span>
                      <span>{`${
                        exchangeFeeNative ? exchangeFeeNative : '$0.00'
                      }${
                        exchangeFeeValue ? ` (${exchangeFeeValue})` : ''
                      }`}</span>
                    </StyledParagraph>
                  </StyledFees>
                  <Button
                    left
                    color="brightGreen"
                    hoverColor="brightGreenHover"
                    activeColor="brightGreenHover"
                    icon={exchangeIcon}
                    disabled={
                      !this.props.depositAmount ||
                      !this.props.withdrawalAmount ||
                      depositUnder ||
                      depositOver ||
                      withdrawalUnder ||
                      withdrawalOver
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
                  <StyledExchangeIcon>
                    <img src={exchangeIcon} alt="conversion" />
                  </StyledExchangeIcon>
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
                  {getTimeString(this.props.countdown, 'ms')}
                </StyledParagraph>
              </StyledFlex>
              <StyledParagraph>
                {lang.t('modal.approve_tx', {
                  walletType: capitalize(this.props.accountType),
                })}
              </StyledParagraph>
              <StyledActions single>
                <Button onClick={this.onGoBack}>
                  {lang.t('button.cancel')}
                </Button>
                <Button
                  left
                  color="brightGreen"
                  hoverColor="brightGreenHover"
                  activeColor="brightGreenHover"
                  fetching={this.props.fetchingFinal}
                  icon={exchangeIcon}
                  onClick={this.onSubmit}
                >
                  {lang.t('button.confirm')}
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
                target="_blank"
              >
                {lang.t('modal.tx_verify')}
              </a>
            </StyledParagraph>
            <StyledActions>
              <Button onClick={this.onExchangeAnother}>
                {lang.t('button.exchange_another')}
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

ExchangeModal.propTypes = {
  modalClose: PropTypes.func.isRequired,
  exchangeClearFields: PropTypes.func.isRequired,
  exchangeModalInit: PropTypes.func.isRequired,
  exchangeSendTransaction: PropTypes.func.isRequired,
  exchangeUpdateWithdrawalAmount: PropTypes.func.isRequired,
  exchangeUpdateDepositAmount: PropTypes.func.isRequired,
  exchangeUpdateDepositSelected: PropTypes.func.isRequired,
  exchangeUpdateWithdrawalSelected: PropTypes.func.isRequired,
  exchangeToggleConfirmationView: PropTypes.func.isRequired,
  exchangeConfirmTransaction: PropTypes.func.isRequired,
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
  withdrawalAmount: PropTypes.string.isRequired,
  accountInfo: PropTypes.object.isRequired,
  accountType: PropTypes.string.isRequired,
  network: PropTypes.string.isRequired,
  prices: PropTypes.object.isRequired,
  nativeCurrency: PropTypes.string.isRequired,
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
  withdrawalAmount: exchange.withdrawalAmount,
  accountInfo: account.accountInfo,
  accountType: account.accountType,
  network: account.network,
  prices: account.prices,
  nativeCurrency: account.nativeCurrency,
});

export default connect(reduxProps, {
  modalClose,
  exchangeClearFields,
  exchangeModalInit,
  exchangeSendTransaction,
  exchangeUpdateWithdrawalAmount,
  exchangeUpdateDepositAmount,
  exchangeUpdateDepositSelected,
  exchangeUpdateWithdrawalSelected,
  exchangeToggleConfirmationView,
  exchangeConfirmTransaction,
  exchangeMaxBalance,
  notificationShow,
})(ExchangeModal);
