import React from 'react';
import LineBreak from '../../components/LineBreak';

const GasPriceLineBreak = ({ gasPriceOption }) => (
  <LineBreak
    color={
      gasPriceOption === 'slow'
        ? 'red'
        : gasPriceOption === 'average'
          ? 'gold'
          : 'lightGreen'
    }
    percentage={
      gasPriceOption === 'slow' ? 33 : gasPriceOption === 'average' ? 66 : 100
    }
    noMargin={true}
  />
);

export default GasPriceLineBreak;
