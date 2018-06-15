import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import ReactSlider from 'react-slider';
import _ from 'lodash';

// import { setPendingDebtEntity, updateDebtEntity } from "../reducers/_dharma";

import lang from '../languages';
import amortizationUnits from '../references/term-lengths.json';

import Dropdown from '../components/Dropdown';
import Card from '../components/UnFlexedCard';
import Button from '../components/Button';
import Input from '../components/Input';

import { modalClose, modalOpen } from '../reducers/_modal';
import { apiGetPrice } from '../handlers/api';
import { BigNumber } from 'bignumber.js';

import { fonts, colors, responsive, shadows } from '../styles';

import dharmaProtocol from '../assets/powered-by-dharma.png';
import arrowReceived from '../assets/circle-arrow.svg';

import { dharma } from '../handlers/dharma';

const StyledDropdown = styled(Dropdown)`
  .dropdown-selected {
    background-color: rgb(${colors.white});
    font-size: 16px;
    border-radius: 7.6px;
    width: 125px;
    padding: 0px;
    font-family: 'SFMono', 'Roboto Mono', Courier New, Courier, monospace;
    box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.06),
      0 0 1px 0 rgba(50, 50, 93, 0.02), 0 5px 10px 0 rgba(59, 59, 92, 0.08);

    p {
      color: rgb(${colors.grey});
      text-align: center;
      font-size: 16px;
    }
  }

  p {
    font-size: 14px;
  }

  div {
    padding: 10px;
    text-align: center;
  }

  .dropdown-menu {
    margin-top: 10px;
  }
`;

const StyledContainer = styled.div`
  width: 100%;
  padding: 10px;

  @media screen and (${responsive.sm.max}) {
    padding: 15px;
    & h4 {
      margin: 20px auto;
    }
  }

  label {
    color: rgb(${colors.grey});
  }

  .tiny-input {
    width: 50px;
    margin-right: 5px;
    padding: 10px;
  }

  .medium-input {
    width: 150px;
  }

  &.loans-modal-footer {
    border-top: 1px solid rgb(${colors.borderGrey});
  }

  .footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .cancel {
      color: rgb(${colors.grey});
      margin-right: 15px;
    }

    .request {
      color: #fff;
    }

    button {
      font-size: 14px;
      font-weight: 400;
      padding: 8px 10px;

      img {
        vertical-align: middle;
        margin-right: 8px;
      }
    }
  }

  a {
    color: rgb(${colors.blue});
  }

  .horizontal-slider {
    width: 100%;
    max-width: 600px;
    height: 7px;
    margin-left: 5px;
    margin-right: 5px;

    .bar-0,
    .bar-1 {
      height: 7px;
    }

    .bar-0 {
      background: #e4e4e4;
    }

    ,
    .bar-1 {
      background: #e4e4e4;
    }

    .handle {
      border-radius: 50%;
      background: #f3754a;
      box-shadow: ${shadows.medium};
      width: 20px;
      height: 20px;
      top: -7px;
    }
  }

  .slider-section {
    margin-top: 15px;
    margin-bottom: 15px;
    padding: 30px 0px;
    border-top: 1px solid rgb(${colors.lightGrey});
    border-bottom: 1px solid rgb(${colors.lightGrey});
  }

  .data-section {
    padding: 15px 0px;

    p {
      color: rgb(${colors.darkGrey});
      min-width: 125px;
    }
  }
`;

const StyledCard = styled(Card)`
  border-radius: 10px;
  width: 100%;
  border-top: 10px solid rgb(${colors.brightGreen});
  background-color: rgb(${colors.backgroundGrey});
`;

const StyledFlex = styled.div`
  display: flex;
  justify-content: space-between;
  position: relative;
  transform: none;

  &.align-items: {
    align-items: center;
  }

  span {
    color: rgb(${colors.darkGrey});
  }

  input {
    margin: 0px;
  }
`;

const VerticalFlex = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  transform: none;

  span {
    color: rgb(${colors.darkGrey});
  }

  input {
    margin: 0px;
  }
`;

const StyledAmountCurrency = styled.div`
  position: absolute;
  bottom: 8px;
  right: 5px;
  padding: 4px;
  border-radius: 6px;
  background: rgb(${colors.brightGreen});
  font-size: ${fonts.size.medium};
  color: rgb(${colors.white});
  text-transform: uppercase;
