import styled from 'styled-components';

import Button from '../../components/Button';

export const StyledGasButton = styled(Button)`
  width: 100%;
  height: 54px;
  & p {
    margin-top: 2px;
  }
  & p:first-child {
    font-weight: 500;
  }
  & p:last-child {
    font-weight: 400;
    font-size: 12px;
  }
  &:hover,
  &:active,
  &:focus,
  &:disabled {
    outline: none !important;
    box-shadow: none !important;
  }
`;
