import React from 'react';

import { lang } from 'balance-common';

import { StyledGasButton } from './styles';

const GasButton = ({ gasPrice, speed, onClick }) => (
  <StyledGasButton dark disabled={!gasPrice} onClick={() => onClick(speed)}>
    <p>{`${lang.t(`modal.gas_${speed}`)}: ${
      gasPrice && gasPrice.txFee.native
        ? gasPrice.txFee.native.value.display
        : '$0.00'
    }`}</p>
    <p>{`~ ${gasPrice ? gasPrice.estimatedTime.display : '0 secs'}`}</p>
  </StyledGasButton>
);

export default GasButton;
