import { ZeroExInstant } from '@0x/instant';
import { lang } from 'balance-common';
import Button from '../../components/Button';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Card from '../../components/Card';
import { modalClose } from '../../reducers/_modal';
import { fonts, colors, responsive, transitions } from '../../styles';

export const StyledActions = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: ${({ single }) => (single ? `center` : `space-between`)};

  & button {
    margin: 0 5px;
  }

  @media screen and (${responsive.sm.max}) {
    > div {
      order: 1;
      width: 100%;
      margin-bottom: 8px;
      text-align: center;
    }

    button {
      &:first-child {
        order: 2;
      }

      &:last-child {
        order: 3;
      }
    }
  }

  @media screen and (${responsive.xxs.max}) {
    > div {
      margin-bottom: 16px;
    }
  }
`;

const StyledFlex = styled.div`
  width: ${({ spanWidth }) => (spanWidth ? '100%' : 'auto')};
  display: flex;
  flex-grow: 1;
  align-items: flex-start;
  position: relative;
  transform: none;
`;

const StyledBottomModal = styled(StyledFlex)`
  & p {
    font-size: ${fonts.size.h6};
  }
  & > * {
    width: 100%;
  }
`;

class ZrxInstantModal extends Component {
  onClose = () => {
    this.props.modalClose();
  };

  render = () => {
    return (
      <Card background="lightGrey">
        <ZeroExInstant orderSource="https://api.relayer.com/sra/v2/" />
        <StyledBottomModal>
          <StyledActions>
            <Button isModalButton onClick={this.onClose}>
              {lang.t('button.cancel')}
            </Button>
          </StyledActions>
        </StyledBottomModal>
      </Card>
    );
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
