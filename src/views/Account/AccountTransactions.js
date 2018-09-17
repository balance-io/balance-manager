import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { lang } from 'balance-common';
import Card from '../../components/Card';
import ButtonCustom from '../../components/ButtonCustom';
import LineBreak from '../../components/LineBreak';
import Blockie from '../../components/Blockie';
import AssetIcon from '../../components/AssetIcon';
import HoverWrapper from '../../components/HoverWrapper';
import ToggleIndicator from '../../components/ToggleIndicator';
import TransactionStatus from '../../components/TransactionStatus';
import etherscanLogo from '../../assets/etherscan-logo.svg';
import ethplorerLogo from '../../assets/ethplorer-logo.svg';
import {
  accountUpdateHasPendingTransaction,
  getLocalTimeDate,
} from 'balance-common';
import { colors, fonts, shadows, responsive } from '../../styles';

const StyledGrid = styled.div`
  width: 100%;
  text-align: right;
  position: relative;
  z-index: 0;
  box-shadow: 0 5px 10px 0 rgba(59, 59, 92, 0.08),
    0 0 1px 0 rgba(50, 50, 93, 0.02), 0 3px 6px 0 rgba(0, 0, 0, 0.06);
  background-color: rgb(${colors.white});
  border-radius: 0 0 10px 10px;
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

    &:not(:first-child) {
      padding-left: 8px;
    }
  }

  &:last-child {
    border-radius: 0 0 10px 10px;
  }

  @media screen and (${responsive.sm.max}) {
    grid-template-columns: 1fr repeat(4, 3fr);
    padding: 16px;

    & p {
      font-size: ${fonts.size.small};
    }
  }

  @media screen and (${responsive.xs.max}) {
    grid-template-columns: 1fr repeat(3, 2fr);
    & p:nth-child(3) {
      display: none;
    }
  }
`;

const StyledLabelsRow = styled(StyledRow)`
  width: 100%;
  border-width: 0 0 2px 0;
  border-color: rgba(136, 136, 136, 0.03);
  border-style: solid;
  padding: 12px 20px;

  & p:first-child {
    justify-content: flex-start;
  }

  @media screen and (${responsive.sm.max}) {
    padding: 12px 16px;
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

  &:last-child {
    & > div > div {
      border-radius: 0 0 10px 10px;
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

const StyledTransactionDetails = styled(StyledTransaction)`
  border-top-color: rgba(${colors.rowDivider});
  border-top-style: solid;
  border-top-width: ${({ showTxDetails }) => (showTxDetails ? `1px` : '0')};
  max-height: ${({ showTxDetails }) => (showTxDetails ? '100%' : '0')};
  padding: ${({ showTxDetails }) =>
    showTxDetails ? '12px 20px 20px' : '0 20px'};
  background-color: rgb(${colors.white});
  overflow: hidden;
  & > div {
    display: flex;
  }
  & p {
    justify-content: flex-start;
  }

  @media screen and (${responsive.sm.max}) {
    padding: ${({ showTxDetails }) =>
      showTxDetails ? '4px 16px 16px' : '0 16px'};
  }
`;

const StyledTransactionTopDetails = styled(StyledTransactionDetails)`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  border-radius: 0;

  p:not(:first-child) {
    padding-left: 0;
  }

  > div {
    text-align: left;
    padding-top: 8px;

    &:not(:last-child) {
      padding-right: 16px;

      p:last-child {
        word-break: break-all;
      }
    }

    &:last-child {
      flex: 1;
      justify-content: space-around;

      > div {
        &:not(:last-child) {
          padding-right: 16px;
          min-width: 152px;
        }

        &:last-child {
          min-width: 144px;
        }
      }

      @media screen and (${responsive.xxs.max}) {
        > div {
          &:not(:last-child) {
            padding-right: 8px;
            min-width: 0;
          }

          &:last-child {
            min-width: 0;
          }
        }
      }
    }
  }
`;

const StyledTransactionBottomDetails = styled(StyledTransactionTopDetails)`
  border-radius: 0 0 10px 10px;

  > div {
    padding-top: 12px;

    &:last-child {
      flex: inherit;
      justify-content: inherit;

      > div {
        &:not(:last-child) {
          min-width: 0;
        }

        &:last-child {
          min-width: 0;
        }
      }
    }
  }

  a {
    &:first-child {
      margin-right: 9px;
    }

    button {
      margin-left: 0;
      margin-top: 0;
    }
  }
`;

const StyledLineBreak = styled(LineBreak)`
  border-top: 1px solid rgba(${colors.rowDivider});
  opacity: ${({ showTxDetails }) => (showTxDetails ? '0' : '1')};
