import axios from 'axios';
import { parseAccountUniqueTokens } from './parsers';
const OPEN_SEA_API = 'https://api.opensea.io/api/v1/assets?owner=';

const api = axios.create({
  baseURL: 'https://some-domain.com/api/',
  timeout: 30000,
});

export const fetchUniqueTokens = accountAddress => {
  api.get(`${OPEN_SEA_API}${accountAddress}`).then(data => {
    parseAccountUniqueTokens(data);
  });
};
