export default function resetMiddleware(option) {
  return next => (reducer, initialState) => {
    let resetType = 'RESET';
    let resetData = 'state';

    if ((typeof option === 'string' && option.length > 0) || typeof option === 'symbol') {
      resetType = option;
    } else if (typeof option === 'object') {
      resetType =
        (typeof option.type === 'string' && option.type.length > 0) || typeof option === 'symbol'
          ? option.type
          : resetType;
      resetData =
        typeof option.data === 'string' && option.data.length > 0 ? option.data : resetData;
    }

    const enhanceReducer = (state, action) => {
      if (action.type === resetType) {
        state = action[resetData];
      }
      return reducer(state, action);
    };

    return next(enhanceReducer, initialState);
  };
}
