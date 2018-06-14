import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';

import lang from '../languages';

import Card from '../components/UnFlexedCard';
import Button from '../components/Button';

import { modalClose } from '../reducers/_modal';
import {
  updatePendingDebtEntity,
  setPendingDebtEntity,
} from '../reducers/_dharma';

import { colors, responsive } from '../styles';

import dharmaProtocol from '../assets/powered-by-dharma.png';
import arrowReceived from '../assets/circle-arrow.svg';

import { dharma } from '../handlers/dharma';

const VerticalFlex = styled.div`
  display: flex;
  justify-content: space-around;
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

  .loan-data {
    margin-bottom: 15px;
  }

  &.loans-modal-footer {
    border-top: 1px solid rgb(${colors.borderGrey});

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
  }

  a {
    color: rgb(${colors.blue});
  }
`;

const StyledCard = styled(Card)`
  border-radius: 10px;
  width: 100%;
  border-top: 10px solid rgb(${colors.brightGreen});
  background-color: rgb(${colors.backgroundGrey});
`;

class LoanRequestConfirmationModal extends Component {
  constructor(props) {
    super(props);

    this.onClose = this.onClose.bind(this);
    this.signDebtOrder = this.signDebtOrder.bind(this);

    this.state = {
      debtRequest: this.props.modal.params.debtRequest,
      debtEntity: this.props.modal.params.debtEntity,
      issuanceHash: this.props.modal.params.issuanceHash,
      debtOrderInstance: this.props.modal.params.debtOrderInstance,
      amount: this.props.modal.params.amount,
      nativeAmount: this.props.modal.params.nativeAmount,
      installments: this.props.modal.params.installments,
    };
  }

  componentDidMount() {
    console.log('state', this.state);
  }

  onClose() {
    this.props.modalClose();
  }

  async signDebtOrder() {
    const { debtOrderInstance, issuanceHash } = this.state;

    // Sign as debtor
    debtOrderInstance.debtorSignature = await dharma.sign.asDebtor(
      debtOrderInstance,
      true,
    );

    const collateralizedLoanOrder = await dharma.adapters.collateralizedSimpleInterestLoan.fromDebtOrder(
      debtOrderInstance,
    );

    const {
      amortizationUnit,
      collateralAmount,
      collateralTokenSymbol,
      interestRate,
      termLength,
      description,
      gracePeriodInDays,
    } = collateralizedLoanOrder;

    let debtEntity = {
      amortizationUnit,
      collateralAmount,
      collateralTokenSymbol,
      debtor: debtOrderInstance.debtor,
      dharmaOrder: debtOrderInstance,
      description,
      gracePeriodInDays,
      interestRate,
      issuanceHash,
      principalAmount: debtOrderInstance.principalAmount,
      principalTokenSymbol: debtOrderInstance.principalTokenSymbol,
      termLength,
    };

    console.log('debtEntity', debtEntity);

    this.props.updatePendingDebtEntity(debtEntity);
    this.props.setPendingDebtEntity(debtEntity.issuanceHash);
    this.props.modalClose();
  }

  render = () => {
    const { account } = this.props;
    const { debtRequest, amount, nativeAmount, installments } = this.state;

    return (
      <StyledCard>
        <StyledContainer>
          <VerticalFlex>
            <div>
              <div className="loan-data">
                <label>Principal Amount</label>
                <p>
                  {debtRequest.principalAmount}{' '}
                  {debtRequest.principalTokenSymbol}
                </p>
              </div>

              <div className="loan-data">
                <label>Collateral Amount</label>
                <p>
                  {debtRequest.collateralAmount}{' '}
                  {debtRequest.collateralTokenSymbol}
                </p>
              </div>

              <div className="loan-data">
                <label>Interest Rate</label>
                <p>{debtRequest.interestRate}%</p>
              </div>
            </div>

            <div>
              <div className="loan-data">
                <label>Repayment Amount</label>
                <p>
                  {amount} {debtRequest.principalTokenSymbol}
                </p>
              </div>

              <div className="loan-data">
                <label>Native Amount</label>
                <p>
                  {nativeAmount} {account.nativeCurrency}
                </p>
              </div>

              <div className="loan-data">
                <label>Installments</label>
                <p>
                  {installments} {debtRequest.principalTokenSymbol} for{' '}
                  {debtRequest.termLength} {debtRequest.amortizationUnit}
                </p>
              </div>
            </div>
          </VerticalFlex>
        </StyledContainer>

        <StyledContainer className="loans-modal-footer">
          <div className="footer-content">
            <img src={dharmaProtocol} alt="Powered by Dharma Protocol" />

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
                onClick={this.signDebtOrder}
              >
                <img src={arrowReceived} alt="borrow dai" />
                {lang.t('button.confirm')}
              </Button>
            </div>
          </div>
        </StyledContainer>
      </StyledCard>
    );
  };
}

LoanRequestConfirmationModal.propTypes = {
  modalClose: PropTypes.func.isRequired,
  updatePendingDebtEntity: PropTypes.func.isRequired,
  setPendingDebtEntity: PropTypes.func.isRequired,
};

const reduxProps = ({ account, dharma, modal }) => ({
  account: account,
  dharma: dharma,
  modal: modal,
});

export default connect(reduxProps, {
  modalClose,
  updatePendingDebtEntity,
  setPendingDebtEntity,
})(LoanRequestConfirmationModal);
