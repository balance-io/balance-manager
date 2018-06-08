import React, { Component } from 'react';
import { connect } from 'react-redux';
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

class Graph extends Component {
  componentDidMount() {
    this.props.graphGetCurrencyGraph(
      this.props.symbol,
      this.props.nativeCurrency,
    );
  }

  getGraphData() {
    this.props.graphGetCurrencyGraph(
      this.props.symbol,
      this.props.nativeCurrency,
    );
  }

  render() {
    const { graph, nativeCurrency, symbol } = this.props;

    if (!graph) return <div />;
    if (graph.fetching) {
      return <Loader size={20} color="black" background="white" />;
    }
    if (graph.error) {
      return <span>{graph.error.message}</span>;
    }

    PowerCharts(FusionCharts);

    const myDataSource = {
      chart: {
        caption: `${symbol} worth in ${
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
      width: '95%',
      height: '200px',
      dataFormat: 'json',
      dataSource: myDataSource,
    };

    return <ReactFC {...chartConfigs} />;
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
