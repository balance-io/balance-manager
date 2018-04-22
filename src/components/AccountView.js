import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import lang from '../languages';
import Link from './Link';
import Card from './Card';
import Button from './Button';
import CopyToClipboard from './CopyToClipboard';
import AccountViewBalances from './AccountViewBalances';
import AccountViewTransactions from './AccountViewTransactions';
import AccountViewInteractions from './AccountViewInteractions';
import balancesTabIcon from '../assets/balances-tab.svg';
import transactionsTabIcon from '../assets/transactions-tab.svg';
import interactionsTabIcon from '../assets/interactions-tab.svg';
import LineBreak from '../components/LineBreak';
import arrowUp from '../assets/arrow-up.svg';
import qrCode from '../assets/qr-code-transparent.svg';
import { accountClearState } from '../reducers/_account';
import { modalOpen } from '../reducers/_modal';
import { capitalize } from '../helpers/utilities';
import { colors, fonts, responsive, shadows, transitions } from '../styles';

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
    color: rgba(${colors.darkGrey}, 0.5);
    font-size: ${fonts.size.small};
    font-weight: ${fonts.weight.semibold};
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
  background-color: ${({ active }) => (active ? `rgb(${colors.white})` : 'transparent')};
  color: ${({ active }) => (active ? `rgb(${colors.fadedBlue})` : `rgb(${colors.darkGrey})`)};
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

  & > div {
    transition: ${transitions.base};
    -webkit-mask-size: auto !important;
    mask-size: auto !important;
    background-color: ${({ active }) =>
      active ? `rgb(${colors.fadedBlue})` : `rgb(${colors.darkGrey})`} !important;
  }

  @media (hover: hover) {
    &:hover {
      color: ${({ active }) =>
        active ? `rgb(${colors.fadedBlue}, 0.7)` : `rgb(${colors.darkGrey}, 0.7)`};
      & > div {
        background-color: ${({ active }) =>
          active ? `rgba(${colors.fadedBlue}, 0.7)` : `rgba(${colors.darkGrey}, 0.7)`} !important;
      }
    }
  }
`;

class AccountView extends Component {
  state = {
    activeTab: 'BALANCES_TAB'
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
      case '/interactions':
        this.setState({ activeTab: 'INTERACTIONS_TAB' });
        break;
      default:
        break;
    }
  }
  openSendModal = () =>
    this.props.modalOpen('SEND_MODAL', {
      name:
        this.props.accountInfo.name || `${this.props.accountType}${lang.t('modal.default_wallet')}`,
      address: this.props.accountInfo.address,
      accountType: this.props.accountType,
      assets: this.props.accountInfo.assets
    });
  openReceiveModal = () =>
    this.props.modalOpen('RECEIVE_MODAL', {
      name:
        this.props.accountInfo.name ||
        `${this.props.accountInfo.type}${lang.t('modal.default_wallet')}`,
      address: this.props.accountInfo.address
    });
  componentWillUnmount() {
    // this.props.accountClearState();
  }
  render() {
    return (
      <StyledAccountView>
        <Card
          fetching={this.props.fetching || this.props.fetchingMetamask}
          background={'lightGrey'}
        >
          <StyledFlex>
            <StyledTop>
              <StyledAddressWrapper>
                <h6>{capitalize(this.props.accountType)} </h6>
                <CopyToClipboard
                  iconOnHover
                  text={this.props.accountInfo.address || this.props.accountAddress}
                />
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
                  <StyledTab
                    active={this.state.activeTab === 'BALANCES_TAB'}
                    icon={balancesTabIcon}
                    left
                  >
                    {lang.t('account.tab_balances')}
                  </StyledTab>
                </Link>
                <Link to={`${this.props.match.url}/transactions`}>
                  <StyledTab
                    active={this.state.activeTab === 'TRANSACTIONS_TAB'}
                    icon={transactionsTabIcon}
                    left
                  >
                    {lang.t('account.tab_transactions')}
                  </StyledTab>
                </Link>
                <Link to={`${this.props.match.url}/interactions`}>
                  <StyledTab
                    active={this.state.activeTab === 'INTERACTIONS_TAB'}
                    icon={interactionsTabIcon}
                    left
                  >
                    {lang.t('account.tab_interactions')}
                  </StyledTab>
                </Link>
              </StyledTabsWrapper>
            </StyledTabMenu>
            <Switch>
              <Route exact path={this.props.match.url} component={AccountViewBalances} />
              <Route
                exact
                path={`${this.props.match.url}/transactions`}
                component={AccountViewTransactions}
              />
              <Route
                exact
                path={`${this.props.match.url}/interactions`}
                component={AccountViewInteractions}
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
  match: PropTypes.object.isRequired,
  modalOpen: PropTypes.func.isRequired,
  accountClearState: PropTypes.func.isRequired,
  fetching: PropTypes.bool.isRequired,
  accountInfo: PropTypes.object.isRequired,
  accountAddress: PropTypes.string.isRequired,
  accountType: PropTypes.string.isRequired,
  fetchingMetamask: PropTypes.bool
};

AccountView.defaultProps = {
  fetchingMetamask: false
};

const reduxProps = ({ account }) => ({
  fetching: account.fetching,
  accountInfo: account.accountInfo,
  accountAddress: account.accountAddress,
  accountType: account.accountType
});

export default connect(reduxProps, {
  modalOpen,
  accountClearState
})(AccountView);
