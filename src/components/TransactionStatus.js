import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Spinner from './Spinner';
import lang from '../languages';
import circle from '../assets/circle.svg';
import txSentIcon from '../assets/arrow-sent.svg';
import txReceivedIcon from '../assets/arrow-received.svg';
import txFailedIcon from '../assets/arrow-failed.svg';
import { colors, fonts } from '../styles';

const StyledTransactionStatus = styled.p`
  font-weight: ${fonts.weight.semibold};
  color: rgba(${colors.dark}, 0.6);
  position: relative;
  & span {
    position: absolute;
    border-radius: 8px;
    color: transparent;
    background: ${({ color }) => (color ? `rgba(${colors[color]}, 0.1)` : 'transparent')};
    padding: 4px 8px;
    right: -20px;
    padding-right: 20px;

    &::after {
      content: ' ';
      content: ' ';
      position: absolute;
      height: 16px;
      width: 16px;
      right: 4px;
      top: calc((100% - 16px) / 2);
      mask: ${({ icon }) => `url(${icon}) center no-repeat`};
      background-color: rgba(${colors.dark}, 0.6);
    }
  }
`;

const StyledSpinner = styled(Spinner)`
  position: absolute;
  right: -13px;
`;

const TransactionStatus = ({ tx, accountAddress, ...props }) => {
  let text = null;
  let color = null;
  let icon = null;
  if (tx.pending) {
    text = lang.t('account.tx_pending');
    color = 'darkGrey';
    icon = null;
  } else if (tx.error) {
    text = lang.t('account.tx_failed');
    color = 'red';
    icon = txFailedIcon;
  } else {
    if (tx.from === tx.to) {
      text = lang.t('account.tx_self');
      color = 'blue';
      icon = circle;
    } else if (tx.from === accountAddress) {
      text = lang.t('account.tx_sent');
      color = 'gold';
      icon = txSentIcon;
    } else {
      text = lang.t('account.tx_received');
      color = 'green';
      icon = txReceivedIcon;
    }
  }
  return (
    <StyledTransactionStatus color={color} icon={!tx.pending ? icon : null} {...props}>
      {tx.pending && <StyledSpinner size={9} />}
      <span>{text}</span>
      {text}
    </StyledTransactionStatus>
  );
};

TransactionStatus.propTypes = {
  tx: PropTypes.object.isRequired,
  accountAddress: PropTypes.string.isRequired
};

export default TransactionStatus;
