import React from 'react';
import PropTypes from 'prop-types';
import MetamaskLogo from './MetamaskLogo';
import LedgerLogo from './LedgerLogo';
import TrezorLogo from './TrezorLogo';

const AccountType = ({ accountType, ...props }) => {
  switch (accountType) {
    case 'METAMASK':
      return <MetamaskLogo {...props} />;
    case 'LEDGER':
      return <LedgerLogo {...props} />;
    case 'TREZOR':
      return <TrezorLogo {...props} />;
    default:
      return <div {...props} />;
  }
};

AccountType.propTypes = {
  accountType: PropTypes.string.isRequired,
};

export default AccountType;
