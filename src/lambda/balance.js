import axios from 'axios';

const apiGetAddressInfo = (address = '') => {
  return axios.get(`https://api.ethplorer.io/getAddressInfo/${address}?apiKey=freekey`);
};

const asyncRequest = async address => {
  try {
    const response = await apiGetAddressInfo(address);
    return response.data;
  } catch (error) {
    return error;
  }
};

export const handler = async (event, context, callback) => {
  const address = event.path.replace('/balance/', '');

  console.log('address', address);

  asyncRequest(address)
    .then(data => {
      console.log(data);
      callback(null, {
        statusCode: 200,
        body: JSON.stringify(data.ETH.balance)
      });
    })
    .catch(error => {
      console.error(error);
      callback(null, {
        statusCode: 500,
        body: error
      });
    });
};