`;

class LoansRequestModal extends Component {
  constructor(props) {
    super(props);

    this.calculateAmount = this.calculateAmount.bind(this);
    this.calculateInstallments = this.calculateInstallments.bind(this);
    this.calculateNative = this.calculateNative.bind(this);
    this.onClose = this.onClose.bind(this);
    this.updateAmortizationUnit = this.updateAmortizationUnit.bind(this);
    this.updateTermLength = this.updateTermLength.bind(this);
    this.updateInterestRate = this.updateInterestRate.bind(this);
    this.updatePrincipalAmount = this.updatePrincipalAmount.bind(this);
    this.updateCollateralAmount = this.updateCollateralAmount.bind(this);
    this.submitLoanRequest = this.submitLoanRequest.bind(this);
    this.validForm = this.validForm.bind(this);

    this.state = {
      debtRequest: {
        amortizationUnit: 'months',
        collateralAmount: '',
        collateralTokenSymbol:
          this.props.modal.params === 'WETH' ? 'DAI' : 'WETH',
        description: '',
        gracePeriodInDays: 0,
        interestRate: 1,
        principalAmount: '',
        principalTokenSymbol: this.props.modal.params,
        termLength: 1,
      },
      debtOrderInstance: {},
      issuanceHash: '',
    };
  }

  componentDidMount() {
    let { modal, account } = this.props;

    apiGetPrice(
      modal.params === 'WETH' ? 'ETH' : 'DAI',
      account.nativeCurrency,
    ).then(res => {
      this.setState({
        principalTokenNativePrice: res.data[account.nativeCurrency],
      });
    });
  }

  calculateAmount() {
    let debtRequest = { ...this.state.debtRequest };
    let principalAmount = debtRequest.principalAmount;
    let interestRate = debtRequest.interestRate / 100;
    let totalAmount = interestRate * principalAmount + principalAmount;

    return totalAmount || 0;
  }

  calculateInstallments() {
    let debtRequest = { ...this.state.debtRequest };

    let principalAmount = debtRequest.principalAmount;
    let interestRate = debtRequest.interestRate / 100;
    let totalAmount = interestRate * principalAmount + principalAmount;
    let installment = totalAmount / debtRequest.termLength;

    return installment || 0;
  }

  calculateNative() {
    let debtRequest = { ...this.state.debtRequest };

    let principalAmount = debtRequest.principalAmount;
    let interestRate = debtRequest.interestRate / 100;
    let totalTokenAmount = interestRate * principalAmount + principalAmount;
    let totalNativeAmount =
      totalTokenAmount * this.state.principalTokenNativePrice;

    return totalNativeAmount || 0;
  }

  onClose() {
    this.props.modalClose();
  }

  async submitLoanRequest() {
    let debtRequest = this.state.debtRequest;

    let payload = {
      amortizationUnit: debtRequest.amortizationUnit,
      collateralAmount: new BigNumber(debtRequest.collateralAmount),
      collateralTokenSymbol: debtRequest.collateralTokenSymbol,
      description: '',
      gracePeriodInDays: new BigNumber(debtRequest.gracePeriodInDays),
      interestRate: new BigNumber(debtRequest.interestRate),
      principalAmount: new BigNumber(debtRequest.principalAmount),
      principalTokenSymbol: debtRequest.principalTokenSymbol,
      termLength: new BigNumber(debtRequest.termLength),
    };

    console.log(
      'dharma',
      dharma,
      'debtRequest',
      debtRequest,
      'payLoad',
      payload,
      'account',
      this.props.account,
    );

    let debtOrderInstance = await dharma.adapters.collateralizedSimpleInterestLoan.toDebtOrder(
      payload,
    );

    debtOrderInstance.debtor = this.props.account.accountAddress;

    let issuanceHash = await dharma.order.getIssuanceHash(debtOrderInstance);

    console.log(
      'debtOrderInstance',
      debtOrderInstance,
      'issuanceHash',
      issuanceHash,
    );

    this.props.modalOpen('LOANS_REQUEST_CONFIRMATION_MODAL', {
      debtRequest: debtRequest,
      debtEntity: payload,
      debtOrderInstance: debtOrderInstance,
      issuanceHash: issuanceHash,
      amount: this.calculateAmount(),
      nativeAmount: this.calculateNative(),
      installments: this.calculateInstallments(),
    });
  }

  updateAmortizationUnit(value) {
    let debtRequest = { ...this.state.debtRequest };

    debtRequest.amortizationUnit = value;

    this.setState({ debtRequest });
  }

  updateCollateralAmount(value) {
    let debtRequest = { ...this.state.debtRequest };

    debtRequest.collateralAmount = parseFloat(value);

    this.setState({ debtRequest });
  }

  updateInterestRate(value) {
    let debtRequest = { ...this.state.debtRequest };

    debtRequest.interestRate = value;

    this.setState({ debtRequest });
  }

  updatePrincipalAmount(value) {
    let debtRequest = { ...this.state.debtRequest };

    debtRequest.principalAmount = parseFloat(value);

    this.setState({ debtRequest });
  }

  updateTermLength(value) {
    let debtRequest = { ...this.state.debtRequest };

    debtRequest.termLength = parseInt(value, 10);

    this.setState({ debtRequest });
  }

  validForm() {
    const { debtRequest } = this.state;
    // debtRequest: {
    //   amortizationUnit: 'months',
    //   collateralAmount: '',
    //   collateralTokenSymbol:
    //     this.props.modal.params === 'WETH' ? 'DAI' : 'WETH',
    //   description: '',
    //   gracePeriodInDays: 0,
    //   interestRate: 1,
    //   principalAmount: '',
    //   principalTokenSymbol: this.props.modal.params,
    //   termLength: 1,
    // },
    if (
      _.isNumber(debtRequest.termLength) &&
      _.isNumber(debtRequest.collateralAmount) &&
      _.isNumber(debtRequest.principalAmount) &&
      debtRequest.collateralAmount >= 1 &&
      debtRequest.termLength >= 1
    ) {
      return false;
    } else {
      return true;
    }
  }

  render = () => {
    const { debtRequest } = this.state;
    const { account } = this.props;

    return (
      <StyledCard>
        <StyledContainer>
          <VerticalFlex>
            <span>I want to borrow</span>
            <StyledFlex className="medium-input">
              <Input
                monospace
                placeholder="1"
                type="text"
                onChange={({ target }) =>
                  this.updatePrincipalAmount(target.value)
                }
              />
              <StyledAmountCurrency>
                {debtRequest.principalTokenSymbol}
              </StyledAmountCurrency>
            </StyledFlex>

            <span>by locking up</span>

            <StyledFlex className="medium-input">
              <Input
                monospace
                placeholder="450"
                type="text"
                onChange={({ target }) =>
                  this.updateCollateralAmount(target.value)
                }
              />
              <StyledAmountCurrency>
                {debtRequest.collateralTokenSymbol}
              </StyledAmountCurrency>
            </StyledFlex>

            <span>for</span>

            <StyledFlex>
              <Input
                className="tiny-input"
                monospace
                placeholder="1"
                type="text"
                defaultValue={debtRequest.termLength || ''}
                onChange={({ target }) => this.updateTermLength(target.value)}
              />
              <StyledDropdown
                displayKey={`amortizationUnit`}
                selected={debtRequest.amortizationUnit}
                onChange={this.updateAmortizationUnit}
                options={amortizationUnits}
                dark
              />
            </StyledFlex>
          </VerticalFlex>
        </StyledContainer>

        <StyledContainer>
          <VerticalFlex className="slider-section">
            <span> I want to pay </span>
            <ReactSlider
              withBars
              className="horizontal-slider"
              value={debtRequest.interestRate}
              onChange={this.updateInterestRate}
            />
            <span> interest </span>
          </VerticalFlex>
        </StyledContainer>

        <StyledContainer>
          <VerticalFlex className="data-section">
            <div>
              <label>PERCENTAGE</label>
              <p>{debtRequest.interestRate}% for full term</p>
            </div>

            <div>
              <label>AMOUNT</label>
              <p>
                {this.calculateAmount()} {debtRequest.principalTokenSymbol}
              </p>
            </div>

            <div>
              <label>NATIVE</label>
              <p>
                {this.calculateNative()} {account.nativeCurrency}
              </p>
            </div>

            <div>
              <label>INSTALLMENT</label>
              <p>
                {this.calculateInstallments()}{' '}
                {debtRequest.principalTokenSymbol}
              </p>
            </div>
          </VerticalFlex>
        </StyledContainer>

        <StyledContainer className="loans-modal-footer">
          <div className="footer-content">
            <img src={dharmaProtocol} alt="Powered by Dharma Protocol" />

            <p>
              Your loan request will be processed by{' '}
              <a href="dharma.io">Dharma Protocol</a>
            </p>

            <div className="controls">
              <Button
                className="cancel"
                color="white"
                hoverColor="white"
                activeColor="white"
                onClick={this.onClose}
              >
                {lang.t('button.cancel')}
              </Button>

              <Button
                className="request"
                color="brightGreen"
                hoverColor="brightGreen"
                activeColor="green"
                onClick={this.submitLoanRequest}
                disabled={this.validForm()}
              >
                <img src={arrowReceived} alt="borrow dai" />
                {lang.t('button.request')}
              </Button>
            </div>
          </div>
        </StyledContainer>
      </StyledCard>
    );
  };
}

LoansRequestModal.propTypes = {
  modalClose: PropTypes.func.isRequired,
  modalOpen: PropTypes.func.isRequired,
};

const reduxProps = ({ account, dharma, modal }) => ({
  account: account,
  dharma: dharma,
  modal: modal,
});

export default connect(reduxProps, {
  modalClose,
  modalOpen,
})(LoansRequestModal);
