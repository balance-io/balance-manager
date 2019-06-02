import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Card from '../../components/Card';
import Input from '../../components/Input';
import LineBreak from '../../components/LineBreak';
import GasPanel from '../../components/GasPanel';
import DropdownAsset from '../../components/DropdownAsset';
import Button from '../../components/Button';
import Form from '../../components/Form';

import SuccessModal from '../SuccessModal';
import ApproveTransactionModal from '../ApproveTransactionModal';

import convertIcon from '../../assets/convert-icon.svg';
import arrowUp from '../../assets/arrow-up.svg';

import { modalClose } from '../../reducers/_modal';
import {
  capitalize,
  getEth,
  lang,
  calcTxFee,
  withSendComponentWithData,
} from 'balance-common';
import { web3SendTransactionMultiWallet } from '../../handlers/web3';

import {
  StyledIcon,
  StyledFlex,
  StyledBottomModal,
  StyledParagraph,
  StyledAmountCurrency,
  StyledInputContainer,
  StyledConversionContainer,
  StyledConversionIconContainer,
  StyledConversionIcon,
  StyledSubTitle,
  StyledActions,
  StyledMaxBalance,
  StyledJustifyContent,
} from '../modalStyles';

const balanceManagerEthAddress =
  process.env.REACT_APP_DONATION_ADDRESS ||
  '0x0000000000000000000000000000000000000000';

class DonateModal extends Component {
  static propTypes = {
    modalClose: PropTypes.func.isRequired,
  };

  onClose = () => {
    this.props.sendClearFields();
    this.props.modalClose();
  };

  componentDidMount = () => {
    this.props.sendUpdateRecipient(balanceManagerEthAddress);
  };

  render = () => (
    <Card background="lightGrey">
      {!this.props.txHash ? (
        !this.props.confirm ? (
          <Form onSubmit={this.props.onSubmit}>
            <StyledJustifyContent>
              <StyledSubTitle>
                <StyledIcon color="grey" icon={arrowUp} />
                {lang.t('modal.send_title', {
                  walletName: capitalize(
                    `${this.props.accountType}${lang.t(
                      'modal.default_wallet',
                    )}`,
                  ),
                })}
              </StyledSubTitle>
            </StyledJustifyContent>
            <div>
              <DropdownAsset
                selected={'ETH'}
                assets={[getEth(this.props.accountInfo.assets)]}
              />
            </div>

            <StyledFlex>
              <StyledInputContainer>
                <Input
                  monospace
                  label={lang.t('input.donation_address')}
                  spellCheck="false"
                  type="text"
                  value={balanceManagerEthAddress}
                  placeholder={balanceManagerEthAddress}
                  disabled
                />
              </StyledInputContainer>
            </StyledFlex>

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
                  <StyledAmountCurrency>{'ETH'}</StyledAmountCurrency>
                </Input>
                <StyledMaxBalance onClick={this.props.onSendMaxBalance}>
                  {lang.t('modal.send_max')}
                </StyledMaxBalance>
              </StyledInputContainer>

              <StyledConversionIconContainer>
                <StyledConversionIcon src={convertIcon} alt="≈" />
              </StyledConversionIconContainer>

              <StyledInputContainer>
                <Input
                  monospace
                  placeholder="0.0"
                  type="text"
                  value={this.props.nativeAmount}
                  disabled={
                    !this.props.prices[this.props.nativeCurrency] ||
                    !this.props.prices[this.props.nativeCurrency]['ETH']
                  }
                  onChange={({ target }) =>
                    this.props.sendUpdateNativeAmount(target.value)
                  }
                >
                  <StyledAmountCurrency disabled={!this.props.prices['ETH']}>
                    {this.props.prices &&
                      this.props.prices.selected &&
                      this.props.prices.selected.currency}
                  </StyledAmountCurrency>
                </Input>
              </StyledInputContainer>
            </StyledConversionContainer>

            <GasPanel
              gasPriceOption={this.props.gasPriceOption}
              gasPrices={this.props.gasPrices}
              updateGasPrice={this.props.updateGasPrice}
            />

            <LineBreak noMargin />

            <StyledBottomModal>
              <StyledActions>
                <Button onClick={this.onClose}>
                  {lang.t('button.cancel')}
                </Button>

                <StyledParagraph>
                  <span>{`${lang.t('modal.gas_fee')}: ${calcTxFee(
                    this.props.gasPrices,
                    this.props.gasPriceOption,
                    this.props.nativeCurrency,
                  )}`}</span>
                </StyledParagraph>

                <Button
                  left
                  isModalButton
                  color="blue"
                  icon={arrowUp}
                  disabled={!Number(this.props.assetAmount)}
                  type="submit"
                >
                  <span>{lang.t('button.send')}</span>
                </Button>
              </StyledActions>
            </StyledBottomModal>
          </Form>
        ) : (
          <ApproveTransactionModal
            accountType={this.props.accountType}
            onClose={this.onClose}
          />
        )
      ) : (
        <SuccessModal
          txHash={this.props.txHash}
          network={this.props.network}
          onClose={this.onClose}
        />
      )}
    </Card>
  );
}

export default connect(
  () => ({}),
  { modalClose },
)(
  withSendComponentWithData(DonateModal, {
    sendTransactionCallback: web3SendTransactionMultiWallet,
  }),
);
