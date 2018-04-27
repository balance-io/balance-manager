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
import arrowUp from '../assets/arrow-up.svg';
import qrCode from '../assets/qr-code-transparent.svg';
import tabBackground from '../assets/tab-background.png';
import { accountClearState } from '../reducers/_account';
import { modalOpen } from '../reducers/_modal';
import { capitalize } from '../helpers/utilities';
import { colors, fonts, responsive, shadows, transitions } from '../styles';

const StyledAccountView = styled.div`
  width: 100%;
  margin-bottom: 60px;
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
  padding: 16px 16px 13px 20px;
  & h6 {
    margin-bottom: 2px;
    color: rgba(${colors.headerTitle});
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
      active ? `rgb(${colors.blue})` : `rgb(${colors.purpleTextTransparent})`} !important;
  }
`;

const StyledSwitchWrapper = styled.div`
  box-shadow: 0 5px 10px 0 rgba(59, 59, 92, 0.08), 0 0 1px 0 rgba(50, 50, 93, 0.02),
    0 3px 6px 0 rgba(0, 0, 0, 0.06);
`;

const StyledMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(${colors.grey});
  font-weight: ${fonts.weight.medium};
`;

class AccountView extends Component {
  state = {
    activeTab: 'BALANCES_TAB',
    tabPosition: 40
  };
  componentWillReceiveProps(newProps) {
    const tabRoute = window.browserHistory.location.pathname.replace(newProps.match.url, '') || '/';
    switch (tabRoute) {
      case '/':
        this.setState({ activeTab: 'BALANCES_TAB', tabPosition: -47 });
        break;
      case '/transactions':
        this.setState({ activeTab: 'TRANSACTIONS_TAB', tabPosition: 91 });
        break;
      case '/interactions':
        this.setState({ activeTab: 'INTERACTIONS_TAB', tabPosition: 229 });
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
  render() {
    return (
      <StyledAccountView>
        <Card
          fetching={this.props.fetching || this.props.fetchingWallet}
          fetchingMessage={this.props.fetchingMessage}
          background={'lightGrey'}
          minHeight={250}
        >
          {!!this.props.accountInfo.address || !!this.props.accountAddress ? (
            <StyledFlex>
              <StyledTop>
                <StyledAddressWrapper>
                  <h6>{capitalize(this.props.accountInfo.type || this.props.accountType)} </h6>
                  <CopyToClipboard
                    iconOnHover
                    text={this.props.accountInfo.address || this.props.accountAddress}
                  />
                </StyledAddressWrapper>

                <StyledActions>
                  <Button
                    left
                    color="blue"
                    hoverColor="blueHover"
                    activeColor="blueActive"
                    icon={qrCode}
                    onClick={this.openReceiveModal}
                  >
                    {lang.t('button.receive')}
                  </Button>
                  <Button
                    left
                    color="blue"
                    hoverColor="blueHover"
                    activeColor="blueActive"
                    icon={arrowUp}
                    onClick={this.openSendModal}
                  >
                    {lang.t('button.send')}
                  </Button>
                </StyledActions>
              </StyledTop>
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
              <StyledSwitchWrapper>
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
              </StyledSwitchWrapper>
            </StyledFlex>
          ) : (
            <StyledMessage>{lang.t('message.failed_request')}</StyledMessage>
          )}
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
  fetchingWallet: PropTypes.bool,
  fetchingMessage: PropTypes.string
};

AccountView.defaultProps = {
  fetchingWallet: false,
  fetchingMessage: ''
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
