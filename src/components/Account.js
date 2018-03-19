import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import Card from './Card';
import Button from './Button';
import AddressCopy from './AddressCopy';
import CryptoIcon from './CryptoIcon';
import arrowUp from '../assets/arrow-up.svg';
import qrCode from '../assets/qr-code-transparent.svg';
import { modalOpen } from '../reducers/_modal';
import { colors, fonts, shadows, responsive } from '../styles';

const StyledAccount = styled.div`
  width: 100%;
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

const StyledAddressWrapper = styled.div`
  width: 100%;
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
  grid-template-columns: repeat(4, 150px) auto;
  & p {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    font-size: ${fonts.size.h6};
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
    font-weight: ${fonts.weight.semibold};
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
  & > p:first-child {
    justify-content: flex-start;
  }
  & > p {
    font-family: ${fonts.family.SFMono};
  }
  &:nth-child(n + 2) {
    border-top: 1px solid rgba(${colors.darkGrey}, 0.2);
  }
`;

const StyledMiddleRow = styled(StyledEthereum)`
  width: 100%;
  box-shadow: none;
  & > p:first-child {
    font-family: ${fonts.family.SFProText};
    justify-content: flex-start;
  }
  & > p {
    font-size: ${fonts.size.medium};
  }
  @media screen and (${responsive.sm.max}) {
    & p {
      font-size: ${fonts.size.h6};
    }
  }
`;

const StyledLastRow = styled(StyledEthereum)`
  width: 100%;
  box-shadow: none;
  & > p:first-child {
    font-family: ${fonts.family.SFProText};
    justify-content: flex-start;
  }
  & > p {
    font-size: ${fonts.size.medium};
  }
  @media screen and (${responsive.sm.max}) {
    & p {
      font-size: ${fonts.size.h6};
    }
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

const StyledPercentage = styled.p`
  color: ${({ percentage }) =>
    percentage
      ? percentage > 0 ? `rgb(${colors.green})` : percentage < 0 ? `rgb(${colors.red})` : `inherit`
      : `inherit`};
`;

const StyledTransactionType = styled.p`
  font-weight: ${fonts.weight.semibold};
`;

const StyledShowMore = styled.p`
  cursor: pointer;
  font-size: ${fonts.size.h6};
  color: rgb(${colors.grey});
  @media (hover: hover) {
    &:hover {
      opacity: 0.7;
    }
  }
`;

class Account extends Component {
  state = {
    openSettings: false,
    limitBalances: 10,
    limitTransactions: 10
  };
  toggleSettings = () => {
    this.setState({ openSettings: !this.state.openSettings });
  };
  toggleSettings = () => {
    this.setState({ openSettings: !this.state.openSettings });
  };
  onShowMoreBalances = () => {
    if (this.state.limitBalances > this.props.account.crypto.length) return null;
    this.setState({ limitBalances: this.state.limitBalances + 10 });
  };
  onShowMoreTransactions = () => {
    if (this.state.limitTransactions > this.props.transactions.length) return null;
    this.setState({ limitTransactions: this.state.limitTransactions + 10 });
  };
  openSendModal = () =>
    this.props.modalOpen('SEND_MODAL', {
      name: this.props.account.name || `${this.props.account.type} Wallet`,
      address: this.props.account.address,
      type: this.props.account.type,
      crypto: this.props.account.crypto,
      prices: this.props.prices
    });
  openReceiveModal = () =>
    this.props.modalOpen('RECEIVE_MODAL', {
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
    const ethereum = this.props.account.crypto.filter(crypto => crypto.symbol === 'ETH')[0];
    const tokensWithPrice = this.props.account.crypto.filter(
      crypto => crypto.symbol !== 'ETH' && (crypto.native && crypto.native.value)
    );
    const tokensWithoutPrice = this.props.account.crypto.filter(
      crypto =>
        crypto.symbol !== 'ETH' && (!crypto.native || (crypto.native && !crypto.native.value))
    );
    const tokens = [...tokensWithPrice, ...tokensWithoutPrice];
    return (
      <StyledAccount>
        <Card fetching={this.props.fetching}>
          <StyledFlex>
            <StyledTop>
              <StyledAddressWrapper>
                <h6>{'Your wallet address'} </h6>
                <AddressCopy address={this.props.account.address} />
              </StyledAddressWrapper>

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
                <StyledLabels>24H</StyledLabels>
                <StyledLabels>Total</StyledLabels>
              </StyledLabelsRow>

              <StyledEthereum>
                <StyledAsset>
                  <CryptoIcon currency={ethereum.symbol} />
                  <p>{'Ethereum'}</p>
                </StyledAsset>
                <p>{`${ethereum.balance} ${ethereum.symbol}`}</p>
                <p>{ethereum.native && ethereum.native.price ? ethereum.native.price : '---'}</p>
                <StyledPercentage
                  percentage={ethereum.native ? Number(ethereum.native.change.slice(0, -1)) : 0}
                >
                  {ethereum.native && ethereum.native.change ? ethereum.native.change : '---'}
                </StyledPercentage>
                <p>{ethereum.native && ethereum.native.string ? ethereum.native.string : '---'}</p>
              </StyledEthereum>
              {!!tokens &&
                tokens.map((token, idx) => {
                  if (idx > this.state.limitBalances) return null;
                  return (
                    <StyledToken key={`${this.props.account.address}-${token.symbol}`}>
                      <StyledAsset>
                        <CryptoIcon currency={token.symbol} />
                        <p>{token.name}</p>
                      </StyledAsset>
                      <p>{`${token.balance} ${token.symbol}`}</p>
                      <p>{token.native && token.native.price ? token.native.price : '---'}</p>
                      <StyledPercentage
                        percentage={token.native ? Number(token.native.change.slice(0, -1)) : 0}
                      >
                        {token.native && token.native.change ? token.native.change : '---'}
                      </StyledPercentage>
                      <p>{token.native && token.native.string ? token.native.string : '---'}</p>
                    </StyledToken>
                  );
                })}
              {this.state.limitBalances < this.props.account.crypto.length && (
                <StyledToken>
                  <StyledShowMore onClick={this.onShowMoreBalances}>{`Show more`}</StyledShowMore>
                  <p> </p>
                  <p> </p>
                  <p> </p>
                  <p> </p>{' '}
                </StyledToken>
              )}
              <StyledMiddleRow>
                <p>{!!this.props.transactions ? `Transactions` : ' '}</p>
                <p> </p>
                <p> </p>
                <p>{`Balance`}</p>
                <p>{`${this.props.account.totalNative || '---'}`}</p>
              </StyledMiddleRow>
            </StyledGrid>

            {!!this.props.transactions && (
              <StyledGrid>
                <StyledLabelsRow>
                  <StyledLabels>Asset</StyledLabels>
                  <StyledLabels>Quantity</StyledLabels>
                  <StyledLabels>Price</StyledLabels>
                  <StyledLabels>Type</StyledLabels>
                  <StyledLabels>Total</StyledLabels>
                </StyledLabelsRow>
                {this.props.transactions.map((tx, idx) => {
                  if (idx > this.state.limitTransactions) return null;
                  return (
                    <StyledToken key={tx.hash}>
                      <StyledAsset>
                        <CryptoIcon currency={tx.crypto.symbol} />
                        <p>{tx.crypto.name}</p>
                      </StyledAsset>
                      <p>{`${tx.value} ${tx.crypto.symbol}`}</p>
                      <p>{tx.price || '---'}</p>
                      <StyledTransactionType>
                        {tx.from === this.props.account.address ? 'Sent' : 'Received'}
                      </StyledTransactionType>
                      <p>{tx.total || '---'}</p>
                    </StyledToken>
                  );
                })}
                <StyledLastRow>
                  <StyledShowMore onClick={this.onShowMoreTransactions}>
                    {this.state.limitTransactions < this.props.transactions.length
                      ? `Show more`
                      : ' '}
                  </StyledShowMore>
                  <p> </p>
                  <p> </p>
                  <p> </p>
                  <p> </p>{' '}
                </StyledLastRow>
              </StyledGrid>
            )}
          </StyledFlex>
        </Card>
      </StyledAccount>
    );
  }
}

Account.propTypes = {
  modalOpen: PropTypes.func.isRequired,
  fetching: PropTypes.bool.isRequired,
  account: PropTypes.object.isRequired,
  prices: PropTypes.object.isRequired,
  nativeCurrency: PropTypes.string.isRequired,
  transactions: PropTypes.array.isRequired
};

const reduxProps = ({ account }) => ({
  fetching: account.fetching,
  account: account.account,
  prices: account.prices,
  nativeCurrency: account.nativeCurrency,
  transactions: account.transactions
});

export default connect(reduxProps, {
  modalOpen
})(Account);
