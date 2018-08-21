import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { capitalize, lang } from 'balance-common';

import Card from '../../components/Card';
import Button from '../../components/Button';

import arrowUp from '../../assets/arrow-up.svg';

import { modalClose } from '../../reducers/_modal';

import {
  StyledContainer,
  StyledQRCodeDisplay,
  StyledIcon,
  StyledSubTitle,
  StyledJustifyContent,
  StyledCopyToClipboard,
} from '../modalStyles';

const reduxProps = ({ account }) => ({
  accountAddress: account.accountAddress,
  accountType: account.accountType,
});

const StyledCardContainer = styled.div`
  max-width: 440px;
  width: 100%;
`;

class ReceiveModal extends Component {
  static propTypes = {
    modalClose: PropTypes.func.isRequired,
    accountAddress: PropTypes.string.isRequired,
    accountType: PropTypes.string.isRequired,
  };

  onClose = () => {
    this.props.modalClose();
  };

  render = () => {
    return (
      <StyledCardContainer>
        <Card background="lightGrey">
          <StyledContainer>
            <StyledJustifyContent>
              <StyledSubTitle>
                <StyledIcon color="grey" icon={arrowUp} rotation={180} />
                {lang.t('modal.receive_title', {
                  walletName: capitalize(
                    `${this.props.accountType}${lang.t(
                      'modal.default_wallet',
                    )}`,
                  ),
                })}
              </StyledSubTitle>
              <Button onClick={this.onClose}>{lang.t('button.close')}</Button>
            </StyledJustifyContent>
            <StyledQRCodeDisplay data={this.props.accountAddress} />
            <StyledCopyToClipboard text={this.props.accountAddress} />
          </StyledContainer>
        </Card>
      </StyledCardContainer>
    );
  };
}

export default connect(
  reduxProps,
  {
    modalClose,
  },
)(ReceiveModal);
