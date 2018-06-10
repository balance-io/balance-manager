import React, { Component } from 'react';
import * as _ from 'lodash';

import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import lang from '../../languages';
import AssetIcon from '../../components/AssetIcon';
import ToggleIndicator from '../../components/ToggleIndicator';
import {
  accountHideAsset,
  accountShowAsset
} from '../../reducers/_account';
import {
  convertStringToNumber,
  hasLowMarketValue,
} from '../../helpers/bignumber';

import {
    StyledGrid,
    StyledLabelsRow,
    StyledLabels,
    StyledEthereum,
    StyledToken,
    StyledAsset,
    StyledPercentage,
    StyledLastRow,
    StyledShowMoreTokens,
    StyledHideIcon,
    StyledShowIcon
} from './styles';

class AccountBalances extends Component {
  state = {
    disableToggle: false,
    showMoreTokens: false,
    hoveredAsset: null
  };
  onShowMoreTokens = () => {
    this.setState({ showMoreTokens: !this.state.showMoreTokens });
  };
  onAssetHover = address => {
    this.setState({ hoveredAsset: address });
  }
  onHideAsset = address => {
    this.props.accountHideAsset(address); 
    this.setState({ hoveredAsset: null });
  }
  onShowAsset = address => {
    this.props.accountShowAsset(address);
    this.setState({ hoveredAsset: null });
  }
  render() {
    if (!this.props.accountInfo.assets) return null;

    const emptyBalanceDisplay = '———';
    const ethereum = this.props.accountInfo.assets.filter(asset => asset.symbol === 'ETH')[0];
    const assets = this._getAssets();

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
          <p>{ethereum.native ? ethereum.native.price.display : emptyBalanceDisplay}</p>
          <StyledPercentage
            percentage={
              ethereum.native
                ? convertStringToNumber(ethereum.native.change.amount)
                : 0
            }
          >
            {ethereum.native ? ethereum.native.change.display : emptyBalanceDisplay}
          </StyledPercentage>
          <p>{ethereum.native ? ethereum.native.balance.display : emptyBalanceDisplay}</p>
        </StyledEthereum>
        {assets.visible && assets.visible.map(token => (
            <StyledToken
              key={`${this.props.accountInfo.address}-${token.symbol}`}
            >
              <StyledAsset 
                onMouseEnter={() => this.onAssetHover(token.address)}
                onMouseLeave={() => this.onAssetHover(null)}
              >
                <AssetIcon asset={token.address} />
                <p>{token.name}</p>
                {this.state.hoveredAsset === token.address && (
                  <StyledHideIcon onClick={() => this.onHideAsset(token.address)} />    
                )}                
              </StyledAsset>
              <p>{token.balance.display}</p>
              <p>{token.native ? token.native.price.display : emptyBalanceDisplay}</p>
              <StyledPercentage
                percentage={
                  token.native
                    ? convertStringToNumber(token.native.change.amount)
                    : 0
                }
              >
                {token.native ? token.native.change.display : emptyBalanceDisplay}
              </StyledPercentage>
              <p>{token.native ? token.native.balance.display : emptyBalanceDisplay}</p>
            </StyledToken>
          ))}
        <StyledLastRow>
          {assets.hidden && assets.hidden.length > 0 ? (
            <StyledShowMoreTokens onClick={this.onShowMoreTokens}>
              <ToggleIndicator show={this.state.showMoreTokens} />
              {`${
                this.state.showMoreTokens
                  ? lang.t('account.hide')
                  : lang.t('account.show') + ' ' + assets.hidden.length
              }
              ${this.state.showMoreTokens
                  ? ''
                  : lang.t('account.hidden')} 
              ${
                assets.hidden.length === 1
                  ? lang.t('account.token')
                  : lang.t('account.tokens')
              } `}
            </StyledShowMoreTokens>
          ) : (
            <div />
          )}
          {(!this.state.showMoreTokens || !assets.hidden || assets.hidden.length === 0) &&
            <p>{`${this.props.accountInfo.total.display || emptyBalanceDisplay}`}</p>
          }
        </StyledLastRow>
        
        {/* Hidden Tokens */}
        {this.state.showMoreTokens && 
          assets.hidden && assets.hidden.length > 0 &&
          <React.Fragment>
            {assets.hidden.map(token => (
                <StyledToken
                  key={`${this.props.accountInfo.address}-${token.symbol}`}
                  isSeparator={token.isSeparator}
                >
                <StyledAsset 
                    onMouseEnter={() => this.onAssetHover(token.address)}
                    onMouseLeave={() => this.onAssetHover(null)}
                >
                    <AssetIcon asset={token.address} />
                    <p>{token.name}</p>
                    {this.state.hoveredAsset === token.address && 
                    <StyledShowIcon onClick={() => this.onShowAsset(token.address)}/>}
                </StyledAsset>
                <p>{token.balance.display}</p>
                <p>{token.native ? token.native.price.display : emptyBalanceDisplay}</p>
                <StyledPercentage
                    percentage={
                    token.native
                        ? convertStringToNumber(token.native.change.amount)
                        : 0
                    }
                >
                    {token.native ? token.native.change.display : emptyBalanceDisplay}
                </StyledPercentage>
                <p>{token.native ? token.native.balance.display : emptyBalanceDisplay}</p>
                </StyledToken>
            ))}
            <StyledLastRow>
                <p></p>
                <p>{`${this.props.accountInfo.total.display || emptyBalanceDisplay}`}</p>
            </StyledLastRow>
          </React.Fragment>
        }
      </StyledGrid>
    );
  }

  _getAssets() {
    const tokens = this.props.accountInfo.assets.filter(
      asset => asset.symbol !== 'ETH' && typeof asset === 'object' && !!asset,
    );

    const tokensWithNoMarketValue = tokens.filter(asset => !asset.native);
    const tokensWithLowMarketValue = tokens.filter(
        asset => asset.symbol !== 'ETH' && (hasLowMarketValue(asset))
    );
    
    const dustTokens = _([...tokensWithLowMarketValue, ...tokensWithNoMarketValue])
      .map(t => t.address)
      .without(...this.props.visibleAssets)
      .value();

    const hiddenTokenAddresses = [...dustTokens, ...this.props.hiddenAssets];
    const hidden = tokens.filter(asset => _.includes(hiddenTokenAddresses, asset.address))
    const visible = tokens.filter(asset => !_.includes(hiddenTokenAddresses, asset.address))

    hidden.sort((b, a) =>
      (a.native ? a.native.balance.amount : 0) - (b.native ? b.native.balance.amount : 0));

    for (let token of hidden) {
      if (!token.native) {
        token.isSeparator = true;
        break;
      }
    }

    return { hidden, visible }
  }
}

AccountBalances.propTypes = {
  accountInfo: PropTypes.object.isRequired,
};
const reduxProps = ({ account }) => ({
  accountInfo: account.accountInfo,
  visibleAssets: account.visibleAssets,
  hiddenAssets: account.hiddenAssets
});

export default connect(reduxProps, {
  accountHideAsset,
  accountShowAsset
})(AccountBalances);
