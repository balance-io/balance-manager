import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import lang from '../../languages';
import AssetIcon from '../../components/AssetIcon';
import ToggleIndicator from '../../components/ToggleIndicator';
import { ellipseText } from '../../helpers/utilities';
import {
  convertStringToNumber,
  hasHighMarketValue,
  hasLowMarketValue,
} from '../../helpers/bignumber';
import { colors, fonts, responsive } from '../../styles';

const StyledGrid = styled.div`
  width: 100%;
  text-align: right;
  position: relative;
  z-index: 0;
  box-shadow: 0 5px 10px 0 rgba(59, 59, 92, 0.08),
    0 0 1px 0 rgba(50, 50, 93, 0.02), 0 3px 6px 0 rgba(0, 0, 0, 0.06);
`;

const StyledRow = styled.div`
  width: 100%;
  display: grid;
  position: relative;
  padding: 20px;
  z-index: 0;
  background-color: rgb(${colors.white});
  grid-template-columns: 5fr repeat(4, 4fr);
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
    grid-template-columns: 5fr repeat(4, 4fr);
    padding: 16px;
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
  border-color: rgba(136, 136, 136, 0.03);
  border-style: solid;
  padding: 12px 20px;
  & p:first-child {
    justify-content: flex-start;
  }
`;

const StyledLabels = styled.p`
  text-transform: uppercase;
  font-size: ${fonts.size.small} !important;
  font-weight: ${fonts.weight.semibold};
  color: rgb(${colors.mediumGrey});
  letter-spacing: 0.46px;
`;

const StyledEthereum = styled(StyledRow)`
  width: 100%;
  z-index: 2;
  & div p {
    font-weight: ${fonts.weight.medium};
  }
  & > p {
    font-weight: ${fonts.weight.regular};
    font-family: ${fonts.family.SFMono};
  }
  & p:last-child {
    font-weight: ${fonts.weight.medium};
  }
`;

const StyledToken = styled(StyledRow)`
  width: 100%;
  & > * {
    font-weight: ${fonts.weight.regular};
    color: rgb(${colors.darkText});
  }
  & > p:first-child {
    justify-content: flex-start;
  }
  & > p {
    font-family: ${fonts.family.SFMono};
  }
  &:nth-child(n + 3) {
    border-top: 1px solid rgba(${colors.rowDivider});
  }
`;

const StyledAsset = styled.div`
  width: 100%;
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

const StyledPercentage = styled.p`
  color: ${({ percentage }) =>
    percentage
      ? percentage > 0
        ? `rgb(${colors.green})`
        : percentage < 0
          ? `rgb(${colors.red})`
          : `inherit`
      : `inherit`};
`;

const StyledLastRow = styled(StyledRow)`
  width: 100%;
  z-index: 2;
  grid-template-columns: 3fr 1fr;
  min-height: 0;
  min-width: 0;
  border-top: 1px solid rgba(${colors.rowDivider});
  & > p {
    font-size: ${fonts.size.medium};
    font-weight: ${fonts.weight.semibold};
    font-family: ${fonts.family.SFMono};
  }
  & > p:first-child {
    font-family: ${fonts.family.SFProText};
    justify-content: flex-start;
  }
  @media screen and (${responsive.sm.max}) {
    & p {
      font-size: ${fonts.size.h6};
    }
  }
`;

const StyledShowMoreTokens = styled(StyledToken)`
  grid-template-columns: 100%;
  min-height: 0;
  min-width: 0;
  padding: 0;
  position: relative;
  cursor: pointer;
  text-align: left;
  justify-content: flex-start;
  font-family: ${fonts.family.SFProText};
  font-weight: ${fonts.weight.medium};
  font-size: 13px;
  color: rgb(${colors.grey});
  margin-top: -1px;
  padding-left: 19px;

  @media (hover: hover) {
    &:hover p {
      opacity: 0.7;
    }
  }
