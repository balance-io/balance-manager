import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Card from '../../components/Card';
import Input from '../../components/Input';
import LineBreak from '../../components/LineBreak';
import DropdownAsset from '../../components/DropdownAsset';
import Button from '../../components/Button';
import Form from '../../components/Form';

import arrowUp from '../../assets/arrow-up.svg';
import balanceManagerLogo from '../../assets/balance-manager-logo.svg';

import { modalClose } from '../../reducers/_modal';
import { capitalize, lang, withSendComponentWithData } from 'balance-common';
import { web3SendTransactionMultiWallet } from '../../handlers/web3';
import {
  RampInstantSDK,
  RampInstantEventTypes,
} from '@ramp-network/ramp-instant-sdk';

import {
  StyledIcon,
  StyledBottomModal,
  StyledAmountCurrency,
  StyledInputContainer,
  StyledConversionContainer,
  StyledSubTitle,
  StyledActions,
  StyledJustifyContent,
} from '../modalStyles';

class SendModal extends Component {
  static propTypes = {
    modalClose: PropTypes.func.isRequired,
  };

  onClose = () => {
    this.props.sendClearFields();
    this.props.modalClose();
  };

  onWidgetMessage = event => {
    console.log(event);

    if (event.type === RampInstantEventTypes.WIDGET_CLOSE) {
      this.onClose();
    }
  };

  onBuy = () => {
    let widget = new RampInstantSDK({
      hostAppName: 'Balance Manager',
      hostLogoUrl: `https://localhost:3000${balanceManagerLogo}`,
      swapAmount: this.props.assetAmount * 10 ** 18,
      swapAsset: this.props.selected.symbol,
      userAddress: this.props.address,
    }).on('*', this.onWidgetMessage);

    widget.domNodes.overlay.style.zIndex = 3;

    widget.show();
  };

  render = () => {
    const selectedSymbol = this.props.selected.symbol || 'ETH';
    return (
      <Card background="lightGrey">
        <Form onSubmit={this.props.onSubmit}>
          <StyledJustifyContent>
            <StyledSubTitle>
              <StyledIcon color="grey" icon={arrowUp} />
              {lang.t('modal.buy_title', {
                walletName: capitalize(
                  `${this.props.accountType}${lang.t('modal.default_wallet')}`,
                ),
              })}
            </StyledSubTitle>
          </StyledJustifyContent>
          <div>
            <DropdownAsset
              selected={selectedSymbol}
              assets={this.props.accountInfo.assets}
              onChange={value => this.props.sendUpdateSelected(value)}
            />
          </div>

          <StyledConversionContainer>
            <StyledInputContainer>
              <Input
                monospace
                label={lang.t('input.asset_amount')}
                placeholder="0.0"
                type="text"
                value={this.props.assetAmount}
                onChange={({ target }) =>
                  this.props.sendUpdateAssetAmount(target.value)
                }
              >
                <StyledAmountCurrency>{selectedSymbol}</StyledAmountCurrency>
              </Input>
            </StyledInputContainer>
          </StyledConversionContainer>

          <LineBreak noMargin />

          <StyledBottomModal>
            <StyledActions>
              <Button onClick={this.onClose}>{lang.t('button.cancel')}</Button>

              <Button
                left
                isModalButton
                color="blue"
                disabled={!Number(this.props.assetAmount)}
                type="submit"
                onClick={this.onBuy}
              >
                <span>{lang.t('button.buy')}</span>
              </Button>
            </StyledActions>
          </StyledBottomModal>
        </Form>
      </Card>
    );
  };
}

export default connect(
  () => ({}),
  { modalClose },
)(
  withSendComponentWithData(SendModal, {
    sendTransactionCallback: web3SendTransactionMultiWallet,
  }),
);
