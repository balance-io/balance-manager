import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import FusionCharts from 'fusioncharts';
import PowerCharts from 'fusioncharts/fusioncharts.powercharts';
import ReactFC from 'react-fusioncharts';
import moment from 'moment';
import Loader from './Loader';

import {
  graphGetCurrencyGraph,
  graphAddOpenGraph,
  graphRemoveOpenGraph,
} from '../reducers/_graph';

const StyledGraph = styled.div`
  background-color: #fff;
  grid-row-start: 2;
  grid-column-end: span 5;
`;

const StyledButton = styled.button`
  font-size: 1rem;
`;

const StyledGraphContainer = styled.div`
  text-align: center;
  padding: 10px;
`;

class Graph extends Component {
  state = {
    open: false,
  };

  constructor(props) {
    super(props);
    this.toggleGraph = this.toggleGraph.bind(this);
    this.getGraphData = this.getGraphData.bind(this);
  }

  toggleGraph() {
    const newOpenState = !this.state.open;
    this.setState({
      open: newOpenState,
    });
    if (newOpenState) {
      this.props.graphAddOpenGraph(this.props.symbol);
      this.getGraphData();
    } else {
      this.props.graphRemoveOpenGraph(this.props.symbol);
    }
  }

  getGraphData() {
    this.props.graphGetCurrencyGraph(
      this.props.symbol,
      this.props.nativeCurrency,
    );
  }

  render() {
    const { open } = this.state;
    const { graph, nativeCurrency, symbol } = this.props;

    function renderGraphContainer() {
      function renderContainerContent() {
        if (graph.fetching) {
          return <Loader size={20} color="black" background="white" />;
        }
        if (graph.error) {
          return <span>{graph.error.message}</span>;
        }
        PowerCharts(FusionCharts);

        const myDataSource = {
          chart: {
            caption: symbol,
            subCaption: `worth in ${
              nativeCurrency === 'GBP' || nativeCurrency === 'EUR'
                ? 'USD'
                : nativeCurrency
            }`,
            showValues: '0',
          },
          data: graph.points.map(point => {
            return {
              value: point[2],
              label: moment(point[0])
                .format('M/D/YYYY')
                .toString(),
            };
          }),
        };

        const chartConfigs = {
          type: 'spline',
          width: '100%',
          height: '400px',
          dataFormat: 'json',
          dataSource: myDataSource,
        };

        return <ReactFC {...chartConfigs} />;
      }

      return (
        <StyledGraphContainer>{renderContainerContent()}</StyledGraphContainer>
      );
    }

    return (
      <StyledGraph>
        <StyledButton onClick={this.toggleGraph}>
          {open ? 'Hide' : 'Show'} graph
        </StyledButton>
        {open ? renderGraphContainer() : ''}
      </StyledGraph>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    graph: state.graph.graphs[props.symbol],
    nativeCurrency: state.account.nativeCurrency,
  };
};

export default connect(
  mapStateToProps,
  {
    graphGetCurrencyGraph,
    graphAddOpenGraph,
    graphRemoveOpenGraph,
  },
)(Graph);
