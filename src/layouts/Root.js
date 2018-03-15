import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled, { injectGlobal } from 'styled-components';
import logo from '../assets/logo-light.png';
import Modal from '../components/Modal';
import Account from '../components/Account';
import IconPreload from '../components/IconPreload';
import Wrapper from '../components/Wrapper';
import Notification from '../components/Notification';
import {
  accountsGetEthplorerInfo,
  accountsUpdateDefaultAccount,
  accountsConnectMetamask,
  accountsClearUpdateAccountInterval,
  accountsGetPrices,
  accountsChangeNativeCurrency
} from '../reducers/_accounts';
import { modalOpen } from '../reducers/_modal';
import { fonts, transitions, globalStyles } from '../styles';

// eslint-disable-next-line
injectGlobal`${globalStyles}`;

const StyledColumn = styled.div`
  transition: ${transitions.long};
  width: 100%;
  height: 100%;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-grow: 1;
  justify-content: ${({ center }) => (center ? 'center' : 'flex-start')};
  align-items: center;
  flex-direction: column;
`;

const StyledWrapper = styled(Wrapper)`
  height: 100%;
  min-height: 100vh;
  width: 100vw;
  text-align: center;
`;

const StyledHeaderWrapper = styled.div`
  width: 100%;
  margin: ${({ center }) => (center ? '15px 0' : '30px 0 15px')};
  display: block;
`;

const StyledHeader = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledBranding = styled.div`
  display: flex;
  align-items: center;
`;

const StyledHero = styled.h1`
  margin-left: 10px;
  font-family: ${fonts.family.FFMarkPro} !important;
  font-size: ${fonts.size.h4};
  font-weight: normal;
  & strong {
    font-weight: bold;
  }
`;

const StyledLogo = styled.img`
  width: 20px;
`;

const StyledContentWrapper = styled.div`
  width: 100%;
`;

class Root extends Component {
  componentDidMount() {
    this.props.accountsGetPrices();
  }
  onConnectMetamask = () => this.props.accountsConnectMetamask();
  componentWillUnmount() {
    this.props.accountsClearUpdateAccountInterval();
  }
  render = () => (
    <StyledWrapper>
      <IconPreload />
      <StyledColumn>
        <StyledHeaderWrapper>
          <StyledHeader>
            <StyledBranding onClick={this.props.accountsConnectMetamask}>
              <StyledLogo src={logo} alt="Balance" />
              <StyledHero>
                <strong>Balance</strong> Manager
              </StyledHero>
            </StyledBranding>
            <div />
            {/* <StyledToolbar>
              <Dropdown />
            </StyledToolbar> */}
          </StyledHeader>
        </StyledHeaderWrapper>
        <StyledContentWrapper>
          {this.props.web3Available ? (
            this.props.web3Mainnet ? (
              this.props.defaultAccount ? (
                <Account
                  account={this.props.account}
                  fetching={this.props.fetching}
                  prices={this.props.prices}
                  nativeCurrency={this.props.nativeCurrency}
                  modalOpen={this.props.modalOpen}
                />
              ) : (
                <p>Please unlock your Metamask</p>
              )
            ) : (
              <p>Please switch to Main Network</p>
            )
          ) : (
            <p>
              Please install{' '}
              <a href="https://metamask.io/" target="_blank" rel="noopener noreferrer">
                Metamask
              </a>{' '}
              extension first
            </p>
          )}
        </StyledContentWrapper>
      </StyledColumn>
      <Modal />
      <Notification />
    </StyledWrapper>
  );
}

Root.propTypes = {
  accountsGetEthplorerInfo: PropTypes.func.isRequired,
  accountsUpdateDefaultAccount: PropTypes.func.isRequired,
  accountsConnectMetamask: PropTypes.func.isRequired,
  accountsClearUpdateAccountInterval: PropTypes.func.isRequired,
  accountsGetPrices: PropTypes.func.isRequired,
  accountsChangeNativeCurrency: PropTypes.func.isRequired,
  modalOpen: PropTypes.func.isRequired,
  prices: PropTypes.object.isRequired,
  nativeCurrency: PropTypes.string.isRequired,
  web3Available: PropTypes.bool.isRequired,
  web3Mainnet: PropTypes.bool.isRequired,
  defaultAccount: PropTypes.string.isRequired,
  account: PropTypes.object.isRequired,
  fetching: PropTypes.bool.isRequired,
  error: PropTypes.bool.isRequired
};

const reduxProps = ({ accounts }) => ({
  prices: accounts.prices,
  nativeCurrency: accounts.nativeCurrency,
  web3Available: accounts.web3Available,
  web3Mainnet: accounts.web3Mainnet,
  defaultAccount: accounts.defaultAccount,
  account: accounts.account,
  fetching: accounts.fetching,
  error: accounts.error
});

export default connect(reduxProps, {
  accountsGetEthplorerInfo,
  accountsUpdateDefaultAccount,
  accountsConnectMetamask,
  accountsClearUpdateAccountInterval,
  accountsGetPrices,
  accountsChangeNativeCurrency,
  modalOpen
})(Root);
