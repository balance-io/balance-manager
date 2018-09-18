import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { lang } from 'balance-common';
import i18next from 'i18next';
import Link from './Link';
import Button from './Button';
import balancesTabIcon from '../assets/balances-tab.svg';
import transactionsTabIcon from '../assets/transactions-tab.svg';
import uniquetokensTabIcon from '../assets/star-tab.svg';
import tabBackground from '../assets/tab-background.png';
import tabBackgroundSprite from '../assets/tab-background-sprite.png';
import { colors, fonts, shadows, transitions } from '../styles';

const tabSize = '46px';

const smBreakpoint = '442px';
const smTabSize = '54px';

const xsBreakpoint = '375px';
const xsTabSize = '68px';

const StyledTabMenu = styled.div`
  position: relative;
  z-index: 1;
`;

const StyledTabsWrapper = styled.div`
  box-shadow: none;
  display: flex;
`;

const StyledTabBackground = styled.div`
  width: ${({ width }) => `${width}`}px;
  height: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  transform: ${({ position }) => `translate(${position}px, 0)`};
  background-position-y: -6px;
  background-image: url(${tabBackground});
  transition: ease 0.2s;
  z-index: -1;

  &:before,
  &:after {
    content: '\00a0';
    position: absolute;
    bottom: 0;
    width: ${tabSize};
    height: ${tabSize};
    background-size: 100%;
    background-image: url(${tabBackgroundSprite});
  }

  &:before {
    left: -16px;
  }

  &:after {
    right: -16px;
    background-position: 0 100%;
  }

  @media screen and (max-width: ${smBreakpoint}) {
    background-position-y: -5px;

    &:before,
    &:after {
      width: ${smTabSize};
      height: ${smTabSize};
    }

    &:before {
      left: -20px;
    }

    &:after {
      right: -20px;
    }
  }

  @media screen and (max-width: ${xsBreakpoint}) {
    background-position-y: -3px;

    &:before,
    &:after {
      width: ${xsTabSize};
      height: ${xsTabSize};
    }

    &:before {
      left: -24px;
    }

    &:after {
      right: -24px;
    }
  }
`;

const StyledTab = styled(Button)`
  height: ${tabSize};
  font-weight: ${fonts.weight.medium};
  border-radius: 0;
  border: none;
  background: none;
  color: ${({ active }) =>
    active ? `rgb(${colors.blue})` : `rgba(${colors.purpleTextTransparent})`};
  box-shadow: ${shadows.medium};
  margin: 0;
  opacity: 1;
  padding: 0 16px;
  line-height: 50px;
  outline: none !important;
  box-shadow: none !important;

  @media screen and (max-width: ${smBreakpoint}) {
    height: ${smTabSize};
    line-height: 1;
  }

  @media screen and (max-width: ${xsBreakpoint}) {
    height: ${xsTabSize};
  }

  &:active,
  &:focus {
    opacity: 1;
    outline: none !important;
    box-shadow: none !important;
    background: none;
    transform: none;
    color: ${({ active }) =>
      active ? `rgb(${colors.blue})` : `rgba(${colors.purpleTextTransparent})`};

    & > span {
      opacity: 1;
    }
  }

  &:hover {
    background-color: transparent;
    color: ${`rgb(${colors.blue})`};
    transform: none;

    & > span {
      background-color: ${`rgb(${colors.blue})`} !important;
    }
  }

  & > span {
    transition: ${transitions.base};
    mask-size: auto;
    background-color: ${({ active }) =>
      active
        ? `rgb(${colors.blue})`
        : `rgba(${colors.purpleTextTransparent})`} !important;

    @media screen and (max-width: ${smBreakpoint}) {
      display: block !important;
      margin: 3px auto;
    }

    @media screen and (max-width: ${xsBreakpoint}) {
      margin-top: 10px;
    }
  }
`;

const StyledTabText = styled.p`
  display: inline-block;
  vertical-align: middle;

  @media screen and (max-width: 375px) {
    line-height: 16px;
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
      tabWidth: ReactDOM.findDOMNode(
        this.refs.balancesTab,
      ).getBoundingClientRect().width,
      tabPosition: 0,
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
          tabWidth: ReactDOM.findDOMNode(
            this.refs.balancesTab,
          ).getBoundingClientRect().width,
          tabPosition: 0,
        };
        break;
      case '/transactions':
        newState = {
          activeTab: 'TRANSACTIONS_TAB',
          activeLang: i18next.language,
          tabWidth: ReactDOM.findDOMNode(
            this.refs.transactionsTab,
          ).getBoundingClientRect().width,
          tabPosition: ReactDOM.findDOMNode(this.refs.transactionsTab)
            .offsetLeft,
        };
        break;
      case '/uniquetokens':
        newState = {
          activeTab: 'UNIQUETOKENS_TAB',
          activeLang: i18next.language,
          tabWidth: ReactDOM.findDOMNode(
            this.refs.uniqueTokensTab,
          ).getBoundingClientRect().width,
          tabPosition: ReactDOM.findDOMNode(this.refs.uniqueTokensTab)
            .offsetLeft,
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
              <StyledTabText>{lang.t('account.tab_balances')}</StyledTabText>
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
              <StyledTabText>
                {lang.t('account.tab_transactions')}
              </StyledTabText>
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
              <StyledTabText>
                {lang.t('account.tab_uniquetokens')}
              </StyledTabText>
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
