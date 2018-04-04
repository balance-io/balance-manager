import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import eth from '../assets/eth.svg';
import erc20 from '../assets/erc20.svg';

const StyledIcon = styled.img`
  width: ${({ size }) => `${size}px`};
  height: ${({ size }) => `${size}px`};
`;

class AssetIcon extends Component {
  state = {
    imgSrc: null
  };
  updateIcon = props => {
    if (props.asset.toUpperCase() === 'ETH') {
      this.setState({ imgSrc: eth });
    } else {
      this.setState({
        imgSrc: `/tokens/images/${props.asset}.png`
      });
    }
  };
  componentWillMount() {
    this.updateIcon(this.props);
  }
  componentWillReceiveProps(newProps) {
    this.updateIcon(newProps);
  }
  onError = () => this.setState({ imgSrc: erc20 });
  render() {
    return (
      <StyledIcon size={this.props.size} src={this.state.imgSrc || erc20} onError={this.onError} />
    );
  }
}

AssetIcon.propTypes = {
  asset: PropTypes.string.isRequired,
  size: PropTypes.number
};

AssetIcon.defaultProps = {
  size: 20
};

export default AssetIcon;
