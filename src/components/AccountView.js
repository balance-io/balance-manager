import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import Card from './Card';
import Button from './Button';
import AddressCopy from './AddressCopy';
import AccountViewBalances from './AccountViewBalances';
import AccountViewTransactions from './AccountViewTransactions';
import arrowUp from '../assets/arrow-up.svg';
import qrCode from '../assets/qr-code-transparent.svg';
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
  padding: 20px;
  padding-top: 15px;
  & h6 {
    color: rgba(${colors.darkGrey}, 0.7);
    font-weight: ${fonts.weight.semibold};
  }
  @media screen and (${responsive.sm.max}) {
    padding: 16px;
    & h6 {
      margin-top: 15px;
    }
  }
  @media screen and (max-width: 768px) {
    flex-direction: column-reverse;
  }
`;

const StyledAddressWrapper = styled.div`
  width: 100%;
`;

const StyledActions = styled.div`
  width: 100%;
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
    margin-left: 15px;
  }
`;

const StyledTab = styled(Button)`
  height: 100%;
  border-radius: 0;
  border: none;
  background-color: transparent;
  color: rgb(${colors.darkGrey});
  border-width: 1px 1px 0 1px;
  border-color: rgb(${colors.grey});
  border-style: solid;
  border-radius: 6px 6px 0 0;
  margin: 0;
  display: flex;
  box-shadow: none;
`;

class AccountView extends Component {
  state = {
    activeTab: 'BALANCES_TAB',
    openSettings: false,
    showTokensWithNoValue: false,
    limitTransactions: 10
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
  onChangeTabs = tabName => this.setState({ activeTab: tabName });
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
                <AddressCopy address={this.props.account.address} />
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
              <div />
              {/* <Dropdown
                selected={nativeCurrency}
                options={nativeCurrencies}
                onChange={accountChangeNativeCurrency}
              /> */}
            </StyledTabMenu>
            {this.renderTabView()}
          </StyledFlex>
        </Card>
      </StyledAccountView>
    );
  }
}

AccountView.propTypes = {
  modalOpen: PropTypes.func.isRequired,
  fetching: PropTypes.bool.isRequired,
  account: PropTypes.object.isRequired,
  prices: PropTypes.object.isRequired,
  nativeCurrency: PropTypes.string.isRequired,
  transactions: PropTypes.array.isRequired,
  fetchingTransactions: PropTypes.bool.isRequired
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
  modalOpen
})(AccountView);
