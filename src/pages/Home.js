import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import lang from '../languages';
import Link from '../components/Link';
import BaseLayout from '../layouts/base';
import Card from '../components/Card';
import Column from '../components/Column';
import SubscribeForm from '../components/SubscribeForm';
import Button from '../components/Button';
import MetamaskLogo from '../components/MetamaskLogo';
import LedgerLogo from '../components/LedgerLogo';
import TrezorLogo from '../components/TrezorLogo';
import metamaskWhite from '../assets/metamask-white.png';
// import WalletConnectLogo from '../components/WalletConnectLogo';
// import walletConnectWhite from '../assets/walletconnect-white.svg';
import { getLocal } from '../helpers/utilities';
import { modalOpen } from '../reducers/_modal';
import { accountUpdateAccountAddress } from '../reducers/_account';
import { responsive } from '../styles';

const StyledCardContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  @media screen and (${responsive.md.max}) {
    flex-direction: column;
    justify-content: ;
  }
`;

const StyledConnect = styled(Column)`
  padding: 15px;
  & > * {
    margin: 24px;
  }
`;

const StyledHardwareWallets = styled(Column)`
  padding: 15px;
  & > * {
    margin: 10px;
  }
  & > div:last-child {
    margin-top: 32px;
  }
`;

class Home extends Component {
  onWalletConnectInit = () => {
    const storedAddress = getLocal('walletconnect');
    if (storedAddress) {
      this.props.accountUpdateAccountAddress(storedAddress, 'WALLETCONNECT');
      this.props.history.push('/wallet');
    } else {
      this.props.modalOpen('WALLET_CONNECT_INIT', null);
    }
  };
  render = () => (
    <BaseLayout>
      <Card>
        <StyledCardContainer>
          <StyledHardwareWallets>
            <TrezorLogo />
            <SubscribeForm />
          </StyledHardwareWallets>

          <StyledConnect>
            <LedgerLogo />
            <Link to="/ledger">
              <Button color="dark">{lang.t('button.connect_ledger')}</Button>
            </Link>
          </StyledConnect>

          {/* <StyledConnect>
            <WalletConnectLogo />
            <Button
              left
              color="walletconnect"
              icon={walletConnectWhite}
              onClick={this.onWalletConnectInit}
            >
              {lang.t('button.connect_walletconnect')}
            </Button>
          </StyledConnect> */}

          <StyledConnect>
            <MetamaskLogo />
            <Link to="/metamask">
              <Button left color="orange" icon={metamaskWhite}>
                {lang.t('button.connect_metamask')}
              </Button>
            </Link>
          </StyledConnect>
        </StyledCardContainer>
      </Card>
    </BaseLayout>
  );
}

Home.propTypes = {
  modalOpen: PropTypes.func.isRequired,
  accountUpdateAccountAddress: PropTypes.func.isRequired
};

export default connect(null, {
  modalOpen,
  accountUpdateAccountAddress
})(Home);
