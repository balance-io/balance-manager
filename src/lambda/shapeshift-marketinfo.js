import axios from 'axios';
import { lambdaAllowedAccess } from '../helpers/utilities';

const getMarketInfo = async (exchangePair = 'zrx_eth') => {
  try {
    let { data } = await axios.get(`https://shapeshift.io/marketinfo/${exchangePair}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const handler = async (event, context, callback) => {
  try {
    const { exchangePair } = event.queryStringParameters;
    if (!lambdaAllowedAccess(event)) {
      callback(null, {
        statusCode: 500,
        body: 'Something went wrong'
      });
      return;
    }
    if (exchangePair) {
      const result = await getMarketInfo(exchangePair);
      callback(null, {
        statusCode: 200,
        body: JSON.stringify(result)
      });
    } else {
      callback(null, {
        statusCode: 200,
        body: JSON.stringify({})
      });
    }
  } catch (error) {
    console.error(error);
    callback(null, {
      statusCode: 500,
      body: 'Something went wrong'
    });
  }
};