`;

class AccountBalances extends Component {
  state = {
    disableToggle: false,
    showMoreTokens: false,
  };
  onShowMoreTokens = () => {
    this.setState({ showMoreTokens: !this.state.showMoreTokens });
  };
  render() {
    const { accountInfo } = this.props;
    if (!accountInfo.assets) return null;
    const ethereum = this.props.accountInfo.assets.filter(
      asset => asset.symbol === 'ETH',
    )[0];
    const tokens = this.props.accountInfo.assets.filter(
      asset => asset.symbol !== 'ETH' && typeof asset === 'object' && !!asset,
    );
    if (tokens.length && tokens.length < 5 && !this.state.disableToggle) {
      this.setState({ disableToggle: true });
    }
    const tokensWithHighMarketValue = tokens.filter(
      asset => asset.symbol !== 'ETH' && hasHighMarketValue(asset),
    );
    const tokensWithLowMarketValue = tokens.filter(
      asset => asset.symbol !== 'ETH' && hasLowMarketValue(asset),
    );
    const tokensWithNoMarketValue = tokens.filter(asset => !asset.native);
    let tokensAlwaysDisplay = tokensWithHighMarketValue;
    let tokensToggleDisplay = [
      ...tokensWithLowMarketValue,
      ...tokensWithNoMarketValue,
    ];
    if (this.state.disableToggle) {
      tokensAlwaysDisplay = [...tokensAlwaysDisplay, ...tokensToggleDisplay];
      tokensToggleDisplay = [];
    }
    const allLowMarketTokensHaveNoValue =
      tokensWithNoMarketValue.length === tokensToggleDisplay.length;
    return (
      <StyledGrid>
        <StyledLabelsRow>
          <StyledLabels>{lang.t('account.label_asset')}</StyledLabels>
          <StyledLabels>{lang.t('account.label_quantity')}</StyledLabels>
          <StyledLabels>{lang.t('account.label_price')}</StyledLabels>
          <StyledLabels>{lang.t('account.label_24h')}</StyledLabels>
          <StyledLabels>{lang.t('account.label_total')}</StyledLabels>
        </StyledLabelsRow>

        <StyledEthereum>
          <StyledAsset>
            <AssetIcon asset={ethereum.symbol} />
            <p>{ethereum.name}</p>
          </StyledAsset>
          <p>{ethereum.balance.display}</p>
          <p>{ethereum.native ? ethereum.native.price.display : '———'}</p>
          <StyledPercentage
            percentage={
              ethereum.native
                ? convertStringToNumber(ethereum.native.change.amount)
                : 0
            }
          >
            {ethereum.native ? ethereum.native.change.display : '———'}
          </StyledPercentage>
          <p>{ethereum.native ? ethereum.native.balance.display : '———'}</p>
        </StyledEthereum>
        {!!tokensAlwaysDisplay &&
          tokensAlwaysDisplay.map(token => (
            <StyledToken key={`${accountInfo.address}-${token.symbol}`}>
              <StyledAsset>
                <AssetIcon asset={token.address} />
                <p>{token.name}</p>
              </StyledAsset>
              <p>{token.balance.display}</p>
              <p>{token.native ? token.native.price.display : '———'}</p>
              <StyledPercentage
                percentage={
                  token.native
                    ? convertStringToNumber(token.native.change.amount)
                    : 0
                }
              >
                {token.native ? token.native.change.display : '———'}
              </StyledPercentage>
              <p>{token.native ? token.native.balance.display : '———'}</p>
            </StyledToken>
          ))}
        {!!tokensToggleDisplay.length &&
          this.state.showMoreTokens &&
          tokensToggleDisplay.map(token => (
            <StyledToken key={`${accountInfo.address}-${token.symbol}`}>
              <StyledAsset data-toggle="tooltip" title={token.name}>
                <AssetIcon asset={token.address} />
                <p>{ellipseText(token.name, 30)}</p>
              </StyledAsset>
              <p>{token.balance.display}</p>
              <p>{token.native ? token.native.price.display : '———'}</p>
              <StyledPercentage
                percentage={
                  token.native
                    ? convertStringToNumber(token.native.change.amount)
                    : 0
                }
              >
                {token.native ? token.native.change.display : '———'}
              </StyledPercentage>
              <p>{token.native ? token.native.balance.display : '———'}</p>
            </StyledToken>
          ))}
        <StyledLastRow>
          {!!tokensToggleDisplay.length && !this.state.disableToggle ? (
            <StyledShowMoreTokens onClick={this.onShowMoreTokens}>
              <ToggleIndicator show={this.state.showMoreTokens} />
              {`${
                this.state.showMoreTokens
                  ? lang.t('account.hide')
                  : lang.t('account.show')
              } ${tokensToggleDisplay.length} ${
                tokensToggleDisplay.length === 1
                  ? lang.t('account.token')
                  : lang.t('account.tokens')
              } ${
                allLowMarketTokensHaveNoValue
                  ? lang.t('account.no_market_value')
                  : lang.t('account.low_market_value')
              }`}
            </StyledShowMoreTokens>
          ) : (
            <div />
          )}
          <p>{`${accountInfo.total.display || '———'}`}</p>
        </StyledLastRow>
      </StyledGrid>
    );
  }
}

AccountBalances.propTypes = {
  accountInfo: PropTypes.object.isRequired,
};
const reduxProps = ({ account }) => ({
  accountInfo: account.accountInfo,
});

export default connect(
  reduxProps,
  null,
)(AccountBalances);
