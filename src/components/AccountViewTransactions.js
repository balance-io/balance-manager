import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Card from './Card';
import CryptoIcon from './CryptoIcon';
import { colors, fonts, shadows, responsive } from '../styles';

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

const StyledTransactionType = styled.p`
  font-weight: ${fonts.weight.semibold};
`;

const StyledShowMoreTransactions = styled(StyledEthereum)`
  grid-template-columns: auto;
  box-shadow: none;
  & p {
    cursor: pointer;
    text-align: left;
    justify-content: flex-start;
    font-family: ${fonts.family.SFProText};
    font-weight: ${fonts.weight.semibold};
    font-size: ${fonts.size.h6};
    color: rgb(${colors.grey});
  }
  @media (hover: hover) {
    &:hover p {
      opacity: 0.7;
    }
  }
`;

const AccountViewTransactions = ({
  onShowMoreTransactions,
  fetchingTransactions,
  limitTransactions,
  accountAddress,
  transactions,
  ...props
}) => {
  return (
    !!transactions &&
    (!fetchingTransactions ? (
      <StyledGrid>
        <StyledLabelsRow>
          <StyledLabels>Asset</StyledLabels>
          <StyledLabels>Quantity</StyledLabels>
          <StyledLabels>Price</StyledLabels>
          <StyledLabels>Status</StyledLabels>
          <StyledLabels>Total</StyledLabels>
        </StyledLabelsRow>

        {transactions.map((tx, idx) => {
          if (idx > limitTransactions) return null;
          return (
            <StyledToken key={tx.hash}>
              <StyledAsset>
                <CryptoIcon currency={tx.crypto.symbol} />
                <p>{tx.crypto.name}</p>
              </StyledAsset>
              <p>{`${tx.value} ${tx.crypto.symbol}`}</p>
              <p>{tx.price || '---'}</p>
              <StyledTransactionType>
                {tx.from === accountAddress ? 'Sent' : 'Received'}
              </StyledTransactionType>
              <p>
                {tx.total ? (tx.from === accountAddress ? `- ${tx.total}` : `${tx.total}`) : '---'}
              </p>
            </StyledToken>
          );
        })}
        {limitTransactions < transactions.length && (
          <StyledShowMoreTransactions onClick={onShowMoreTransactions}>
            <p>{`Show more`}</p>
          </StyledShowMoreTransactions>
        )}
      </StyledGrid>
    ) : (
      <Card minHeight={100} fetching={fetchingTransactions}>
        <div />
      </Card>
    ))
  );
};

AccountViewTransactions.propTypes = {
  onShowMoreTransactions: PropTypes.func.isRequired,
  fetchingTransactions: PropTypes.bool.isRequired,
  limitTransactions: PropTypes.number.isRequired,
  accountAddress: PropTypes.string.isRequired,
  transactions: PropTypes.array.isRequired
};

export default AccountViewTransactions;
