import React, { Component } from 'react';
import { connect } from 'react-redux';
import FusionCharts from 'fusioncharts';
import PowerCharts from 'fusioncharts/fusioncharts.powercharts';
import ReactFC from 'react-fusioncharts';

import { getEthereumGraph } from '../reducers/_graph';

class Graph extends Component {
  componentDidMount() {
    this.props.getEthereumGraph();
  }

  render() {
    const { graphs } = this.props;
    if (graphs.ethereum.length === 0) {
      return <p>Fetching graph</p>;
    }

    console.log(graphs.ethereum);
    PowerCharts(FusionCharts);

    const myDataSource = {
      chart: {
        caption: 'Ethereum',
        subCaption: 'Worth in USD',
        numberPrefix: '$',
      },
      data: graphs.ethereum.map(point => {
        return {
          value: point[2],
        };
      }),
    };

    const chartConfigs = {
      type: 'spline',
      width: 600,
      height: 400,
      dataFormat: 'json',
      dataSource: myDataSource,
    };

    return (
      <div>
        <ReactFC {...chartConfigs} />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    graphs: {
      ethereum: state.graph.ethereum,
    },
  };
};

export default connect(
  mapStateToProps,
  {
    getEthereumGraph,
  },
)(Graph);
