import React from 'react';

import { capitalize, lang } from 'balance-common';

import MetamaskLogo from '../../components/MetamaskLogo';
import LedgerLogo from '../../components/LedgerLogo';
import TrezorLogo from '../../components/TrezorLogo';

import Button from '../../components/Button';

import { StyledApproveTransaction } from './styles';
import { StyledParagraph, StyledActions } from '../modalStyles';

const ApproveTransactionModal = ({ accountType, onClose }) => (
  <StyledApproveTransaction>
    {(() => {
      switch (accountType) {
        case 'METAMASK':
          return <MetamaskLogo />;
        case 'LEDGER':
          return <LedgerLogo />;
        case 'TREZOR':
          return <TrezorLogo />;
        default:
          return <div />;
      }
    })()}

    <StyledParagraph>
      {lang.t('modal.approve_tx', {
        walletType: capitalize(accountType),
      })}
    </StyledParagraph>

    <StyledActions single>
      <Button onClick={onClose}>{lang.t('button.close')}</Button>
    </StyledActions>
  </StyledApproveTransaction>
);

export default ApproveTransactionModal;
