import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import lang from '../languages';
import Link from './Link';
import Card from './Card';
import Button from './Button';
import Dropdown from './Dropdown';
import CopyToClipboard from './CopyToClipboard';
import AccountViewBalances from './AccountViewBalances';
import AccountViewTransactions from './AccountViewTransactions';
import LineBreak from '../components/LineBreak';
import arrowUp from '../assets/arrow-up.svg';
import qrCode from '../assets/qr-code-transparent.svg';
import nativeCurrencies from '../libraries/native-currencies';
import { accountChangeNativeCurrency } from '../reducers/_account';
import { modalOpen } from '../reducers/_modal';
import { colors, fonts, responsive, shadows } from '../styles';

const StyledAccountView = styled.div`
  width: 100%;
`;

const StyledFlex = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const StyledTop = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 15px 20px 12px;
  & h6 {
    color: rgba(${colors.darkGrey}, 0.7);
    font-size: ${fonts.size.small};
    font-weight: ${fonts.weight.semibold};
    margin-bottom: 4px;
  }
  @media screen and (${responsive.sm.max}) {
    padding: 16px;
    & h6 {
      margin-top: 15px;
    }
  }
  @media screen and (${responsive.sm.max}) {
    flex-direction: column-reverse;
  }
`;

const StyledAddressWrapper = styled.div`
  width: 100%;
`;

const StyledActions = styled.div`
  display: flex;
  justify-content: flex-end;
  @media screen and (${responsive.sm.max}) {
    justify-content: space-between;
    & button {
      margin: 2px;
    }
  }
`;

const StyledTabMenu = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px 0;
`;

const StyledTabsWrapper = styled.div`
  grid-template-columns: auto;
  box-shadow: none;
  display: flex;
  & :nth-child(n + 2) {
    margin-left: 10px;
  }
`;

const StyledTab = styled(Button)`
  height: 100%;
  border-radius: 0;
  border: none;
  background-color: ${({ active }) => (active ? `rgB(${colors.white})` : 'transparent')};
  color: ${({ active }) => (active ? `rgB(${colors.fadedBlue})` : `rgB(${colors.darkGrey})`)};
  -webkit-box-shadow: ${shadows.medium};
  box-shadow: ${shadows.medium};
  border-radius: 6px 6px 0 0;
  margin: 0;
  display: flex;
  opacity: 1 !important;
  outline: none !important;
  box-shadow: none !important;

  &:hover,
  &:active,
  &:focus {
    opacity: 1 !important;
    outline: none !important;
    box-shadow: none !important;
  }
`;

const StyledDropdownWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

