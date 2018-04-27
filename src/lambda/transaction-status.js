import { infuraGetTransactionByHash, infuraGetBlockByHash } from '../helpers/infura';
import { lambdaAllowedAccess } from '../helpers/utilities';
import { convertHexToString } from '../helpers/bignumber';

const getBlockTimestamp = async (blockHash = '', network = 'mainnet') => {
  try {
    let blockData = await infuraGetBlockByHash(blockHash, network);
    if (blockData) {
      const blockTimestamp = convertHexToString(blockData.timestamp);
      let timestamp = {
        secs: blockTimestamp,
        ms: `${blockTimestamp}000`
      };
      return timestamp;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

const checkTransactionStatus = async (hash = '', network = 'mainnet') => {
  try {
    let result = await infuraGetTransactionByHash(hash, network);
    if (!result || !result.blockNumber || !result.blockHash) return null;
    if (result) {
      const timestamp = await getBlockTimestamp(result.blockHash, network);
      result.timestamp = timestamp;
    }
    return result;
  } catch (error) {
    throw error;
  }
};

export const handler = async (event, context, callback) => {
  const { hash, network } = event.queryStringParameters;
  if (!lambdaAllowedAccess(event)) {
    callback(null, {
      statusCode: 500,
      body: 'Something went wrong'
    });
  }
  try {
    const result = await checkTransactionStatus(hash, network);
    callback(null, {
      statusCode: 200,
      body: JSON.stringify(result)
    });
  } catch (error) {
    console.error(error);
    callback(null, {
      statusCode: 500,
      body: error
    });
  }
};
