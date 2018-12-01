import {
  ledgerEthereumBrowserClientFactoryAsync as ledgerEthereumClientFactoryAsync,
  LedgerSubprovider,
  RPCSubprovider,
  Web3ProviderEngine,
} from '@0x/subproviders';

const balanceManagerZrxInstantAddress =
  process.env.REACT_APP_ZRX_INSTANT_ADDRESS;
const balanceManagerZrxInstantRelayer =
  process.env.REACT_APP_ZRX_INSTANT_RELAYER;

// -- Constants ------------------------------------------------------------- //
const ZRX_INSTANT_RENDER_MODAL_REQUEST =
  'zrxinstant/ZRX_INSTANT_RENDER_MODAL_REQUEST';
const ZRX_INSTANT_RENDER_MODAL_SUCCESS =
  'zrxinstant/ZRX_INSTANT_RENDER_MODAL_SUCCESS';

// -- Actions --------------------------------------------------------------- //
export const zrxInstantInit = () => (dispatch, getState) => {
  dispatch({ type: ZRX_INSTANT_RENDER_MODAL_REQUEST });
  const { accountType } = getState().account;
  const providerEngine = new Web3ProviderEngine();
  let provider = null;
  switch (accountType) {
    case 'LEDGER':
      const ledgerSubprovider = new LedgerSubprovider({
        networkId: 1,
        ledgerEthereumClientFactoryAsync,
      });
      providerEngine.addProvider(ledgerSubprovider);
      providerEngine.addProvider(
        new RPCSubprovider('https://mainnet.infura.io/'),
      );
      break;
    default:
      provider = window.ethereum || window.web3.currentProvider;
      break;
  }
  providerEngine.start();
  window.zeroExInstant.render({
    provider: provider || providerEngine,
    orderSource: balanceManagerZrxInstantRelayer,
    affiliateInfo: {
      feeRecipient: balanceManagerZrxInstantAddress,
      feePercentage: 0.01,
    },
  });
  dispatch({ type: ZRX_INSTANT_RENDER_MODAL_SUCCESS });
};

// -- Reducer --------------------------------------------------------------- //
const INITIAL_STATE = {
  fetching: false,
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ZRX_INSTANT_RENDER_MODAL_REQUEST:
      return {
        ...state,
        fetching: true,
      };
    case ZRX_INSTANT_RENDER_MODAL_SUCCESS:
      return {
        ...state,
        fetching: false,
      };
    default:
      return state;
  }
};
