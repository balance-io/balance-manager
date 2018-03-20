import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import lang from '../languages';
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
  grid-template-columns: repeat(5, 1fr);
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

const StyledShowMoreTokens = styled(StyledToken)`
  grid-template-columns: auto;
  padding: 8px 20px;
  & p {
    cursor: pointer;
    text-align: left;
    justify-content: flex-start;
    font-family: ${fonts.family.SFProText};
    font-weight: ${fonts.weight.normal};
    font-size: ${fonts.size.h6};
    color: rgb(${colors.grey});
  }
  @media (hover: hover) {
    &:hover p {
      opacity: 0.7;
    }
  }
`;

const AccountViewBalances = ({
  onShowTokensWithNoValue,
  showTokensWithNoValue,
  account,
  ...props
}) => {
  const ethereum = account.crypto.filter(crypto => crypto.symbol === 'ETH')[0];
  const tokensWithValue = account.crypto.filter(
    crypto => crypto.symbol !== 'ETH' && (crypto.native && crypto.native.value)
  );
  const tokensWithNoValue = account.crypto.filter(
    crypto => crypto.symbol !== 'ETH' && (!crypto.native || (crypto.native && !crypto.native.value))
  );
  return (
    <StyledGrid {...props}>
      <StyledLabelsRow>
        <StyledLabels>{lang.t('account.label_asset')}</StyledLabels>
        <StyledLabels>{lang.t('account.label_quantity')}</StyledLabels>
        <StyledLabels>{lang.t('account.label_price')}</StyledLabels>
        <StyledLabels>{lang.t('account.label_24h')}</StyledLabels>
        <StyledLabels>{lang.t('account.label_total')}</StyledLabels>
      </StyledLabelsRow>

      <StyledEthereum>
        <StyledAsset>
          <CryptoIcon currency={ethereum.symbol} />
          <p>{ethereum.name}</p>
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
      {!!tokensWithValue &&
        tokensWithValue.map(token => (
          <StyledToken key={`${account.address}-${token.symbol}`}>
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
        ))}
      {!!tokensWithNoValue.length &&
        showTokensWithNoValue &&
        tokensWithNoValue.map(token => (
          <StyledToken key={`${account.address}-${token.symbol}`}>
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
        ))}
      {!!tokensWithNoValue.length && (
        <StyledShowMoreTokens>
          <p onClick={onShowTokensWithNoValue}>{`${
            showTokensWithNoValue ? lang.t('account.hide') : lang.t('account.show')
          } ${tokensWithNoValue.length} ${lang.t('account.no_market_value')}`}</p>
        </StyledShowMoreTokens>
      )}
      <StyledMiddleRow>
        <p> </p>
        <p> </p>
        <p> </p>
        <p>{lang.t('account.total_balance')}</p>
        <p>{`${account.totalNative || '---'}`}</p>
      </StyledMiddleRow>
    </StyledGrid>
  );
};

AccountViewBalances.propTypes = {
  onShowTokensWithNoValue: PropTypes.func.isRequired,
  showTokensWithNoValue: PropTypes.bool.isRequired,
  account: PropTypes.object.isRequired
};

export default AccountViewBalances;
