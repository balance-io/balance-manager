import axios from 'axios';
import { lambdaAllowedAccess } from '../helpers/utilities';

const getCoins = async (hash = '', network = 'mainnet') => {
  try {
    let { data } = await axios.get('https://shapeshift.io/getcoins');
    return data;
  } catch (error) {
    throw error;
  }
};

export const handler = async (event, context, callback) => {
  try {
    if (!lambdaAllowedAccess(event)) {
      callback(null, {
        statusCode: 500,
        body: 'Something went wrong'
      });
      return;
    }
    const result = await getCoins();
    callback(null, {
      statusCode: 200,
      body: JSON.stringify(result)
    });
  } catch (error) {
    console.error(error);
    callback(null, {
      statusCode: 500,
      body: 'Something went wrong'
    });
  }
};
