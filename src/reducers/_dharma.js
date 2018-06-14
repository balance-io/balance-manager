// -- Constants ------------------------------------------------------------- //

const SET_PENDING_DEBT_ENTITY = 'dharma/SET_PENDING_DEBT_ENTITY';
const UPDATE_DEBT_ENTITY = 'dharma/UPDATE_DEBT_ENTITY';
const FILL_DEBT_ENTITY = 'dharma/FILL_DEBT_ENTITY';
const CANCEL_DEBT_ENTITY = 'dharma/CANCEL_DEBT_ENTITY';
const SET_FILLED_DEBT_ENTITIES = 'dharma/SET_FILLED_DEBT_ENTITIES';

// -- Actions --------------------------------------------------------------- //

export const setPendingDebtEntity = issuanceHash => {
  return {
    type: SET_PENDING_DEBT_ENTITY,
    payload: issuanceHash,
  };
};

export const updatePendingDebtEntity = debtEntity => {
  return {
    debtEntity,
    type: UPDATE_DEBT_ENTITY,
  };
};

// -- Reducer --------------------------------------------------------------- //
const INITIAL_STATE = {
  debtEntities: new Map([]),
  filledDebtEntityIssuanceHashes: [],
  pendingDebtEntityIssuanceHashes: [],
};

const handleSetPendingDebtEntity = (state, payload) => {
  const { pendingDebtEntityIssuanceHashes } = state;

  if (
    !pendingDebtEntityIssuanceHashes.find(
      issuanceHash => issuanceHash === payload,
    )
  ) {
    pendingDebtEntityIssuanceHashes.push(payload);
  }

  return {
    ...state,
    pendingDebtEntityIssuanceHashes: pendingDebtEntityIssuanceHashes,
  };
};

const handleRemovePendingDebtEntity = (state, payload) => {
  const { debtEntities, pendingDebtEntityIssuanceHashes } = state;

  debtEntities.delete(payload);

  return {
    ...state,
    pendingDebtEntityIssuanceHashes: pendingDebtEntityIssuanceHashes.filter(
      issuanceHash => issuanceHash !== payload,
    ),
  };
};

const handleSetFilledDebtEntities = (state, filledDebtEntities = []) => {
  const debtEntities = state.debtEntities;
  const filledDebtEntityIssuanceHashes = [];

  for (const debtEntity of filledDebtEntities) {
    const issuanceHash = debtEntity.issuanceHash;

    debtEntities.set(issuanceHash, debtEntity);

    if (
      !filledDebtEntityIssuanceHashes.find(
        existingIssuanceHash => existingIssuanceHash === issuanceHash,
      )
    ) {
      filledDebtEntityIssuanceHashes.push(issuanceHash);
    }
  }
};

const handleUpdateDebtEntity = (state, debtEntity) => {
  console.log(state);
  const debtEntities = state.debtEntities;
  debtEntities.set(debtEntity.issuanceHash, debtEntity);

  return {
    ...state,
    debtEntities: debtEntities,
  };
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_PENDING_DEBT_ENTITY:
      return handleSetPendingDebtEntity(state, action.payload);
    case FILL_DEBT_ENTITY:
    case CANCEL_DEBT_ENTITY:
      return handleRemovePendingDebtEntity(state, action.payload);
    case SET_FILLED_DEBT_ENTITIES:
      return handleSetFilledDebtEntities(state, action.payload);
    case UPDATE_DEBT_ENTITY:
      return handleUpdateDebtEntity(state, action.debtEntity);
    default:
      return state;
  }
};
