import { apiGetTokenInfo } from '../handlers/api';

const TOKEN_GET_TOKEN_INFO_REQUEST = 'token/GET_TOKEN_INFO_REQUEST';
const TOKEN_GET_TOKEN_INFO_SUCCESS = 'token/GET_TOKEN_INFO_SUCCESS';
const TOKEN_GET_TOKEN_INFO_FAILURE = 'token/GET_TOKEN_INFO_FAILURE';

const INITIAL_STATE = [];

export const tokenGetTokenInfo = address => (dispatch, getState) => {
  // console.log('get token info: ', address);
  dispatch({
    type: TOKEN_GET_TOKEN_INFO_REQUEST,
    payload: {
      address: address,
    },
  });
  apiGetTokenInfo(address)
    .then(({ data }) => {
      dispatch({
        type: TOKEN_GET_TOKEN_INFO_SUCCESS,
        payload: {
          address: address,
          info: data,
        },
      });
    })
    .catch(error => {
      dispatch({
        type: TOKEN_GET_TOKEN_INFO_FAILURE,
        payload: {
          address: address,
          error: {
            message: `No info found for ${address}`,
          },
        },
      });
    });
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case TOKEN_GET_TOKEN_INFO_REQUEST:
      return {
        ...state,
        [action.payload.address]: {
          fetching: true,
        },
      };
    case TOKEN_GET_TOKEN_INFO_SUCCESS:
      return {
        ...state,
        [action.payload.address]: {
          ...state[action.payload.address],
          fetching: false,
          info: action.payload.info,
        },
      };
    case TOKEN_GET_TOKEN_INFO_FAILURE:
      return {
        ...state,
        [action.payload.address]: {
          ...state[action.payload.address],
          fetching: false,
          error: action.payload.error,
        },
      };
    default:
      return state;
  }
};
