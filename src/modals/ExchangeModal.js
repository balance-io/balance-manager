import React, { Component } from 'react';
import BigNumber from 'bignumber.js';
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
import MetamaskLogo from '../components/MetamaskLogo';
import LedgerLogo from '../components/LedgerLogo';
import TrezorLogo from '../components/TrezorLogo';
import exchangeIcon from '../assets/exchange-icon.svg';
import arrowUp from '../assets/arrow-up.svg';
import { modalClose } from '../reducers/_modal';
import {
  exchangeClearFields,
  exchangeModalInit,
  exchangeUpdateWithdrawalAmount,
  exchangeUpdateDepositAmount,
  exchangeUpdateDepositSelected,
  exchangeUpdateWithdrawalSelected,
  exchangeToggleConfirmationView
} from '../reducers/_exchange';
import { notificationShow } from '../reducers/_notification';
import { isValidAddress } from '../helpers/validators';
import {
  convertAmountFromBigNumber,
  convertAmountToDisplay,
  multiply,
  divide,
  convertAmountToBigNumber
} from '../helpers/bignumber';
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
  background-color: ${({ color }) => (color ? `rgb(${colors[color]})` : `rgb(${colors.dark})`)};
`;

const StyledFlex = styled.div`
  display: flex;
  position: relative;
  transform: none;
`;

const StyledHelperWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const StyledDropdownLabel = styled.p`
  color: rgb(${colors.grey});
  font-size: 13px;
  font-weight: ${fonts.weight.semibold};
  margin-bottom: 8px;
