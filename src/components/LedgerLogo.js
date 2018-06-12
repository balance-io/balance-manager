import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import ledgerLogo from '../assets/ledger-logo.png';

const StyledLedgerLogo = styled.div`
  width: ${({ size }) => `${size}px`};
  height: ${({ size }) => `${size * 0.25}px`};
  & img {
    width: 100%;
  }
`;

const LedgerLogo = ({ size, ...props }) => (
  <StyledLedgerLogo size={size} {...props}>
    <img src={ledgerLogo} alt="ledger" />
  </StyledLedgerLogo>
);

LedgerLogo.propTypes = {
  size: PropTypes.number,
};

LedgerLogo.defaultProps = {
  size: 300,
};

export default LedgerLogo;
