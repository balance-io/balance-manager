import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import loanLengths from '../references/loan-lengths.json';
import Dropdown from '../components/Dropdown';
import styled from 'styled-components';
import lang from '../languages';
import Card from '../components/UnFlexedCard';
import Button from '../components/Button';
import Input from '../components/Input';
import { modalClose } from '../reducers/_modal';
import { capitalize } from '../helpers/utilities';
import { fonts, colors, responsive, shadows } from '../styles';

import { Slider } from 'reactrangeslider';

import dharmaProtocol from '../assets/powered-by-dharma.png';
import arrowReceived from '../assets/circle-arrow.svg';

const StyledDropdown = styled(Dropdown)`
  .dropdown-selected {
    background-color: rgb(${colors.white});
    font-size: 16px;
    border-radius: 7.6px;
    width: 125px;
    padding: 0px;
    margin-top: 20px;
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

  .tiny-input {
    width: 50px;
    margin-top: 20px;
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
    margin-top: 30px;
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
`;

class LoansRequestModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loanLength: 'Months',
      interestRate: 1,
    };
  }

  onClose = () => {
    this.props.modalClose();
  };

  updateLoanLength = res => {
    console.log('updating', res);

    this.setState({
      loanLength: res,
    });
  };

  updateInterestRate = res => {
    this.setState({
      interestRate: res,
    });
  };

  render = () => {
    return (
      <StyledCard>
        <StyledContainer>
          <StyledFlex>
            <span>I want to borrow</span>
            <StyledFlex className="medium-input">
              <Input monospace placeholder="1" type="text" />
              <StyledAmountCurrency>ETH</StyledAmountCurrency>
            </StyledFlex>

            <span>by locking up</span>

            <StyledFlex className="medium-input">
              <Input monospace placeholder="450" type="text" />
              <StyledAmountCurrency>DAI</StyledAmountCurrency>
            </StyledFlex>

            <span>for</span>

            <StyledFlex>
              <Input
                className="tiny-input"
                monospace
                placeholder="1"
                type="text"
              />
              <StyledDropdown
                displayKey={`length`}
                selected={this.state.loanLength}
                onChange={this.updateLoanLength}
                options={loanLengths}
                dark
              />
            </StyledFlex>
          </StyledFlex>
        </StyledContainer>

        <StyledContainer>
          <StyledFlex className="align-items">
            <span> I want to pay </span>
            <Slider
              wrapperStyle={{
                width: '65%',
                marginTop: '23px',
              }}
              handleStyle={{
                backgroundColor: '#F3764A',
                border: '1px solid #F3764A',
                boxShadow: shadows.medium,
              }}
              focusedHandleStyle={{
                backgroundColor: '#F3764A',
                border: '1px solid #F3764A',
                boxShadow: shadows.medium,
              }}
              activeHandleStyle={{
                backgroundColor: '#F3764A',
                border: '1px solid #F3764A',
                boxShadow: shadows.medium,
              }}
              hoveredHandleStyle={{
                backgroundColor: '#F3764A',
                border: '1px solid #F3764A',
                boxShadow: shadows.medium,
              }}
              trackStyle={{
                backgroundColor: '#E4E4E4',
                borderColor: 'transparent',
                height: '7px',
              }}
              defaultValue={this.state.interestRate}
              step={5}
              onChange={this.updateInterestRate}
            />
            <span> interest </span>
          </StyledFlex>
        </StyledContainer>

        <StyledContainer>
          <label>PERCENTAGE</label>
          <p>{this.state.interestRate}% for full term</p>
        </StyledContainer>

        <StyledContainer className="loans-modal-footer">
          <div className="footer-content">
            <img src={dharmaProtocol} />

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
};

const reduxProps = ({ account }) => ({
  accountAddress: account.accountAddress,
  accountType: account.accountType,
});

export default connect(reduxProps, {
  modalClose,
})(LoansRequestModal);