`;

const StyledHelperText = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding-top: 16px;
  & > div {
    width: 100%;
    text-align: right;
    padding-right: 16px;
  }
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
  top: 38px;
  right: 12px;
  font-size: ${fonts.size.medium};
  color: rgba(${colors.darkGrey}, 0.7);
  opacity: ${({ disabled }) => (disabled ? '0.5' : '1')};
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

class ExchangeModal extends Component {
  componentDidMount() {
    this.props.exchangeModalInit();
  }
  onChangeDepositSelected = value => this.props.exchangeUpdateDepositSelected(value);
  onChangeWithdrawalSelected = value => this.props.exchangeUpdateWithdrawalSelected(value);
  onGoBack = () => this.props.exchangeToggleConfirmationView(false);
  // onExchangeMaxBalance = () => this.props.exchangeMaxBalance();
  onExchangeAnother = () => {
    this.props.exchangeToggleConfirmationView(false);
    this.props.exchangeClearFields();
    this.props.exchangeModalInit();
  };
  onSubmit = e => {
    e.preventDefault();
    const request = {
      address: this.props.accountInfo.address,
      recipient: this.props.recipient,
      amount: this.props.depositAmount,
      depositSelectedAsset: this.props.depositSelected,
      gasPrice: this.props.gasPrice,
      gasLimit: this.props.gasLimit
    };
    if (!this.props.gasPrice.txFee) {
      this.props.notificationShow(lang.t('notification.error.generic_error'), true);
      return;
    }
    if (!this.props.confirm) {
      if (!isValidAddress(this.props.recipient)) {
        this.props.notificationShow(lang.t('notification.error.invalid_address'), true);
        return;
      } else if (this.props.depositSelected.symbol === 'ETH') {
        const ethereum = this.props.accountInfo.assets.filter(asset => asset.symbol === 'ETH')[0];
        const balanceAmount = ethereum.balance.amount;
        const balance = convertAmountFromBigNumber(balanceAmount);
        const requestedAmount = BigNumber(`${this.props.depositAmount}`).toString();
        const txFeeAmount = this.props.gasPrice.txFee.value.amount;
        const txFee = convertAmountFromBigNumber(txFeeAmount);
        const includingFees = BigNumber(requestedAmount)
          .plus(BigNumber(txFee))
          .toString();
        if (BigNumber(requestedAmount).comparedTo(BigNumber(balance)) === 1) {
          this.props.notificationShow(lang.t('notification.error.insufficient_balance'), true);
          return;
        } else if (BigNumber(includingFees).comparedTo(BigNumber(balance)) === 1) {
          this.props.notificationShow(lang.t('notification.error.insufficient_for_fees'), true);
          return;
        }
        switch (this.props.accountType) {
          case 'METAMASK':
            this.props.exchangeEtherMetamask(request);
            break;
          case 'LEDGER':
            this.props.exchangeEtherLedger(request);
            break;
          default:
            this.props.exchangeEtherMetamask(request);
            break;
        }
      } else {
        const ethereum = this.props.accountInfo.assets.filter(asset => asset.symbol === 'ETH')[0];
        const etherBalanceAmount = ethereum.balance.amount;
        const etherBalance = convertAmountFromBigNumber(etherBalanceAmount);
        const tokenBalanceAmount = this.props.depositSelected.balance.amount;
        const tokenBalance = convertAmountFromBigNumber(tokenBalanceAmount);
        const requestedAmount = BigNumber(`${this.props.depositAmount}`).toString();
        const includingFees = convertAmountFromBigNumber(this.props.gasPrice.txFee.value.amount);
        if (BigNumber(requestedAmount).comparedTo(BigNumber(tokenBalance)) === 1) {
          this.props.notificationShow(lang.t('notification.error.insufficient_balance'), true);
          return;
        } else if (BigNumber(includingFees).comparedTo(BigNumber(etherBalance)) === 1) {
          this.props.notificationShow(lang.t('notification.error.insufficient_for_fees'), true);
          return;
        }
        switch (this.props.accountType) {
          case 'METAMASK':
            this.props.exchangeTokenMetamask(request);
            break;
          case 'LEDGER':
            this.props.exchangeTokenLedger(request);
            break;
          default:
            this.props.exchangeTokenMetamask(request);
            break;
        }
      }
    }
    this.props.exchangeToggleConfirmationView(true);
  };
  onClose = () => {
    this.props.exchangeClearFields();
    this.props.modalClose();
  };
  render = () => {
    return (
      <Card allowOverflow background="lightGrey" fetching={this.props.fetching}>
        {!this.props.txHash ? (
          !this.props.confirm ? (
            <Form onSubmit={this.onSubmit}>
              <StyledSubTitle>
                <StyledIcon color="grey" icon={arrowUp} />
                {lang.t('modal.exchange_title', {
                  walletName: capitalize(
                    `${this.props.accountType}${lang.t('modal.default_wallet')}`
                  )
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
                  <StyledHelperText>
                    <div>
                      <strong>Quantity</strong>
                      <p>
                        {
                          this.props.accountInfo.assets.filter(
                            asset => asset.symbol === this.props.depositSelected.symbol
                          )[0].balance.display
                        }
                      </p>
                    </div>
                    {this.props.accountInfo.assets.filter(
                      asset => asset.symbol === this.props.depositSelected.symbol
                    )[0].native ? (
                      <div>
                        <strong>Total</strong>
                        <p>
                          {
                            this.props.accountInfo.assets.filter(
                              asset => asset.symbol === this.props.depositSelected.symbol
                            )[0].native.balance.display
                          }
                        </p>
                      </div>
                    ) : (
                      <div />
                    )}
                  </StyledHelperText>
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
                  <StyledHelperText>
                    {Object.keys(this.props.exchangeDetails).length &&
                    this.props.exchangeDetails.rate ? (
                      <div>
                        <strong>Price</strong>
                        <p>
                          {convertAmountToDisplay(
                            convertAmountToBigNumber(divide(1, this.props.exchangeDetails.rate)),
                            null,
                            this.props.depositSelected
                          )}
                        </p>
                      </div>
                    ) : (
                      <div />
                    )}
                    {this.props.prices[this.props.nativeCurrency] &&
                    this.props.prices[this.props.nativeCurrency][
                      this.props.depositSelected.symbol
                    ] &&
                    Object.keys(this.props.exchangeDetails).length ? (
                      <div>
                        <strong>Native</strong>
                        <p>
                          {convertAmountToDisplay(
                            convertAmountToBigNumber(
                              multiply(
                                convertAmountFromBigNumber(
                                  this.props.prices[this.props.nativeCurrency][
                                    this.props.depositSelected.symbol
                                  ].price.amount
                                ),
                                divide(1, this.props.exchangeDetails.rate)
                              )
                            ),
                            this.props.prices
                          )}
                        </p>
                      </div>
                    ) : (
                      <div />
                    )}
                    <div>
                      <strong />
                      <p />
                    </div>
                    <div>
                      <strong />
                      <p />
                    </div>
                  </StyledHelperText>
                </StyledHelperWrapper>
              </StyledFlex>

              <StyledFlex>
                <StyledFlex>
                  <StyledHelperWrapper>
                    <Input
                      monospace
                      label={lang.t('modal.deposit_input_label')}
                      placeholder="0.0"
                      type="text"
                      value={this.props.depositAmount}
                      onChange={({ target }) =>
                        this.props.exchangeUpdateDepositAmount(
                          target.value,
                          this.props.depositSelected
                        )
                      }
                    />
                    <StyledMaxBalance onClick={this.onExchangeEntireBalance}>
                      {lang.t('modal.exchange_max')}
                    </StyledMaxBalance>
                    <StyledAmountCurrency>{this.props.depositSelected.symbol}</StyledAmountCurrency>
                    <StyledHelperText>
                      {Object.keys(this.props.exchangeDetails).length &&
                      this.props.exchangeDetails.rate ? (
                        <div>
                          <strong>Min</strong>
                          <p>
                            {convertAmountToDisplay(
                              convertAmountToBigNumber(this.props.exchangeDetails.min),
                              null,
                              this.props.depositSelected
                            )}
                          </p>
                        </div>
                      ) : (
                        <div />
                      )}
                      {Object.keys(this.props.exchangeDetails).length &&
                      this.props.exchangeDetails.rate ? (
                        <div>
                          <strong>Max</strong>
                          <p>
                            {convertAmountToDisplay(
                              convertAmountToBigNumber(this.props.exchangeDetails.maxLimit),
                              null,
                              this.props.depositSelected
                            )}
                          </p>
                        </div>
                      ) : (
                        <div />
                      )}
                    </StyledHelperText>
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
                      monospace
                      placeholder="0.0"
                      label={lang.t('modal.withdrawal_input_label')}
                      type="text"
                      value={this.props.withdrawalAmount}
                      onChange={({ target }) =>
                        this.props.exchangeUpdateWithdrawalAmount(
                          target.value,
                          this.props.withdrawalSelected
                        )
                      }
                    />
                    <StyledAmountCurrency>
                      {this.props.withdrawalSelected.symbol}
                    </StyledAmountCurrency>
                    <StyledHelperText>
                      {Object.keys(this.props.exchangeDetails).length &&
                      this.props.exchangeDetails.rate ? (
                        <div>
                          <strong>Min</strong>
                          <p>
                            {convertAmountToDisplay(
                              convertAmountToBigNumber(
                                multiply(
                                  this.props.exchangeDetails.min,
                                  this.props.exchangeDetails.rate
                                )
                              ),
                              null,
                              this.props.withdrawalSelected
                            )}
                          </p>
                        </div>
                      ) : (
                        <div />
                      )}
                      {Object.keys(this.props.exchangeDetails).length &&
                      this.props.exchangeDetails.rate ? (
                        <div>
                          <strong>Max</strong>
                          <p>
                            {convertAmountToDisplay(
                              convertAmountToBigNumber(
                                multiply(
                                  this.props.exchangeDetails.maxLimit,
                                  this.props.exchangeDetails.rate
                                )
                              ),
                              null,
                              this.props.withdrawalSelected
                            )}
                          </p>
                        </div>
                      ) : (
                        <div />
                      )}
                    </StyledHelperText>
                  </StyledHelperWrapper>
                </StyledFlex>
              </StyledFlex>

              <LineBreak />

              <StyledBottomModal>
                <StyledActions>
                  <Button onClick={this.onClose}>{lang.t('button.cancel')}</Button>
                  <Button
                    left
                    color="brightGreen"
                    hoverColor="brightGreenHover"
                    activeColor="brightGreenHover"
                    icon={exchangeIcon}
                    disabled={
                      this.props.recipient.length !== 42 ||
                      (this.props.depositSelected.symbol !== 'ETH' &&
                        !Number(this.props.depositAmount))
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
                  walletType: capitalize(this.props.accountType)
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
                  this.props.network !== 'mainnet' ? `${this.props.network}.` : ''
                }etherscan.io/tx/${this.props.txHash}`}
                target="_blank"
              >
                {lang.t('modal.tx_verify')}
              </a>
            </StyledParagraph>
            <StyledActions>
              <Button onClick={this.onExchangeAnother}>{lang.t('button.exchange_another')}</Button>
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
  exchangeUpdateWithdrawalAmount: PropTypes.func.isRequired,
  exchangeUpdateDepositAmount: PropTypes.func.isRequired,
  exchangeUpdateDepositSelected: PropTypes.func.isRequired,
  exchangeUpdateWithdrawalSelected: PropTypes.func.isRequired,
  exchangeToggleConfirmationView: PropTypes.func.isRequired,
  notificationShow: PropTypes.func.isRequired,
  fetching: PropTypes.bool.isRequired,
  address: PropTypes.string.isRequired,
  recipient: PropTypes.string.isRequired,
  txHash: PropTypes.string.isRequired,
  confirm: PropTypes.bool.isRequired,
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
  nativeCurrency: PropTypes.string.isRequired
};

const reduxProps = ({ modal, exchange, account }) => ({
  fetching: exchange.fetching,
  address: exchange.address,
  recipient: exchange.recipient,
  txHash: exchange.txHash,
  confirm: exchange.confirm,
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
  nativeCurrency: account.nativeCurrency
});

export default connect(reduxProps, {
  modalClose,
  exchangeClearFields,
  exchangeModalInit,
  exchangeUpdateWithdrawalAmount,
  exchangeUpdateDepositAmount,
  exchangeUpdateDepositSelected,
  exchangeUpdateWithdrawalSelected,
  exchangeToggleConfirmationView,
  notificationShow
})(ExchangeModal);
