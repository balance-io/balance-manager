import { apiGetEthereumGraph } from '../handlers/api';

const ACCOUNT_GET_ETHEREUM_GRAPH_REQUEST =
  'account/ACCOUNT_GET_ETHEREUM_GRAPH_REQUEST';
const ACCOUNT_GET_ETHEREUM_GRAPH_SUCCESS =
  'account/ACCOUNT_GET_ETHEREUM_GRAPH_SUCCESS';
const ACCOUNT_GET_ETHEREUM_GRAPH_FAILURE =
  'account/ACCOUNT_GET_ETHEREUM_GRAPH_FAILURE';

// -- Actions --------------------------------------------------------------- //

export const getEthereumGraph = () => (dispatch, getState) => {
  dispatch({ type: ACCOUNT_GET_ETHEREUM_GRAPH_REQUEST });
  apiGetEthereumGraph()
    .then(({ data }) => {
      const graph = data;
      dispatch({
        type: ACCOUNT_GET_ETHEREUM_GRAPH_SUCCESS,
        payload: graph,
      });
    })
    .catch(error => {
      dispatch({ type: ACCOUNT_GET_ETHEREUM_GRAPH_FAILURE });
    });
};

const INITIAL_STATE = {};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ACCOUNT_GET_ETHEREUM_GRAPH_REQUEST:
    case ACCOUNT_GET_ETHEREUM_GRAPH_SUCCESS:
    case ACCOUNT_GET_ETHEREUM_GRAPH_FAILURE:
    default:
      return state;
  }
};