class AccountView extends Component {
  state = {
    activeTab: 'BALANCES_TAB',
    openSettings: false,
    showTokensWithNoValue: false,
    limitTransactions: 10
  };
  componentWillReceiveProps(newProps) {
    const tabRoute = window.browserHistory.location.pathname.replace(newProps.match.url, '') || '/';
    switch (tabRoute) {
      case '/':
        this.setState({ activeTab: 'BALANCES_TAB' });
        break;
      case '/transactions':
        this.setState({ activeTab: 'TRANSACTIONS_TAB' });
        break;
      default:
        break;
    }
  }
  toggleSettings = () => {
    this.setState({ openSettings: !this.state.openSettings });
  };
  onShowTokensWithNoValue = () => {
    this.setState({ showTokensWithNoValue: !this.state.showTokensWithNoValue });
  };
  onShowMoreTransactions = () => {
    if (this.state.limitTransactions > this.props.transactions.length) return null;
    this.setState({ limitTransactions: this.state.limitTransactions + 10 });
  };
  openSendModal = () =>
    this.props.modalOpen('SEND_MODAL', {
      name:
        this.props.account.name || `${this.props.account.type}${lang.t('modal.default_wallet')}`,
      address: this.props.account.address,
      type: this.props.account.type,
      crypto: this.props.account.crypto,
      prices: this.props.prices
    });
  openReceiveModal = () =>
    this.props.modalOpen('RECEIVE_MODAL', {
      name:
        this.props.account.name || `${this.props.account.type}${lang.t('modal.default_wallet')}`,
      address: this.props.account.address
    });
  shouldComponentUpdate(nextProps) {
    if (
      nextProps.nativeCurrency !== this.props.nativeCurrency &&
      nextProps.prices === this.props.prices
    )
      return false;
    return true;
  }
  render() {
    return (
      <StyledAccountView>
        <Card fetching={this.props.fetching} background={'lightGrey'}>
          <StyledFlex>
            <StyledTop>
              <StyledAddressWrapper>
                <h6>{lang.t('account.your_wallet_address')} </h6>
                <CopyToClipboard iconOnHover text={this.props.account.address} />
              </StyledAddressWrapper>

              <StyledActions>
                <Button left color="blue" icon={qrCode} onClick={this.openReceiveModal}>
                  {lang.t('button.receive')}
                </Button>
                <Button left color="blue" icon={arrowUp} onClick={this.openSendModal}>
                  {lang.t('button.send')}
                </Button>
              </StyledActions>
            </StyledTop>
            <LineBreak noMargin />
            <StyledTabMenu>
              <StyledTabsWrapper>
                <Link to={this.props.match.url}>
                  <StyledTab active={this.state.activeTab === 'BALANCES_TAB'}>
                    {lang.t('account.tab_balances')}
                  </StyledTab>
                </Link>
                <Link to={`${this.props.match.url}/transactions`}>
                  <StyledTab active={this.state.activeTab === 'TRANSACTIONS_TAB'}>
                    {lang.t('account.tab_transactions')}
                  </StyledTab>
                </Link>
              </StyledTabsWrapper>
              <StyledDropdownWrapper>
                <Dropdown
                  selected={this.props.nativeCurrency}
                  options={nativeCurrencies}
                  onChange={this.props.accountChangeNativeCurrency}
                />
              </StyledDropdownWrapper>
            </StyledTabMenu>
            <Switch>
              <Route
                exact
                path={this.props.match.url}
                render={routerProps => (
                  <AccountViewBalances
                    onShowTokensWithNoValue={this.onShowTokensWithNoValue}
                    showTokensWithNoValue={this.state.showTokensWithNoValue}
                    account={this.props.account}
                  />
                )}
              />
              <Route
                exact
                path={`${this.props.match.url}/transactions`}
                render={routerProps => (
                  <AccountViewTransactions
                    onShowMoreTransactions={this.onShowMoreTransactions}
                    fetchingTransactions={this.props.fetchingTransactions}
                    limitTransactions={this.state.limitTransactions}
                    accountAddress={this.props.account.address}
                    transactions={this.props.transactions}
                  />
                )}
              />
              <Route render={() => <Redirect to={this.props.match.url} />} />
            </Switch>
          </StyledFlex>
        </Card>
      </StyledAccountView>
    );
  }
}

AccountView.propTypes = {
  accountChangeNativeCurrency: PropTypes.func.isRequired,
  modalOpen: PropTypes.func.isRequired,
  fetching: PropTypes.bool.isRequired,
  account: PropTypes.object.isRequired,
  prices: PropTypes.object.isRequired,
  nativeCurrency: PropTypes.string.isRequired,
  transactions: PropTypes.array.isRequired,
  fetchingTransactions: PropTypes.bool.isRequired,
  match: PropTypes.object.isRequired
};

const reduxProps = ({ account }) => ({
  fetching: account.fetching,
  account: account.account,
  prices: account.prices,
  nativeCurrency: account.nativeCurrency,
  transactions: account.transactions,
  fetchingTransactions: account.fetchingTransactions
});

export default connect(reduxProps, {
  accountChangeNativeCurrency,
  modalOpen
})(AccountView);
