import styled from 'styled-components';

import { colors } from '../../styles';

export const StyledGasOptions = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0;

  & button {
    background-color: transparent;
    box-shadow: none;
    color: rgb(${colors.darkGrey});
    min-height: 64px;
    margin: 0;
    border-radius: 0;

    &:hover,
    &:active,
    &:focus {
      box-shadow: none !important;
      outline: none !important;
      background-color: transparent !important;
      color: rgb(${colors.darkGrey}) !important;
    }
  }
`;
