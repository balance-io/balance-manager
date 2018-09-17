import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Spinner from './Spinner';
import { lang } from 'balance-common';
import circle from '../assets/circle.svg';
import txSentIcon from '../assets/arrow-sent.svg';
import txReceivedIcon from '../assets/arrow-received.svg';
import txFailedIcon from '../assets/arrow-failed.svg';
import { colors, fonts, responsive } from '../styles';

const StyledTransactionStatus = styled.span`
  background: ${({ color }) =>
    color ? `rgba(${colors[color]}, 0.1)` : 'transparent'};
  border-radius: 8px;
  color: rgba(${colors.dark}, 0.6);
  font-weight: ${fonts.weight.semibold};
  padding: 4px 8px;
  position: relative;

  img {
    color: rgba(${colors.dark}, 0.6);
    margin-left: 4px;
    height: 10px;
    width: 10px;
    vertical-align: middle;

    @media screen and (max-width: 486px) {
      margin-left: 2px;
    }

    @media screen and (${responsive.xxs.max}) {
      display: none;
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
  let iconAlt = null;

  if (tx.pending) {
    text = lang.t('account.tx_pending');
    color = 'darkGrey';
    icon = null;
    iconAlt = null;
  } else if (tx.error) {
    text = lang.t('account.tx_failed');
    color = 'red';
    icon = txFailedIcon;
    iconAlt = `${lang.t('account.tx_failed')} icon`;
  } else {
    if (tx.from.toLowerCase() === tx.to.toLowerCase()) {
      text = lang.t('account.tx_self');
      color = 'blue';
      icon = circle;
      iconAlt = `${lang.t('account.tx_self')} icon`;
    } else if (tx.from.toLowerCase() === accountAddress.toLowerCase()) {
      text = lang.t('account.tx_sent');
      color = 'gold';
      icon = txSentIcon;
      iconAlt = `${lang.t('account.tx_sent')} icon`;
    } else {
      text = lang.t('account.tx_received');
      color = 'green';
      icon = txReceivedIcon;
      iconAlt = `${lang.t('account.tx_received')} icon`;
    }
  }
  return (
    <StyledTransactionStatus color={color} {...props}>
      {tx.pending && <StyledSpinner size={9} />}
      {text}
      <img src={icon} alt={iconAlt} />
    </StyledTransactionStatus>
  );
};

TransactionStatus.propTypes = {
  tx: PropTypes.object.isRequired,
  accountAddress: PropTypes.string.isRequired,
};

export default TransactionStatus;
