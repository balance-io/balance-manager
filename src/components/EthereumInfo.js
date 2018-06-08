import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { graphAddOpenGraph, graphRemoveOpenGraph } from '../reducers/_graph';
import Graph from './Graph';
import { colors } from '../styles';

const StyledInfoContainer = styled.div`
  background-color: ${colors.white}
  grid-row-start: 2;
  grid-column-end: span 5;
  text-align: left;
`;

const StyledButton = styled.button`
  font-size: 1rem;
  display: block;
  width: 100%;
  background-color: rgb(${colors.lightGrey});
`;

class EthereumInfo extends Component {
  constructor(props) {
    super(props);
    this.toggleInfo = this.toggleInfo.bind(this);
    this.state = {
      open: false,
    };
  }

  toggleInfo() {
    const { open } = this.state;
    const { symbol, graphAddOpenGraph, graphRemoveOpenGraph } = this.props;
    if (!open) {
      graphAddOpenGraph(symbol);
    } else {
      graphRemoveOpenGraph(symbol);
    }

    this.setState({
      open: !open,
    });
  }

  render() {
    const { open } = this.state;
    const { symbol } = this.props;

    return (
      <StyledInfoContainer>
        <StyledButton onClick={this.toggleInfo}>
          {open ? 'Hide' : 'Show'} more info
        </StyledButton>
        {open ? <Graph symbol={symbol} /> : ''}
      </StyledInfoContainer>
    );
  }
}

export default connect(
  null,
  {
    graphAddOpenGraph,
    graphRemoveOpenGraph,
  },
)(EthereumInfo);
