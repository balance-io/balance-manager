import axios from 'axios';

const apiGetAccountTransactions = async (address = '', network = 'mainnet') => {
  try {
    const { data } = await axios.get(
      `https://${
        network === 'mainnet' ? `api` : network
      }.trustwalletapp.com/transactions?address=${address}&limit=50&page=1`
    );
    // const transactions = await parseAccountTransactions(data, address, network);
    console.log(data);
    return data;
  } catch (error) {
    throw error;
  }
};

export const handler = async (event, context, callback) => {
  console.log('EVENT', event, '\n');
  const address = event.path.replace('/balance/', '');

  try {
    const data = await apiGetAccountTransactions(address);
    console.log(data);
    callback(null, {
      statusCode: 200,
      body: JSON.stringify(data.ETH.balance)
    });
  } catch (error) {
    console.error(error);
    callback(null, {
      statusCode: 500,
      body: error
    });
  }
};
