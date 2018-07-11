import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import lang from '../languages';
import i18next from 'i18next';
import Link from './Link';
import Button from './Button';
import balancesTabIcon from '../assets/balances-tab.svg';
import transactionsTabIcon from '../assets/transactions-tab.svg';
import uniquetokensTabIcon from '../assets/star-tab.svg';
import tabBackground from '../assets/tab-background.png';
import tabBackgroundSprite from '../assets/tab-background-sprite.png';
import { colors, fonts, shadows, transitions } from '../styles';

const StyledTabMenu = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 10;
`;

const StyledTabsWrapper = styled.div`
  grid-template-columns: auto;
  box-shadow: none;
  display: flex;

  & a:nth-child(2) button {
    padding-left: 35px;
    margin-left: 4px;
  }

  & a:nth-child(3) button {
    padding-left: 38px;
    margin-left: 8px;
  }
`;

const StyledTabBackground = styled.div`
  width: ${({ width }) => `${width}`}px;
  height: 46px;
  position: absolute;
  top: -1px;
  left: 0;
  transform: ${({ position }) => `translate(${position}px, 0)`};
  background-position-y: 86px;
  background-image: url(${tabBackground});
  transition: ease 0.2s;

  &:before,
  &:after {
    content: '\00a0';
    position: absolute;
    top: 0;
    width: 46px;
    height: 46px;
    background-size: 100%;
    background-image: url(${tabBackgroundSprite});
  }

  &:before {
    left: -46px;
  }

  &:after {
    right: -46px;
    background-position: 0 46px;
  }
`;

const StyledTab = styled(Button)`
  height: 45px;
  font-weight: ${fonts.weight.medium};
  border-radius: 0;
  border: none;
  background: none;
  color: ${({ active }) =>
    active ? `rgb(${colors.blue})` : `rgba(${colors.purpleTextTransparent})`};
  -webkit-box-shadow: ${shadows.medium};
  box-shadow: ${shadows.medium};
  margin: 0;
  display: flex;
  opacity: 1 !important;
  padding-top: 12.5px;
  padding-left: 34px;
  outline: none !important;
  box-shadow: none !important;
  background-size: 181px 46px !important;
  background-position: -47px 0;

  &:hover,
  &:active,
  &:focus {
    opacity: 1 !important;
    outline: none !important;
    box-shadow: none !important;
    background: none;
    transform: none;
    color: ${({ active }) =>
      active ? `rgb(${colors.blue})` : `rgba(${colors.purpleTextTransparent})`};

    & > div {
      opacity: 1 !important;
    }
  }

  & > div {
    transition: ${transitions.base};
    -webkit-mask-size: auto !important;
    mask-size: auto !important;
    margin: 1px 0 0 16px;
    background-color: ${({ active }) =>
      active
        ? `rgb(${colors.blue})`
        : `rgb(${colors.purpleTextTransparent})`} !important;
  }
`;

class TabMenu extends Component {
  constructor() {
    super();

    this.state = {
      activeTab: 'BALANCES_TAB',
      activeLang: 'en',
      tabPosition: 0,
      tabWidth: 0,
    };
  }

  componentDidMount() {
    this.setState({
      tabWidth:
        ReactDOM.findDOMNode(this.refs.balancesTab).getBoundingClientRect()
          .width - 40,
      tabPosition: 24,
    });
  }

  componentDidUpdate() {
    const tabRoute =
      window.browserHistory.location.pathname.replace(
        this.props.match.url,
        '',
      ) || '/';
    let newState = this.state;

    switch (tabRoute) {
      case '/':
        newState = {
          activeTab: 'BALANCES_TAB',
          activeLang: i18next.language,
          tabWidth:
            ReactDOM.findDOMNode(this.refs.balancesTab).getBoundingClientRect()
              .width - 40,
          tabPosition: 24,
        };
        break;
      case '/transactions':
        newState = {
          activeTab: 'TRANSACTIONS_TAB',
          activeLang: i18next.language,
          tabWidth:
            ReactDOM.findDOMNode(
              this.refs.transactionsTab,
            ).getBoundingClientRect().width - 40,
          tabPosition:
            ReactDOM.findDOMNode(this.refs.transactionsTab).offsetLeft + 24,
        };
        break;
      case '/uniquetokens':
        newState = {
          activeTab: 'UNIQUETOKENS_TAB',
          activeLang: i18next.language,
          tabWidth:
            ReactDOM.findDOMNode(
              this.refs.uniqueTokensTab,
            ).getBoundingClientRect().width - 40,
          tabPosition:
            ReactDOM.findDOMNode(this.refs.uniqueTokensTab).offsetLeft + 24,
        };
        break;
      default:
        break;
    }

    if (
      this.state.activeTab !== newState.activeTab ||
      this.state.activeLang !== i18next.language
    ) {
      this.setState(newState);
    }
  }

  render() {
    return (
      <StyledTabMenu>
        <StyledTabBackground
          position={this.state.tabPosition}
          width={this.state.tabWidth}
        />
        <StyledTabsWrapper>
          <Link to={this.props.match.url}>
            <StyledTab
              data-toggle="tooltip"
              title={lang.t('account.tab_balances_tooltip')}
              active={this.state.activeTab === 'BALANCES_TAB'}
              icon={balancesTabIcon}
              ref="balancesTab"
              left
            >
              {lang.t('account.tab_balances')}
            </StyledTab>
          </Link>
          <Link to={`${this.props.match.url}/transactions`}>
            <StyledTab
              data-toggle="tooltip"
              title={lang.t('account.tab_transactions_tooltip')}
              active={this.state.activeTab === 'TRANSACTIONS_TAB'}
              icon={transactionsTabIcon}
              ref="transactionsTab"
              left
            >
              {lang.t('account.tab_transactions')}
            </StyledTab>
          </Link>
          <Link to={`${this.props.match.url}/uniquetokens`}>
            <StyledTab
              data-toggle="tooltip"
              title={lang.t('account.tab_uniquetokens_tooltip')}
              active={this.state.activeTab === 'UNIQUETOKENS_TAB'}
              icon={uniquetokensTabIcon}
              ref="uniqueTokensTab"
              left
            >
              {lang.t('account.tab_uniquetokens')}
            </StyledTab>
          </Link>
        </StyledTabsWrapper>
      </StyledTabMenu>
    );
  }

  _firstTabOffset() {
    const tabCharSizes = [
      'account.tab_balances',
      'account.tab_transactions',
      'account.tab_uniquetokens',
    ].map(resourceName => lang.t(resourceName).length);

    return tabCharSizes[0] * 5;
  }
}

TabMenu.propTypes = {
  match: PropTypes.object.isRequired,
};

export default TabMenu;
