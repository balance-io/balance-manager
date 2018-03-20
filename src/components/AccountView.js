import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import Card from './Card';
import Button from './Button';
import Dropdown from './Dropdown';
import CopyToClipboard from './CopyToClipboard';
import AccountViewBalances from './AccountViewBalances';
import AccountViewTransactions from './AccountViewTransactions';
import arrowUp from '../assets/arrow-up.svg';
import qrCode from '../assets/qr-code-transparent.svg';
import nativeCurrencies from '../libraries/native-currencies';
import { accountChangeNativeCurrency } from '../reducers/_account';
import { modalOpen } from '../reducers/_modal';
import { colors, fonts, responsive } from '../styles';

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
  padding: 15px 20px;
  & h6 {
    color: rgba(${colors.darkGrey}, 0.7);
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
  padding: 0 20px;
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
  background-color: transparent;
  color: rgb(${colors.darkGrey});
  border-width: 1px 1px 0 1px;
  border-color: rgba(${colors.grey}, 0.7);
  border-style: solid;
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
  componentWillMount() {
    const tabName = this.nestedRouter({ tabName: null });
    this.setState({ tabName });
  }
  nestedRouter = ({ tabName }) => {
    const origin = window.location.origin;
    const pathname = this.props.match.url;
    const viewPath = this.props.match.params.view;
    if (tabName) {
      let path = '/';
      switch (tabName) {
        case 'BALANCES_TAB':
          path = `${origin}${pathname}`;
          window.history.pushState({ urlPath: path }, '', path);
          break;
        case 'TRANSACTIONS_TAB':
          path = `${origin}${pathname}/transactions`;
          window.history.pushState({ urlPath: path }, '', path);
          break;
        default:
          break;
      }
    } else {
      switch (viewPath) {
        case '/':
          return 'BALANCES_TAB';
        case '/transactions':
          return 'TRANSACTIONS_TAB';
        default:
          break;
      }
    }
  };
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
  onChangeTabs = tabName => {
    this.nestedRouter({ tabName });
    this.setState({ activeTab: tabName });
  };
  openSendModal = () =>
    this.props.modalOpen('SEND_MODAL', {
      name: this.props.account.name || `${this.props.account.type} Wallet`,
      address: this.props.account.address,
      type: this.props.account.type,
      crypto: this.props.account.crypto,
      prices: this.props.prices
    });
  openReceiveModal = () =>
    this.props.modalOpen('RECEIVE_MODAL', {
      name: this.props.account.name || `${this.props.account.type} Wallet`,
      address: this.props.account.address
    });
  renderTabView = () => {
    switch (this.state.activeTab) {
      case 'BALANCES_TAB':
        return (
          <AccountViewBalances
            onShowTokensWithNoValue={this.onShowTokensWithNoValue}
            showTokensWithNoValue={this.state.showTokensWithNoValue}
            account={this.props.account}
          />
        );
      case 'TRANSACTIONS_TAB':
        return (
          <AccountViewTransactions
            onShowMoreTransactions={this.onShowMoreTransactions}
            fetchingTransactions={this.props.fetchingTransactions}
            limitTransactions={this.state.limitTransactions}
            accountAddress={this.props.account.address}
            transactions={this.props.transactions}
          />
        );
      default:
        return <div />;
    }
  };
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
        <Card fetching={this.props.fetching}>
          <StyledFlex>
            <StyledTop>
              <StyledAddressWrapper>
                <h6>{'Your wallet address'} </h6>
                <CopyToClipboard iconOnHover text={this.props.account.address} />
              </StyledAddressWrapper>

              <StyledActions>
                <Button left color="blue" icon={qrCode} onClick={this.openReceiveModal}>
                  Receive
                </Button>
                <Button left color="blue" icon={arrowUp} onClick={this.openSendModal}>
                  Send
                </Button>
              </StyledActions>
            </StyledTop>
            <StyledTabMenu>
              <StyledTabsWrapper>
                <StyledTab onClick={() => this.onChangeTabs('BALANCES_TAB')}>Balances</StyledTab>
                <StyledTab onClick={() => this.onChangeTabs('TRANSACTIONS_TAB')}>
                  Transactions
                </StyledTab>
              </StyledTabsWrapper>
              <StyledDropdownWrapper>
                <Dropdown
                  selected={this.props.nativeCurrency}
                  options={nativeCurrencies}
                  onChange={this.props.accountChangeNativeCurrency}
                />
              </StyledDropdownWrapper>
            </StyledTabMenu>
            {this.renderTabView()}
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
