import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import UnFlexedCard from '../../components/UnFlexedCard';
import Button from '../../components/Button';
import LoansMenu from '../../components/AccountLoansMenu';
import { colors } from '../../styles';

import ethBadge from '../../assets/eth-badge.svg';
import daiBadge from '../../assets/dai-badge.svg';
import arrowReceived from '../../assets/circle-arrow.svg';
import dharmaProtocol from '../../assets/powered-by-dharma.png';

import { modalOpen } from '../../reducers/_modal';

const StyledCard = styled(UnFlexedCard)`
  border-radius: 0px;
  box-shadow: none;

  &.content-section {
    padding: 15px;
  }

  &:first-of-type {
    padding: 15px;
  }
`;

const BorrowDiv = styled.div`
  width: 100%;
  background-color: rgb(${colors.lightGrey});
  border: 1px solid rgb(${colors.borderGrey});
  padding: 15px;
  border-radius: 7.6px;
  margin-top: 30px;
  display: flex;
  flex-direction: row;
  align-items: center;

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

    this.state = {
      currentTab: 'COLLATERALIZED_LOANS',
    };
  }

  setTab = tab => {
    this.setState({
      currentTab: tab,
    });
  };

  openModal = currencyToBorrow => {
    this.props.modalOpen('LOANS_REQUEST_MODAL');
  };

  render() {
    return (
      <div className="account-loans">
        <StyledCard minHeight={280} className="content-section">
          <LoansMenu
            {...this.props}
            setTab={this.setTab}
            currentTab={this.state.currentTab}
          />

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
                onClick={() => this.openModal('dai')}
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
                Get Ether, the fuel that powers the Ethereum network by putting
                down some Dai as collateral.{' '}
              </p>
            </div>

            <div className="controls">
              <Button
                activeColor="brightGreenHover"
                color="brightGreen"
                hoverColor="brightGreenHover"
                onClick={() => this.openModal('eth')}
              >
                <img src={arrowReceived} alt="borrow eth" />
                Borrow ETH{' '}
              </Button>
            </div>
          </BorrowDiv>
        </StyledCard>

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

const reduxProps = ({ account }) => ({
  accountAddress: account.accountAddress,
  accountType: account.accountType,
});

export default connect(reduxProps, {
  modalOpen,
})(AccountLoans);
