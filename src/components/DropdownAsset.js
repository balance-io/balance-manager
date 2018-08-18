import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import selector from '../assets/selector-grey.svg';
import { ellipseText } from 'balance-common';
import { fonts, colors, shadows, responsive, transitions } from '../styles';
import AssetIcon from './AssetIcon';
import ClickOutside from './ClickOutside';

const StyledWrapper = styled.div`
  width: 100%;
  z-index: 2;
  border-radius: ${({ show }) => (show ? '6px 6px 0 0' : '6px')};
  position: relative;
  -webkit-box-shadow: ${shadows.medium};
  box-shadow: ${shadows.medium};
`;

const StyledAsset = styled.div`
  display: flex;
  align-items: center;
  text-align: right;
  & p {
    color: rgb(${colors.dark});
    font-size: ${fonts.size.medium};
    font-weight: ${fonts.size.semibold};
    margin-left: 10px;
  }
  @media screen and (${responsive.xs.max}) {
    & p {
      font-size: ${fonts.size.small} !important;
    }
  }
`;

const StyledRow = styled.div`
  border-radius: 6px;
  color: rgb(${colors.grey});
  background: rgb(${colors.white});
  font-size: ${fonts.size.small};
  font-weight: ${fonts.weight.medium};
  text-align: center;
  outline: none;
  & > div {
    cursor: ${({ noOptions }) => (noOptions ? 'default' : 'pointer')};
    padding: ${({ noOptions }) => (noOptions ? `10px` : `10px 26px 10px 10px`)};
    background-size: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  & ${StyledAsset} {
    width: ${({ noBalance }) => (noBalance ? '100%' : '60%')};
    text-align: left;
  }
  & > div > p {
    width: ${({ noBalance }) => (noBalance ? '0' : '40%')};
    text-align: right;
  }
  @media screen and (${responsive.xs.max}) {
    & p {
      font-size: ${fonts.size.tiny};
    }
  }
`;

const StyledSelected = styled(StyledRow)`
  background: ${({ noOptions }) =>
    noOptions
      ? `rgb(${colors.white})`
      : `rgb(${colors.white}) url(${selector})`};
  background-size: 8px;
  background-position: 98% 50%;
  background-repeat: no-repeat;
  outline: none;
`;

const StyledDropdown = styled(StyledRow)`
  position: absolute;
  border-radius: 0 0 6px 6px;
  width: 100%;
  top: 100%;
  opacity: ${({ show }) => (show ? 1 : 0)};
  visibility: ${({ show }) => (show ? 'visible' : 'hidden')};
  pointer-events: ${({ show }) => (show ? 'auto' : 'none')};
  -webkit-box-shadow: ${shadows.medium};
  box-shadow: ${shadows.medium};

  max-height: 280px;
  overflow: scroll;

  & > div {
    transition: ${transitions.base};
    border-top: 1px solid rgba(${colors.lightGrey}, 0.7);
    &:hover {
      opacity: 0.6;
    }
  }
`;

class DropdownAsset extends Component {
  state = {
    showDropdown: false,
  };
  onChangeSelected = selected => {
    this.setState({ showDropdown: false });
    this.props.onChange(selected);
  };
  onClickOutside = () => {
    if (this.state.showDropdown) {
      this.setState({ showDropdown: false });
    }
  };
  toggleDropdown = () => {
    if (!this.props.onChange) {
      return;
    }
    this.setState({ showDropdown: !this.state.showDropdown });
  };
  render() {
    const { selected, assets, noBalance, onChange, ...props } = this.props;
    const options = {};
    if (assets.length) {
      const ethereum = assets.filter(asset => asset.symbol === 'ETH')[0];
      const tokensWithValue = assets.filter(
        asset => asset.symbol !== 'ETH' && asset.native,
      );
      const tokensWithNoValue = assets.filter(
        asset => asset.symbol !== 'ETH' && !asset.native,
      );
      let _assets = [ethereum, ...tokensWithValue, ...tokensWithNoValue];
      _assets.forEach(option => {
        if (option) {
          options[option.symbol] = option;
        }
      });
    }
    const empty = !Object.keys(options).length;
    return (
      <ClickOutside onClickOutside={this.onClickOutside}>
        <StyledWrapper show={this.state.showDropdown} {...props}>
          <StyledSelected
            noBalance={noBalance}
            noOptions={Object.keys(options).length < 2}
            onClick={this.toggleDropdown}
          >
            <div>
              <StyledAsset
                data-toggle="tooltip"
                title={!empty ? options[this.props.selected].name : 'Ethereum'}
              >
                <AssetIcon
                  size={18}
                  asset={
                    !empty
                      ? this.props.selected === 'ETH'
                        ? 'ETH'
                        : options[this.props.selected].address
                      : 'ETH'
                  }
                />
                <p>
                  {!empty
                    ? ellipseText(options[this.props.selected].name, 30)
                    : 'Ethereum'}
                </p>
              </StyledAsset>
              <p>
                {!noBalance &&
                  `${options[this.props.selected].balance.display}${
                    options[this.props.selected].native
                      ? ` ≈ ${
                          options[this.props.selected].native.balance.display
                        }`
                      : ''
                  }`}
              </p>
            </div>
          </StyledSelected>
          <StyledDropdown noBalance={noBalance} show={this.state.showDropdown}>
            {Object.keys(options)
              .filter(key => key !== this.props.selected)
              .map(key => (
                <div
                  key={options[key].symbol}
                  onClick={() => this.onChangeSelected(options[key].symbol)}
                >
                  <StyledAsset data-toggle="tooltip" title={options[key].name}>
                    <AssetIcon
                      size={18}
                      asset={key === 'ETH' ? 'ETH' : options[key].address}
                    />
                    <p>{ellipseText(options[key].name, 30)}</p>
                  </StyledAsset>
                  <p>
                    {!noBalance &&
                      `${options[key].balance.display}${
                        options[key].native
                          ? ` ≈ ${options[key].native.balance.display}`
                          : ''
                      }`}
                  </p>
                </div>
              ))}
          </StyledDropdown>
        </StyledWrapper>
      </ClickOutside>
    );
  }
}

DropdownAsset.propTypes = {
  selected: PropTypes.string.isRequired,
  assets: PropTypes.array.isRequired,
  onChange: PropTypes.func,
  noBalance: PropTypes.bool,
};

DropdownAsset.defaultProps = {
  noBalance: false,
};

export default DropdownAsset;
