import { apiGetEthereumGraph } from '../handlers/api';

const GRAPH_GET_ETHEREUM_GRAPH_REQUEST =
  'graph/GRAPH_GET_ETHEREUM_GRAPH_REQUEST';
const GRAPH_GET_ETHEREUM_GRAPH_SUCCESS =
  'graph/GRAPH_GET_ETHEREUM_GRAPH_SUCCESS';
const GRAPH_GET_ETHEREUM_GRAPH_FAILURE =
  'graph/GRAPH_GET_ETHEREUM_GRAPH_FAILURE';

// -- Actions --------------------------------------------------------------- //

export const getEthereumGraph = () => (dispatch, getState) => {
  dispatch({ type: GRAPH_GET_ETHEREUM_GRAPH_REQUEST });
  apiGetEthereumGraph()
    .then(({ data }) => {
      dispatch({
        type: GRAPH_GET_ETHEREUM_GRAPH_SUCCESS,
        payload: {
          symbol: 'ETH',
          data: data,
        },
      });
    })
    .catch(error => {
      dispatch({ type: GRAPH_GET_ETHEREUM_GRAPH_FAILURE });
    });
};

const INITIAL_STATE = {
  ethereum: [],
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case GRAPH_GET_ETHEREUM_GRAPH_REQUEST:
      return {
        ...state,
      };
    case GRAPH_GET_ETHEREUM_GRAPH_SUCCESS:
      return {
        ...state,
        ethereum: action.payload.data,
      };
    case GRAPH_GET_ETHEREUM_GRAPH_FAILURE:
      return {
        ...state,
      };
    default:
      return state;
  }
};
