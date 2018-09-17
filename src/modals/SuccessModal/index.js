import React from 'react';
import { lang } from 'balance-common';
import Button from '../../components/Button';
import arrowUp from '../../assets/arrow-up.svg';
import {
  StyledSuccessMessage,
  StyledIcon,
  StyledParagraph,
  StyledHash,
  StyledSubTitle,
  StyledActions,
} from '../modalStyles';

const SuccessModal = ({ txHash, network, onClose }) => (
  <StyledSuccessMessage>
    <StyledSubTitle>
      <StyledIcon color="grey" icon={arrowUp} />
      {`Success`}
    </StyledSubTitle>

    <div>
      <StyledParagraph>
        <strong>{`${lang.t('modal.tx_hash')}:`}</strong>
      </StyledParagraph>
      <StyledHash>{` ${txHash}`}</StyledHash>
    </div>

    <StyledParagraph>
      <a
        href={`https://${
          network !== 'mainnet' ? `${network}.` : ''
        }etherscan.io/tx/${txHash}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {lang.t('modal.tx_verify')}
      </a>
    </StyledParagraph>

    <StyledActions>
      <Button color="red" onClick={onClose}>
        {lang.t('button.close')}
      </Button>
    </StyledActions>
  </StyledSuccessMessage>
);

export default SuccessModal;
