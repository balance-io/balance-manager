import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Card from './Card';
import Button from './Button';
import CryptoIcon from './CryptoIcon';
import arrowUp from '../assets/arrow-up.svg';
import qrCode from '../assets/qr-code-transparent.svg';
import { convertToNativeString, handleDecimals } from '../helpers/utilities';
import { colors, fonts, shadows, responsive } from '../styles';

const StyledWrapper = styled.div`
  width: 100%;
  padding-top: 10px;
`;

const StyledCard = styled(Card)`
  margin-bottom: 15px;
  max-width: none;
`;

const StyledFlex = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const StyledTop = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  padding: 20px;
  padding-top: 15px;
  & h6 {
    color: rgba(${colors.darkGrey}, 0.7);
    font-weight: ${fonts.weight.semibold};
  }
  @media screen and (${responsive.sm.max}) {
    padding: 16px;
    & h6 {
      margin-top: 15px;
    }
  }
  @media screen and (max-width: 768px) {
    flex-direction: column-reverse;
  }
`;

const StyledAddress = styled.div`
  opacity: 0.7;
  line-height: 1.25;
  margin: 0.2em 0;
  letter-spacing: -0.2px;
  font-weight: ${fonts.weight.semibold};
  @media screen and (${responsive.sm.max}) {
    font-size: ${fonts.size.small};
  }
  @media screen and (${responsive.xs.max}) {
    font-size: ${fonts.size.tiny};
  }
`;

const StyledActions = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  @media screen and (${responsive.sm.max}) {
    justify-content: space-between;
    & button {
      margin: 2px;
    }
  }
`;

const StyledGrid = styled.div`
  width: 100%;
  text-align: right;
  position: relative;
  z-index: 0;
`;

const StyledRow = styled.div`
  width: 100%;
  display: grid;
  position: relative;
  padding: 20px;
  z-index: 0;
  grid-template-columns: 150px 150px 150px auto;
  & p {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    font-size: ${fonts.size.h6};
  }
  @media screen and (${responsive.sm.max}) {
    grid-template-columns: repeat(4, 1fr);
    padding: 16px;
    & p {
      font-size: ${fonts.size.small};
    }
  }
  @media screen and (${responsive.xs.max}) {
    grid-template-columns: 1fr 3fr 3fr;
    & p:nth-child(3) {
      display: none;
    }
  }
`;

const StyledLabelsRow = styled(StyledRow)`
  width: 100%;
  border-width: 2px 0 2px 0;
  border-color: rgba(${colors.lightGrey}, 0.4);
  border-style: solid;
  padding: 10px 20px;
  & p:first-child {
    justify-content: flex-start;
  }
`;

const StyledLabels = styled.p`
  text-transform: uppercase;
  font-size: ${fonts.size.small} !important;
  font-weight: ${fonts.weight.semibold};
  color: rgba(${colors.darkGrey}, 0.7);
`;

const StyledEthereum = styled(StyledRow)`
  width: 100%;
  z-index: 2;
  box-shadow: ${shadows.medium};
  & div p {
    font-weight: ${fonts.weight.medium};
  }
  & > p {
    font-family: ${fonts.family.SFMono};
  }
`;

const StyledToken = styled(StyledRow)`
  width: 100%;
  border-radius: 0 0 8px 8px;
  background-color: rgb(${colors.lightGrey});
  & > * {
    color: rgba(${colors.dark}, 0.6);
  }
  & > p {
    font-family: ${fonts.family.SFMono};
  }
  &:nth-child(n + 2) {
    border-top: 1px solid rgba(${colors.darkGrey}, 0.2);
  }
`;

const StyledAsset = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  text-align: left;
  & p {
    font-size: ${fonts.size.medium};
    margin-left: 10px;
  }
  @media screen and (${responsive.xs.max}) {
    & > img {
      margin-left: 12px;
    }
    & p {
      display: none;
    }
  }
`;

const StyledAccount = styled.div`
  width: 100%;
`;

class Account extends Component {
  state = {
    openSettings: false
  };
  toggleSettings = () => {
    this.setState({ openSettings: !this.state.openSettings });
  };
  toggleSettings = () => {
    this.setState({ openSettings: !this.state.openSettings });
  };
  openSendModal = () =>
    this.props.modalOpen('SEND_ETHER', {
      name: this.props.account.name || `${this.props.account.type} Wallet`,
      address: this.props.account.address,
      type: this.props.account.type,
      balance: this.props.account.balance,
      tokens: this.props.account.tokens,
      nativeCurrency: this.props.nativeCurrency
    });
  openReceiveModal = () =>
    this.props.modalOpen('RECEIVE_ETHER', {
      name: this.props.account.name || `${this.props.account.type} Wallet`,
      address: this.props.account.address
    });
  shouldComponentUpdate(nextProps) {
    if (
      nextProps.nativeCurrency !== this.props.nativeCurrency &&
      nextProps.prices === this.props.prices
    )
      return false;
    return true;
  }
  render() {
    return (
      <StyledWrapper>
        {!!this.props.account ? (
          <StyledAccount>
            <StyledCard fetching={this.props.fetching}>
              <StyledFlex>
                <StyledTop>
                  <div>
                    <h6>{'Your wallet address'} </h6>
                    <StyledAddress>{this.props.account.address}</StyledAddress>
                  </div>

                  <StyledActions>
                    <Button left color="blue" icon={qrCode} onClick={this.openReceiveModal}>
                      Receive
                    </Button>
                    <Button left color="blue" icon={arrowUp} onClick={this.openSendModal}>
                      Send
                    </Button>
                  </StyledActions>
                </StyledTop>
                <StyledGrid>
                  <StyledLabelsRow>
                    <StyledLabels>Asset</StyledLabels>
                    <StyledLabels>Quantity</StyledLabels>
                    <StyledLabels>Price</StyledLabels>
                    <StyledLabels>Total</StyledLabels>
                  </StyledLabelsRow>

                  <StyledEthereum>
                    <StyledAsset>
                      <CryptoIcon currency="ETH" />
                      <p>{'Ethereum'}</p>
                    </StyledAsset>
                    <p>{`${handleDecimals(this.props.account.balance)} ETH`}</p>
                    <p>{convertToNativeString(1, 'ETH')}</p>
                    <p>{convertToNativeString(this.props.account.balance, 'ETH')}</p>
                  </StyledEthereum>
                  {!!this.props.account.tokens &&
                    this.props.account.tokens.map(token => (
                      <StyledToken key={`${this.props.account.address}-${token.symbol}`}>
                        <StyledAsset>
                          <CryptoIcon currency={token.symbol} />
                          <p>{token.name}</p>
                        </StyledAsset>
                        <p>{`${handleDecimals(token.balance)} ${token.symbol}`}</p>
                        <p>{convertToNativeString(1, token.symbol)}</p>
                        <p>{convertToNativeString(token.balance, token.symbol)}</p>
                      </StyledToken>
                    ))}
                </StyledGrid>
              </StyledFlex>
            </StyledCard>
          </StyledAccount>
        ) : (
          <StyledCard fetching={this.props.fetching}>Generate, Import or Add account</StyledCard>
        )}
      </StyledWrapper>
    );
  }
}

Account.propTypes = {
  fetching: PropTypes.bool.isRequired,
  account: PropTypes.object.isRequired,
  prices: PropTypes.object.isRequired,
  nativeCurrency: PropTypes.string.isRequired,
  modalOpen: PropTypes.func.isRequired
};

export default Account;
