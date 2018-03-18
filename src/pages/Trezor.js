import React from 'react';
import styled from 'styled-components';
import BaseLayout from '../layouts/base';
import Card from '../components/Card';
import Column from '../components/Column';
import SubscribeForm from '../components/SubscribeForm';
import TrezorLogo from '../components/TrezorLogo';
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

const Trezor = ({ ...props }) => (
  <BaseLayout>
    <Card {...props}>
      <StyledCardContainer>
        <StyledColumn>
          <TrezorLogo />
          <SubscribeForm />
        </StyledColumn>
      </StyledCardContainer>
    </Card>
  </BaseLayout>
);
export default Trezor;
