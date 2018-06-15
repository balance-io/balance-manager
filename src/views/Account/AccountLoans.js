import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import UnFlexedCard from '../../components/UnFlexedCard';
import Button from '../../components/Button';
import LoansMenu from '../../components/AccountLoansMenu';
import { colors } from '../../styles';
import Card from '../../components/Card';
import HoverWrapper from '../../components/HoverWrapper';

import ethBadge from '../../assets/eth-badge.svg';
import daiBadge from '../../assets/dai-badge.svg';
import arrowLeft from '../../assets/arrow-left.svg';
import arrowReceived from '../../assets/circle-arrow.svg';
import dharmaProtocol from '../../assets/powered-by-dharma.png';

import { modalOpen } from '../../reducers/_modal';

import { dharma } from '../../handlers/dharma';

import { fonts, shadows, responsive } from '../../styles';

const StyledGrid = styled.div`
  width: 100%;
  text-align: right;
  position: relative;
  z-index: 0;
  box-shadow: 0 5px 10px 0 rgba(59, 59, 92, 0.08),
    0 0 1px 0 rgba(50, 50, 93, 0.02), 0 3px 6px 0 rgba(0, 0, 0, 0.06);
  background-color: rgb(${colors.white});
  border-radius: 0 0 10px 10px;

  .rotate-180 {
    -webkit-transform: rotate(180deg);
    -moz-transform: rotate(180deg);
    -ms-transform: rotate(180deg);
    -o-transform: rotate(180deg);
    transform: rotate(180deg);
    vertical-align: middle;
    margin-right: 5px;
  }

  .loan-controls {
    padding: 15px;
    color: rgb(${colors.blue});
  }
`;

const StyledRow = styled.div`
  width: 100%;
  display: grid;
  position: relative;
  padding: 20px;
  z-index: 0;
  background-color: rgb(${colors.white});
  grid-template-columns: repeat(5, 1fr);
  min-height: 0;
  min-width: 0;
  & p {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    font-size: ${fonts.size.h6};
  }
  &:last-child {
    border-radius: 0 0 10px 10px;
  }
  @media screen and (${responsive.sm.max}) {
    grid-template-columns: repeat(5, 1fr);
    padding: 16px;
    & p {
      font-size: ${fonts.size.small};
    }
  }
  @media screen and (${responsive.xs.max}) {
    grid-template-columns: 1fr repeat(3, 3fr);
    & p:nth-child(3) {
      display: none;
    }
  }
`;

const StyledLabelsRow = styled(StyledRow)`
  width: 100%;
  border-width: 0 0 2px 0;
  border-color: rgba(${colors.lightGrey}, 0.4);
  border-style: solid;
  padding: 12px 20px;
  & p:first-child {
    justify-content: flex-start;
  }
  & p:nth-child(2) {
    margin-right: -20px;
  }
`;

const StyledLabels = styled.p`
  text-transform: uppercase;
  font-size: ${fonts.size.small} !important;
  font-weight: ${fonts.weight.semibold};
  color: rgb(${colors.mediumGrey});
  letter-spacing: 0.46px;
`;

const StyledTransactionWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 0;
  z-index: 0;
  & > div {
    transition: box-shadow 0.1s ease;
    border-radius: 0;
    @media (hover: hover) {
      &:hover {
        z-index: 10;
        box-shadow: ${({ showTxDetails }) =>
          showTxDetails ? `${shadows.big}` : `${shadows.soft}`};
      }
    }
  }
`;

const StyledTransaction = styled(StyledRow)`
  width: 100%;
  box-shadow: none;
  & > * {
    font-weight: ${fonts.weight.medium};
    color: ${({ failed }) =>
      failed ? `rgba(${colors.dark}, 0.3)` : `rgba(${colors.dark}, 0.6)`};
  }
  & > p:first-child {
    justify-content: flex-start;
  }
  & > p {
    font-family: ${fonts.family.SFMono};
  }
`;

const StyledTransactionMainRow = styled(StyledTransaction)`
  cursor: pointer;
  border-radius: ${({ showTxDetails }) => (showTxDetails ? '0' : `0`)};
  &:nth-child(n + 3) {
    border-top: 1px solid rgba(${colors.rowDivider});
  }
`;

const NoShadowCard = styled(Card)`
  box-shadow: none;
`;

const StyledCard = styled(UnFlexedCard)`
  border-radius: 0px;
  box-shadow: none;

  &.content-section {
    padding: 15px;
  }

  &:first-of-type {
    padding: 15px;
  }

  .loan-controls {
    padding: 15px;
    padding-left: 0px;
    color: rgb(${colors.blue});
    margin-top: 30px;
  }
