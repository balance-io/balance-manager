import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import lang from '../languages';
import Link from './Link';
import Button from './Button';
import balancesTabIcon from '../assets/balances-tab.svg';
import transactionsTabIcon from '../assets/transactions-tab.svg';
import interactionsTabIcon from '../assets/interactions-tab.svg';
import tabBackground from '../assets/tab-background.png';
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
  width: 181px;
  height: 46px;
  position: absolute;
  top: -1px;
  left: 0;
  transform: ${({ position }) => `translate3d(${position}px, 0, 0)`};
  background: url(${tabBackground}) no-repeat;
  background-size: 100%;
  transition: ease 0.2s;
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

    const tabCharSizes = ['account.tab_balances', 'account.tab_transactions', 'account.tab_interactions']
      .map(resourceName => lang.t(resourceName).length);
  
    this.tabOffset = tabCharSizes[0] * 5;

    this.state = {
      activeTab: 'BALANCES_TAB',
      tabPosition: -87 + this.tabOffset,
    };
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
        newState = { activeTab: 'BALANCES_TAB', tabPosition: -87 + this.tabOffset };
        break;
      case '/transactions':
        newState = { activeTab: 'TRANSACTIONS_TAB', tabPosition: this.tabOffset + 51 };
        break;
      case '/interactions':
        newState = { activeTab: 'INTERACTIONS_TAB', tabPosition: 229 };
        break;
      default:
        break;
    }
    if (this.state.activeTab !== newState.activeTab) {
      this.setState(newState);
    }
  }

  render() {
    return (
      <StyledTabMenu>
        <StyledTabBackground position={this.state.tabPosition} />
        <StyledTabsWrapper>
          <Link to={this.props.match.url}>
            <StyledTab
              data-toggle="tooltip"
              title={lang.t('account.tab_balances_tooltip')}
              active={this.state.activeTab === 'BALANCES_TAB'}
              icon={balancesTabIcon}
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
              left
            >
              {lang.t('account.tab_transactions')}
            </StyledTab>
          </Link>
          <Link to={`${this.props.match.url}/interactions`}>
            <StyledTab
              data-toggle="tooltip"
              title={lang.t('account.tab_interactions_tooltip')}
              active={this.state.activeTab === 'INTERACTIONS_TAB'}
              icon={interactionsTabIcon}
              left
            >
              {lang.t('account.tab_interactions')}
            </StyledTab>
          </Link>
        </StyledTabsWrapper>
      </StyledTabMenu>
    );
  }
}

TabMenu.propTypes = {
  match: PropTypes.object.isRequired,
};

export default TabMenu;
