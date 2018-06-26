import React from 'react';

import GasPriceLineBreak from '../../components/GasPriceLineBreak';
import GasButton from '../../components/GasButton';

import { StyledGasOptions } from './styles';

// Not fully looking the same as before
const GasPanel = ({ gasPriceOption, gasPrices, updateGasPrice }) => (
  <span>
    <GasPriceLineBreak gasPriceOption={gasPriceOption} />
    <StyledGasOptions>
      <GasButton
        gasPrice={gasPrices.slow}
        speed={`slow`}
        onClick={updateGasPrice}
      />
      <GasButton
        gasPrice={gasPrices.average}
        speed={`average`}
        onClick={updateGasPrice}
      />
      <GasButton
        gasPrice={gasPrices.fast}
        speed={`fast`}
        onClick={updateGasPrice}
      />
    </StyledGasOptions>
  </span>
);

export default GasPanel;
