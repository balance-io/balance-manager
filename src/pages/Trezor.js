import React from 'react';
import styled from 'styled-components';
import BaseLayout from '../layouts/base';
import Card from '../components/Card';
import Column from '../components/Column';
import SubscribeForm from '../components/SubscribeForm';
import trezorLogo from '../assets/trezor-logo.png';
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

const StyledColumn = styled(Column)`
  padding: 15px;
  & > * {
    margin: 10px;
  }
  & > div:last-child {
    margin-top: 32px;
  }
`;

const StyledImageWrapper = styled.div`
  width: 100%;
  & img {
    width: 100%;
  }
`;

const StyledTrezorWallet = styled(StyledImageWrapper)`
  width: 275px;
  height: 82.5px;
`;

const Trezor = ({ ...props }) => (
  <BaseLayout>
    <Card {...props}>
      <StyledCardContainer>
        <StyledColumn>
          <StyledTrezorWallet>
            <img src={trezorLogo} alt="Ledger Wallet" />
          </StyledTrezorWallet>
          <SubscribeForm />
        </StyledColumn>
      </StyledCardContainer>
    </Card>
  </BaseLayout>
);
export default Trezor;
