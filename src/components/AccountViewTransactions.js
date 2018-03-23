import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import lang from '../languages';
import Card from './Card';
import AssetIcon from './AssetIcon';
import TransactionStatus from './TransactionStatus';
import { colors, fonts, shadows, responsive, transitions } from '../styles';

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
  background-color: rgb(${colors.white});
  grid-template-columns: 2fr 1fr 2fr 2fr 2fr;
  min-height: 0;
  min-width: 0;
  & p {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    font-size: ${fonts.size.h6};
  }
  &:last-child {
    border-radius: 0 0 8px 8px;
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
  color: rgba(${colors.darkGrey}, 0.7);
`;

const StyledTransaction = styled(StyledRow)`
  transition: ${transitions.base};
  width: 100%;
  z-index: 0;
  box-shadow: none;
  & > * {
    font-weight: ${fonts.weight.medium};
    color: ${({ failed }) => (failed ? `rgba(${colors.dark}, 0.3)` : `rgba(${colors.dark}, 0.6)`)};
  }
  & > p:first-child {
    justify-content: flex-start;
  }
  & > p {
    font-family: ${fonts.family.SFMono};
  }
  &:nth-child(n + 3) {
    border-top: 1px solid rgba(${colors.darkGrey}, 0.2);
  }
  @media (hover: hover) {
    &:hover {
      z-index: 10;
      box-shadow: ${shadows.soft};
    }
  }
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

const StyledShowMoreTransactions = styled(StyledRow)`
  grid-template-columns: auto;
  min-height: 0;
  min-width: 0;
  width: 100%;
  z-index: 2;
  border-top: 1px solid rgba(${colors.darkGrey}, 0.2);
  & div p {
    font-weight: ${fonts.weight.medium};
  }
  & > p {
    font-weight: ${fonts.weight.semibold};
    font-family: ${fonts.family.SFMono};
  }
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

const StyledCard = styled(Card)`
  box-shadow: none;
`;

const AccountViewTransactions = ({
  onShowMoreTransactions,
  fetchingTransactions,
  limitTransactions,
  accountAddress,
  transactions,
  ...props
}) => {
  const _transactions = transactions.filter(tx => !tx.interaction);
  return (
    !!_transactions &&
    (!fetchingTransactions ? (
      <StyledGrid>
        <StyledLabelsRow>
          <StyledLabels>{lang.t('account.label_asset')}</StyledLabels>
          <StyledLabels>{lang.t('account.label_status')}</StyledLabels>
          <StyledLabels>{lang.t('account.label_quantity')}</StyledLabels>
          <StyledLabels>{lang.t('account.label_price')}</StyledLabels>
          <StyledLabels>{lang.t('account.label_total')}</StyledLabels>
        </StyledLabelsRow>

        {_transactions.map((tx, idx) => {
          if (idx > limitTransactions) return null;
          return (
            <StyledTransaction failed={tx.error} key={tx.hash}>
              <StyledAsset>
                <AssetIcon currency={tx.asset.symbol} />
                <p>{tx.asset.name}</p>
              </StyledAsset>
              <TransactionStatus tx={tx} accountAddress={accountAddress} />

              <p>{`${tx.value.display}`}</p>
              <p>{tx.price || '———'}</p>
              <p>
                {tx.total ? (tx.from === accountAddress ? `- ${tx.total}` : `${tx.total}`) : '———'}
              </p>
            </StyledTransaction>
          );
        })}
        {limitTransactions < _transactions.length && (
          <StyledShowMoreTransactions onClick={onShowMoreTransactions}>
            <p>{lang.t('account.show_more')}</p>
          </StyledShowMoreTransactions>
        )}
      </StyledGrid>
    ) : (
      <StyledCard minHeight={280} fetching={fetchingTransactions}>
        <div />
      </StyledCard>
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
