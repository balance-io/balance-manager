import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled, { keyframes } from 'styled-components';
import { colors, fonts, responsive } from '../styles';

const slideDown = keyframes`
  0% { transform: translate3d(0, -100%, 0); }
  100% { transform: translate3d(0, 0, 0); }
`;

const StyledWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  opacity: ${({ show }) => (show ? 1 : 0)};
  visibility: ${({ show }) => (show ? 'visible' : 'hidden')};
  pointer-events: ${({ show }) => (show ? 'auto' : 'none')};
  margin-bottom: 5px;
  width: 100vw;
  & > div {
    border-radius: 0;
  }
  & > div:nth-child(n + 2) {
    margin-top: 0;
  }
  @media screen and (${responsive.sm.max}) {
    & > div {
      font-size: ${fonts.size.h6};
    }
  }
`;

const StyledWarning = styled.div`
  width: 100%;
  height: 32px;
  font-size: ${fonts.size.h6};
  margin: 0 auto;
  position: relative;
  background: ${({ color }) => `rgb(${colors[color]})`};
  color: rgb(${colors.white});
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: ${({ idx }) => (idx ? `${idx}` : '0')};
  animation: ${slideDown} 0.3s ease 1;
  @media screen and (${responsive.md.max}) {
    max-width: none;
    animation: none;
  }
`;

class Warning extends Component {
  render() {
    return (
      <StyledWrapper show={this.props.show}>
        {!!this.props.active.length
          ? this.props.active.map((warning, idx, arr) => (
              <StyledWarning
                idx={arr.length - idx}
                key={warning.key}
                color={warning.color}
                onClick={() => warning.action()}
              >
                {warning.message}
              </StyledWarning>
            ))
          : null}
      </StyledWrapper>
    );
  }
}

Warning.propTypes = {
  show: PropTypes.bool.isRequired,
  active: PropTypes.array.isRequired,
};

const reduxProps = ({ warning }) => ({
  show: warning.show,
  active: warning.active,
});

export default connect(
  reduxProps,
  null,
)(Warning);
