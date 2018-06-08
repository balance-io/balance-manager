import { apiGetEthereumGraph } from '../handlers/api';

const GRAPH_GET_GRAPH_REQUEST = 'graph/GRAPH_GET_GRAPH_REQUEST';
const GRAPH_GET_GRAPH_SUCCESS = 'graph/GRAPH_GET_GRAPH_SUCCESS';
const GRAPH_GET_GRAPH_FAILURE = 'graph/GRAPH_GET_GRAPH_FAILURE';

const GRAPH_ADD_OPEN_GRAPH = 'graph/GRAPH_ADD_OPEN_GRAPH';
const GRAPH_REMOVE_OPEN_GRAPH = 'graph/GRAPH_REMOVE_OPEN_GRAPH';

// -- Actions --------------------------------------------------------------- //
export const graphGetCurrencyGraphs = nativeCurrency => (
  dispatch,
  getState,
) => {
  const openGraphs = getState().graph.openGraphs;
  openGraphs.forEach(symbol => {
    dispatch({
      type: GRAPH_GET_GRAPH_REQUEST,
      payload: {
        symbol: symbol,
      },
    });
    apiGetEthereumGraph(symbol, nativeCurrency)
      .then(({ data }) => {
        dispatch({
          type: GRAPH_GET_GRAPH_SUCCESS,
          payload: {
            symbol: symbol,
            points: data,
          },
        });
      })
      .catch(error => {
        dispatch({
          type: GRAPH_GET_GRAPH_FAILURE,
          payload: {
            symbol: symbol,
            error: {
              message: `${symbol}${nativeCurrency} not listed on Binance`,
            },
          },
        });
      });
  });
};

export const graphGetCurrencyGraph = (symbol, nativeCurrency) => (
  dispatch,
  getState,
) => {
  dispatch({
    type: GRAPH_GET_GRAPH_REQUEST,
    payload: {
      symbol: symbol,
    },
  });
  apiGetEthereumGraph(symbol, nativeCurrency)
    .then(({ data }) => {
      dispatch({
        type: GRAPH_GET_GRAPH_SUCCESS,
        payload: {
          symbol: symbol,
          points: data,
        },
      });
    })
    .catch(error => {
      dispatch({
        type: GRAPH_GET_GRAPH_FAILURE,
        payload: {
          symbol: symbol,
          error: {
            message: `${symbol}${nativeCurrency} not listed on Binance`,
          },
        },
      });
    });
};

export const graphAddOpenGraph = symbol => (dispatch, getState) => {
  dispatch({
    type: GRAPH_ADD_OPEN_GRAPH,
    payload: {
      symbol,
    },
  });
};

export const graphRemoveOpenGraph = symbol => (dispatch, getState) => {
  dispatch({
    type: GRAPH_REMOVE_OPEN_GRAPH,
    payload: {
      symbol,
    },
  });
};

const INITIAL_STATE = {
  currentGraph: '',
  openGraphs: [],
  graphs: {
    ETH: {
      fetching: false,
      points: [],
    },
  },
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case GRAPH_GET_GRAPH_REQUEST:
      return {
        ...state,
        graphs: {
          ...state.graphs,
          [action.payload.symbol]: {
            ...state[action.payload.symbol],
            fetching: true,
          },
        },
      };
    case GRAPH_GET_GRAPH_SUCCESS:
      return {
        ...state,
        graphs: {
          ...state.graphs,
          [action.payload.symbol]: {
            ...state[action.payload.symbol],
            fetching: false,
            points: action.payload.points,
          },
        },
      };
    case GRAPH_GET_GRAPH_FAILURE:
      return {
        ...state,
        graphs: {
          ...state.graphs,
          [action.payload.symbol]: {
            ...state[action.payload.symbol],
            fetching: false,
            error: action.payload.error,
          },
        },
      };
    case GRAPH_ADD_OPEN_GRAPH:
      return {
        ...state,
        openGraphs: [...state.openGraphs, action.payload.symbol],
      };
    case GRAPH_REMOVE_OPEN_GRAPH:
      return {
        ...state,
        openGraphs: state.openGraphs.filter(
          symbol => symbol !== action.payload.symbol,
        ),
      };
    default:
      return state;
  }
};
