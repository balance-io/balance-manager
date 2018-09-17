import React from 'react';
import styled from 'styled-components';
import { lang } from 'balance-common';
import BaseLayout from '../layouts/base';
import Link from '../components/Link';

const StyledWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  text-transform: uppercase;
  text-align: center;
  height: 360px;
`;

const NotFound = () => (
  <BaseLayout>
    <StyledWrapper>
      <Link to="/">
        <h3>{lang.t('message.page_not_found')}</h3>
      </Link>
    </StyledWrapper>
  </BaseLayout>
);
export default NotFound;
