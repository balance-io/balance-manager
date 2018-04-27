import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledWrapper = styled.div`
  width: ${({ size }) => (size ? `${size}px` : '32px')};
  height: ${({ size }) => (size ? `${size}px` : '32px')};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  overflow:hidden;
  & img {
    width: 100%;
  }
`;

class Blockie extends Component {
  state = {
    imgUrl: ''
  };
  componentDidMount() {
    this.updateBlockie(this.props);
  }
  componentWillReceiveProps(newProps) {
    this.updateBlockie(newProps);
  }
  updateBlockie = props => {
    const imgUrl = window.blockies
      .create({
        seed: props.seed,
        color: props.color,
        bgcolor: props.bgcolor,
        size: props.size,
        scale: props.scale,
        spotcolor: props.spotcolor
      })
      .toDataURL();
    this.setState({ imgUrl });
  };
  render() {
    return (
      <StyledWrapper size={this.props.size} {...this.props}>
        <img src={this.state.imgUrl} alt="address" />
      </StyledWrapper>
    );
  }
}

Blockie.propTypes = {
  seed: PropTypes.string.isRequired,
  color: PropTypes.string,
  bgcolor: PropTypes.string,
  size: PropTypes.number,
  scale: PropTypes.number,
  spotcolor: PropTypes.string
};

Blockie.defaultProps = {
  color: null,
  bgcolor: null,
  size: null,
  scale: null,
  spotcolor: null
};

export default Blockie;
