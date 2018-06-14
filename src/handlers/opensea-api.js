import axios from 'axios';
import { parseAccountUniqueTokens } from './parsers';

const openseaApiKey = process.env.REACT_APP_OPENSEA_API_KEY || '';

/**
 * Configuration for opensea api
 * @type axios instance
 */
const api = axios.create({
  baseURL: 'https://api.opensea.io/api/v1',
  timeout: 30000, // 30 secs
  headers: {
    Accept: 'application/json',
    'X-API-KEY': openseaApiKey,
  },
});

/**
 * @desc get opensea unique tokens
 * @param  {String}   [address='']
 * @return {Promise}
 */
export const apiGetAccountUniqueTokens = async (address = '') => {
  const data = await api.get(`/assets?owner=${address}`);
  const result = parseAccountUniqueTokens(data);
  return result;
};