`;

const StyledBlockie = styled(Blockie)`
  margin-right: 10px;
`;

const StyledAsset = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  text-align: left;
  min-height: 0;
  min-width: 0;

  & p {
    font-size: ${fonts.size.medium};
  }

  @media screen and (${responsive.sm.max}) {
    & p {
      display: none;
    }
  }
`;

const StyledLastRow = styled.div`
  padding: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  z-index: 2;
  border-top: 1px solid rgba(${colors.rowDivider});
  border-radius: 0 0 10px 10px;
  background-color: rgb(${colors.white});

  @media screen and (${responsive.sm.max}) {
    padding: 16px;
  }
`;

const StyledCard = styled(Card)`
  box-shadow: none;
`;

const StyledMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(${colors.grey});
  font-weight: ${fonts.weight.medium};
`;

class AccountViewTransactions extends Component {
  state = {
    showTxDetails: null,
    showAllTransactions: false,
  };

  onShowTxDetails = hash => {
    if (this.state.showTxDetails === hash) {
      this.setState({ showTxDetails: null });
    } else {
      this.setState({ showTxDetails: hash });
    }
  };

  onShowAllTransactions = () =>
    this.setState({ showAllTransactions: !this.state.showAllTransactions });

  componentDidMount = () => this.resetPendingTransaction();
  componentDidUpdate = () => this.resetPendingTransaction();

  resetPendingTransaction = () => {
    // If the user was routed to the '/transactions' route/tab because they
    // had a pending transaction, reset the hasPendingTransaction state to false now that
    // the Transactions tab has loaded, and the pending transaction has
    // been made visible to the user
    if (this.props.hasPendingTransaction) {
      this.props.accountUpdateHasPendingTransaction(false);
    }
  };

  render = () => {
    const {
      transactions,
      fetchingTransactions,
      network,
      accountAddress,
      nativeCurrency,
    } = this.props;
    return !!transactions.length ? (
      !fetchingTransactions ? (
        <StyledGrid>
          <StyledLabelsRow>
            <StyledLabels>{lang.t('account.label_asset')}</StyledLabels>
            <StyledLabels>{lang.t('account.label_status')}</StyledLabels>
            <StyledLabels>{lang.t('account.label_quantity')}</StyledLabels>
            <StyledLabels>{lang.t('account.label_price')}</StyledLabels>
            <StyledLabels>{lang.t('account.label_total')}</StyledLabels>
          </StyledLabelsRow>

          {transactions.map((tx, idx, arr) => {
            if (!this.state.showAllTransactions && idx > 10) return null;
            return (
              <StyledTransactionWrapper
                showTxDetails={this.state.showTxDetails === tx.hash}
                failed={tx.error}
                key={tx.hash}
              >
                <HoverWrapper hover={this.state.showTxDetails === tx.hash}>
                  <StyledTransactionMainRow
                    showTxDetails={this.state.showTxDetails === tx.hash}
                    onClick={() => this.onShowTxDetails(tx.hash)}
                  >
                    <StyledAsset>
                      <AssetIcon
                        asset={
                          tx.asset.symbol === 'ETH' ? 'ETH' : tx.asset.address
                        }
                      />
                      <p>{tx.asset.name}</p>
                    </StyledAsset>
                    <p>
                      <TransactionStatus
                        tx={tx}
                        accountAddress={accountAddress}
                      />
                    </p>
                    <p>
                      {tx.from === accountAddress
                        ? `-\u00a0${tx.value.display}`
                        : `${tx.value.display}`}
                    </p>
                    <p>
                      {tx.native &&
                      tx.native[nativeCurrency] &&
                      tx.native[nativeCurrency].price
                        ? tx.native[nativeCurrency].price.display
                        : '———'}
                    </p>
                    <p>
                      {tx.native &&
                      tx.native[nativeCurrency] &&
                      tx.native[nativeCurrency].value
                        ? tx.from === accountAddress
                          ? `-\u00a0${tx.native[nativeCurrency].value.display}`
                          : `${tx.native[nativeCurrency].value.display}`
                        : '———'}
                    </p>
                  </StyledTransactionMainRow>
                  <StyledTransactionTopDetails
                    showTxDetails={this.state.showTxDetails === tx.hash}
                  >
                    <div>
                      <StyledBlockie
                        seed={tx.from === accountAddress ? tx.to : tx.from}
                      />
                      <div>
                        <p>
                          <strong>
                            {tx.from.toLowerCase() === tx.to.toLowerCase()
                              ? lang.t('account.tx_self').toUpperCase()
                              : tx.from.toLowerCase() ===
                                accountAddress.toLowerCase()
                                ? lang.t('account.tx_to').toUpperCase()
                                : lang.t('account.tx_from').toUpperCase()}
                          </strong>
                        </p>
                        <p>
                          {tx.from.toLowerCase() ===
                          accountAddress.toLowerCase()
                            ? tx.to
                            : tx.from
                              ? tx.from
                              : lang.t('account.tx_pending')}
                        </p>
                      </div>
                    </div>
                    <div>
                      <div>
                        <div>
                          <p>
                            <strong>
                              {lang.t('account.tx_fee').toUpperCase()}
                            </strong>
                          </p>
                          <p>{`${
                            tx.txFee && tx.txFee.display
                              ? tx.txFee.display
                              : '———'
                          } ≈ ${
                            tx.native &&
                            tx.native[nativeCurrency] &&
                            tx.native[nativeCurrency].txFee
                              ? tx.native[nativeCurrency].txFee.display
                              : '———'
                          }`}</p>
                        </div>
                      </div>
                      <div>
                        <div>
                          <p>
                            <strong>
                              {lang.t('account.tx_timestamp').toUpperCase()}
                            </strong>
                          </p>
                          <p>
                            {tx.timestamp
                              ? getLocalTimeDate(tx.timestamp.ms)
                              : '———'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </StyledTransactionTopDetails>
                  <StyledTransactionBottomDetails
                    showTxDetails={this.state.showTxDetails === tx.hash}
                  >
                    <div>
                      <div>
                        <p>
                          <strong>
                            {lang.t('account.tx_hash').toUpperCase()}
                          </strong>
                        </p>
                        <p>
                          {tx.hash.startsWith('shapeshift')
                            ? lang.t('account.tx_pending')
                            : tx.hash.replace(/-.*/g, '')}
                        </p>
                      </div>
                    </div>

                    <div>
                      <a
                        href={`https://${
                          network !== 'mainnet' ? `${network}.` : ''
                        }etherscan.io/tx/${tx.hash.replace(/-.*/g, '')}`}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        <ButtonCustom
                          left
                          disabled={tx.hash.startsWith('shapeshift')}
                          txtColor="etherscan"
                          img={etherscanLogo}
                        >
                          {'Etherscan'}
                        </ButtonCustom>
                      </a>
                      <a
                        href={`https://ethplorer.io/tx/${tx.hash.replace(
                          /-.*/g,
                          '',
                        )}`}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        <ButtonCustom
                          left
                          disabled={
                            network !== 'mainnet' ||
                            tx.hash.startsWith('shapeshift')
                          }
                          txtColor="ethplorer"
                          img={ethplorerLogo}
                        >
                          {'Ethplorer'}
                        </ButtonCustom>
                      </a>
                    </div>
                  </StyledTransactionBottomDetails>
                </HoverWrapper>
                <StyledLineBreak
                  noMargin
                  showTxDetails={
                    this.state.showTxDetails === tx.hash ||
                    idx + 1 === arr.length
                  }
                />
              </StyledTransactionWrapper>
            );
          })}
          {transactions.length > 10 && (
            <StyledLastRow>
              <ToggleIndicator
                onClick={this.onShowAllTransactions}
                show={this.state.showAllTransactions}
              >
                {`${
                  !this.state.showAllTransactions
                    ? lang.t('account.show_all')
                    : lang.t('account.show_less')
                } ${lang.t('account.tab_transactions').toLowerCase()}`}
              </ToggleIndicator>
            </StyledLastRow>
          )}
        </StyledGrid>
      ) : (
        <StyledCard minHeight={280} fetching={fetchingTransactions}>
          <StyledMessage>{lang.t('message.failed_request')}</StyledMessage>
        </StyledCard>
      )
    ) : (
      <StyledCard minHeight={280} fetching={fetchingTransactions}>
        <StyledMessage>{lang.t('message.no_transactions')}</StyledMessage>
      </StyledCard>
    );
  };
}

AccountViewTransactions.propTypes = {
  account: PropTypes.object.isRequired,
  accountUpdateHasPendingTransaction: PropTypes.func.isRequired,
  fetchingTransactions: PropTypes.bool.isRequired,
  hasPendingTransaction: PropTypes.bool,
  nativeCurrency: PropTypes.string.isRequired,
  network: PropTypes.string.isRequired,
  transactions: PropTypes.array.isRequired,
};

const reduxProps = ({ account }) => ({
  transactions: account.transactions,
  fetchingTransactions: account.fetchingTransactions,
  accountAddress: account.accountAddress,
  account: account.accountInfo,
  network: account.network,
  nativeCurrency: account.nativeCurrency,
});

export default connect(
  reduxProps,
  {
    accountUpdateHasPendingTransaction,
  },
)(AccountViewTransactions);
