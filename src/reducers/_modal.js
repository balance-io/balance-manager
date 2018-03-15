// -- Constants ------------------------------------------------------------- //

const MODAL_OPEN = 'modal/MODAL_OPEN';
const MODAL_CLOSE = 'modal/MODAL_CLOSE';

// -- Actions --------------------------------------------------------------- //

export const modalOpen = (modal, props) => ({
  type: MODAL_OPEN,
  payload: { modal, props }
});

export const modalClose = () => ({ type: MODAL_CLOSE });

// -- Reducer --------------------------------------------------------------- //
const INITIAL_STATE = {
  modal: '',
  modalProps: {}
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case MODAL_OPEN:
      return { ...state, modal: action.payload.modal, modalProps: action.payload.props };
    case MODAL_CLOSE:
      return { ...state, modal: '', modalProps: {} };
    default:
      return state;
  }
};
