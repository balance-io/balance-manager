const Vision = require('vision');
const Inert = require('inert');
const Lout = require('lout');
const axios = require('axios');
const moment = require('moment');

const initialize = async server => {
  await server.register(Vision);
  await server.register(Inert);
  await server.register(Lout);

  server.route({
    method: 'get',
    path: '/',
    options: {
      plugins: {
        lout: false,
      },
      handler: async (request, h) => {
        return h.redirect('/docs');
      },
    },
  });

  server.route({
    method: 'get',
    path: '/ping',
    options: {
      notes: 'Test connectivity to the Rest API',
      handler: async (request, h) => {
        return h.response({});
      },
    },
  });

  function filterNativeCurrencies(symbol) {
    if (
      symbol.indexOf('GBP') !== -1 ||
      symbol.indexOf('EUR') !== -1 ||
      symbol.indexOf('USD') !== -1
    ) {

      return symbol.substr(0, 3) + 'USDT';
    }
    return symbol;
  }

  server.route({
    method: 'get',
    path: '/candles/{symbol}',
    options: {
      notes: 'Get candles for currency in 1 month intervals the last year',
      handler: async (request, h) => {
        const symbol = filterNativeCurrencies(request.params.symbol);
        const time = await axios.get('https://api.binance.com/api/v1/time');
        const oneDayAgo = moment(time.data.serverTime)
          .subtract(1, 'years')
          .valueOf();

        const response = await axios
          .get(
            `https://api.binance.com/api/v1/klines?symbol=${symbol}&interval=1M&startTime=${oneDayAgo}`,
          )
          .then(res => {
            return res.data;
          })
          // Needs better handeling.
          // 400: token not found
          // Other: probably no connection to Binance
          .catch(err => {
            // return [];
            return h.response().code(404);
          });
        return response;
      },
    },
  });
};

module.exports = {
  initialize,
};
