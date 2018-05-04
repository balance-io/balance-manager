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
    imgSrc: erc20
  };
  updateIcon = props => {
    if (props.asset) {
      if (props.asset.toUpperCase() === 'ETH') {
        this.setState({ imgSrc: eth });
      } else {
        this.setState({
          imgSrc: `/tokens/images/${props.asset}.png`
        });
      }
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
    const { size, image } = this.props;
    const { imgSrc } = this.state;
    return <StyledIcon size={size} src={image || imgSrc || erc20} onError={this.onError} />;
  }
}

AssetIcon.propTypes = {
  asset: PropTypes.string.isRequired,
  image: PropTypes.string,
  size: PropTypes.number
};

AssetIcon.defaultProps = {
  iamge: '',
  size: 20
};

export default AssetIcon;