`;

const BorrowDiv = styled.div`
  width: 100%;
  background-color: rgb(${colors.lightGrey});
  border: 1px solid rgb(${colors.borderGrey});
  padding: 15px;
  border-radius: 7.6px;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 30px;

  h5 {
    font-weight: 500;
  }

  img {
    margin-right: 5px;
  }

  .badges {
    flex-basis: 10%;
  }

  .content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex-basis: 75%;
  }

  .controls {
    flex-basis: 15%;
    display: flex;
    justify-content: flex-end;

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

  p {
    font-size: 12px;
    margin-top: 8px;
  }
`;

const Footer = styled.div`
  width: 100%;
  border-top: 1px solid rgb(${colors.borderGrey});
  padding: 0px 15px;
  display: flex;
  justify-content: space-between;

  h6 {
    font-weight: 400;
  }

  p {
    font-size: 12px;
    font-weight: 400;
    margin-top: 5px;
  }

  div:first-child {
    padding: 15px;
    border-right: 1px solid rgb(${colors.borderGrey});
  }

  div {
    padding-left: 10px;
  }

  .dharma-protocol {
    margin-top: 15px;
  }

  a {
    color: rgb(${colors.blue});
  }
`;

class AccountLoans extends Component {
  constructor(props) {
    super(props);

    this.setTab = this.setTab.bind(this);
    this.modalOpen = this.modalOpen.bind(this);
    this.getDebts = this.getDebts.bind(this);
    this.toggleLoans = this.toggleLoans.bind(this);

    this.state = {
      currentTab: 'COLLATERALIZED_LOANS',
      showLoans: false,
    };
  }

  componentDidMount() {
    const issuanceHashes = this.getDebts().then(res => {
      console.log('issuanceHashes', res);
    });

    console.log('debts', issuanceHashes);
  }

  setTab(tab) {
    this.setState({
      currentTab: tab,
    });
  }

  modalOpen(params) {
    this.props.modalOpen('LOANS_REQUEST_MODAL', params);
  }

  async getDebts() {
    const { account } = this.props;

    console.log('dharma debts', dharma);
    return await dharma.servicing.getDebtsAsync(account.accountAddress);
  }

  toggleLoans() {
    this.setState({
      showLoans: !this.state.showLoans,
    });
  }

  render() {
    return (
      <div className="account-loans">
        {!this.state.showLoans && (
          <StyledCard minHeight={280} className="content-section">
            <LoansMenu
              {...this.props}
              setTab={this.setTab}
              currentTab={this.state.currentTab}
            />

            <div className="loan-controls">
              <a href="#/" onClick={() => this.toggleLoans()}>
                View Loan History
              </a>
            </div>

            <BorrowDiv>
              <div className="badges">
                <img src={daiBadge} alt="dai to ether loan" />
                <img className="ethBadge" src={ethBadge} alt="borrow dai" />
              </div>

              <div className="content">
                <h5> Borrow Dai by locking up Ether </h5>
                <p>
                  {' '}
                  Get Dai, the coin that is pegged to the US Dollar by putting
                  down some Ether as collateral.{' '}
                </p>
              </div>

              <div className="controls">
                <Button
                  color="brightGreen"
                  activeColor="brightGreenHover"
                  hoverColor="brightGreenHover"
                  onClick={() => this.modalOpen('DAI')}
                >
                  <img src={arrowReceived} alt="borrow dai" />
                  Borrow DAI{' '}
                </Button>
              </div>
            </BorrowDiv>

            <BorrowDiv>
              <div className="badges">
                <img className="ethBadge" src={ethBadge} alt="borrow eth" />
                <img src={daiBadge} alt="borrow eth" />
              </div>

              <div className="content">
                <h5> Borrow Ether by locking up Dai </h5>
                <p>
                  {' '}
                  Get Ether, the fuel that powers the Ethereum network by
                  putting down some Dai as collateral.{' '}
                </p>
              </div>

              <div className="controls">
                <Button
                  activeColor="brightGreenHover"
                  color="brightGreen"
                  hoverColor="brightGreenHover"
                  onClick={() => this.modalOpen('WETH')}
                >
                  <img src={arrowReceived} alt="borrow eth" />
                  Borrow ETH{' '}
                </Button>
              </div>
            </BorrowDiv>
          </StyledCard>
        )}

        {this.state.showLoans && (
          <NoShadowCard>
            <StyledGrid>
              <div className="loan-controls">
                <a href="#/" onClick={() => this.toggleLoans()}>
                  <img
                    src={arrowLeft}
                    className="rotate-180"
                    alt="toggle loan history"
                  />
                  Back
                </a>
              </div>
              <StyledLabelsRow>
                <StyledLabels>AMOUNT</StyledLabels>
                <StyledLabels>LOCKED</StyledLabels>
                <StyledLabels>INSTALLMENTS</StyledLabels>
                <StyledLabels>INTEREST</StyledLabels>
                <StyledLabels>STATUS</StyledLabels>
              </StyledLabelsRow>

              <StyledTransactionWrapper showTxDetails={false} failed="">
                <HoverWrapper hover={false}>
                  <StyledTransactionMainRow showTxDetails={false}>
                    <p>Test</p>

                    <p>Test</p>

                    <p>Test</p>

                    <p>Test</p>

                    <p>Test</p>
                  </StyledTransactionMainRow>
                </HoverWrapper>
              </StyledTransactionWrapper>

              <StyledTransactionWrapper showTxDetails={false} failed="">
                <HoverWrapper hover={false}>
                  <StyledTransactionMainRow showTxDetails={false}>
                    <p>Test</p>

                    <p>Test</p>

                    <p>Test</p>

                    <p>Test</p>

                    <p>Test</p>
                  </StyledTransactionMainRow>
                </HoverWrapper>
              </StyledTransactionWrapper>
            </StyledGrid>
          </NoShadowCard>
        )}

        <StyledCard>
          <Footer>
            <div>
              <h6>How does this work under the hood?</h6>
              <p className="border-right">
                Dharma is an open economic protocol for lending money. When you
                request a loan, it pops up on services like{' '}
                <a href="bloqboard.com">bloqboard.com</a>, which is a place
                where people go to lend money. All of this runs on Ethereum.{' '}
                <a
                  rel="noopener noreferrer"
                  target="_blank"
                  href="https://dharma.io"
                >
                  Learn more
                </a>
              </p>
            </div>

            <div>
              <img
                className="dharma-protocol"
                src={dharmaProtocol}
                alt="dharma protocol"
              />
            </div>
          </Footer>
        </StyledCard>
      </div>
    );
  }
}

const reduxProps = ({ account, dharma }) => ({
  account: account,
  dharma: dharma,
});

export default connect(reduxProps, {
  modalOpen,
})(AccountLoans);
