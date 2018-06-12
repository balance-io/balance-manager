// -- Constants ------------------------------------------------------------- //

const MODAL_OPEN = 'modal/MODAL_OPEN';
const MODAL_CLOSE = 'modal/MODAL_CLOSE';

// -- Actions --------------------------------------------------------------- //

export const modalOpen = (modal, params) => ({
  type: MODAL_OPEN,
  payload: { modal: modal, params: params },
});

export const modalClose = () => ({ type: MODAL_CLOSE });

// -- Reducer --------------------------------------------------------------- //
const INITIAL_STATE = {
  modal: '',
  params: '',
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case MODAL_OPEN:
      return {
        ...state,
        modal: action.payload.modal,
        params: action.payload.params,
      };
    case MODAL_CLOSE:
      return { ...state, modal: '' };
    default:
      return state;
  }
};
