import React from 'react';
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
import { accountConnectMetamask } from '../reducers/_account';
import { responsive } from '../styles';

const StyledCardContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  @media screen and (${responsive.sm.max}) {
    flex-direction: column;
    justify-content: ;
  }
`;

const StyledMetamaskConnect = styled(Column)`
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

const Home = ({ accountConnectMetamask, ...props }) => (
  <BaseLayout>
    <Card {...props}>
      <StyledCardContainer>
        <StyledHardwareWallets>
          <LedgerLogo />
          <TrezorLogo />
          <SubscribeForm />
        </StyledHardwareWallets>

        <StyledMetamaskConnect>
          <MetamaskLogo />
          <Link to="/metamask">
            <Button left color="orange" icon={metamaskWhite} onClick={accountConnectMetamask}>
              {lang.t('button.connect_metamask')}
            </Button>
          </Link>
        </StyledMetamaskConnect>
      </StyledCardContainer>
    </Card>
  </BaseLayout>
);

Home.propTypes = {
  accountConnectMetamask: PropTypes.func.isRequired
};

export default connect(null, {
  accountConnectMetamask
})(Home);
