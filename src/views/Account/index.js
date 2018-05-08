import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import lang from '../../languages';
import TabMenu from '../../components/TabMenu';
import Card from '../../components/Card';
import Button from '../../components/Button';
import CopyToClipboard from '../../components/CopyToClipboard';
import AccountBalances from './AccountBalances';
import AccountTransactions from './AccountTransactions';
import AccountInteractions from './AccountInteractions';
import arrowUp from '../../assets/arrow-up.svg';
// import exchangeIcon from '../../assets/exchange-icon.svg';
import qrCode from '../../assets/qr-code-transparent.svg';
import { accountClearState } from '../../reducers/_account';
import { modalOpen } from '../../reducers/_modal';
import { capitalize } from '../../handlers/utilities';
import { colors, fonts, responsive } from '../../styles';

const StyledAccount = styled.div`
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

const StyledMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(${colors.grey});
  font-weight: ${fonts.weight.medium};
`;

class Account extends Component {
  openExchangeModal = () => this.props.modalOpen('EXCHANGE_MODAL');
  openSendModal = () => this.props.modalOpen('SEND_MODAL');
  openReceiveModal = () => this.props.modalOpen('RECEIVE_MODAL');
  render() {
    return (
      <StyledAccount>
        <Card
          fetching={this.props.fetching || this.props.fetchingWallet}
          fetchingMessage={this.props.fetchingMessage}
          background={'lightGrey'}
          minHeight={200}
        >
          {!!this.props.accountAddress ? (
            <StyledFlex>
              <StyledTop>
                <StyledAddressWrapper>
                  <h6>{capitalize(this.props.accountType)} </h6>
                  <CopyToClipboard iconOnHover text={this.props.accountAddress} />
                </StyledAddressWrapper>

                <StyledActions>
                  {/* <Button
                    left
                    color="brightGreen"
                    hoverColor="brightGreenHover"
                    activeColor="brightGreenHover"
                    icon={exchangeIcon}
                    onClick={this.openExchangeModal}
                  >
                    {lang.t('button.exchange')}
                  </Button> */}
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

              <TabMenu match={this.props.match} />

              <Switch>
                <Route exact path={this.props.match.url} component={AccountBalances} />
                <Route
                  exact
                  path={`${this.props.match.url}/transactions`}
                  component={AccountTransactions}
                />
                <Route
                  exact
                  path={`${this.props.match.url}/interactions`}
                  component={AccountInteractions}
                />
                <Route render={() => <Redirect to={this.props.match.url} />} />
              </Switch>
            </StyledFlex>
          ) : (
            <StyledMessage>{lang.t('message.failed_request')}</StyledMessage>
          )}
        </Card>
      </StyledAccount>
    );
  }
}

Account.propTypes = {
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

Account.defaultProps = {
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
})(Account);
