import styled from 'styled-components';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { modalClose } from '../../reducers/_modal';

const StyledFlex = styled.div`
  width: ${({ spanWidth }) => (spanWidth ? '100%' : 'auto')};
  display: flex;
  flex-grow: 1;
  align-items: flex-start;
  position: relative;
  transform: none;
`;

const balanceManagerZrxInstantAddress =
  process.env.REACT_APP_ZRX_INSTANT_ADDRESS;

class ZrxInstantModal extends Component {
  componentDidMount = () => {
    window.zeroExInstant.render({
      orderSource: 'https://api.radarrelay.com/0x/v2/',
      affiliateInfo: {
        feeRecipient: balanceManagerZrxInstantAddress,
        feePercentage: 0.01,
      },
    });
  };

  onClose = () => {
    this.props.modalClose();
  };

  render = () => {
    return <StyledFlex id="zeroExInstantContainer" />;
  };
}

ZrxInstantModal.propTypes = {
  modalClose: PropTypes.func.isRequired,
};

const reduxProps = ({ modal }) => ({});

export default connect(
  reduxProps,
  {
    modalClose,
  },
)(ZrxInstantModal);
