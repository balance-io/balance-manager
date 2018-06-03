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

  server.route({
    method: 'get',
    path: '/candles',
    options: {
      notes: 'Get candles for Ethereum in 15min intervals the last 24 hours',
      handler: async (request, h) => {
        const time = await axios.get('https://api.binance.com/api/v1/time');
        const oneDayAgo = moment(time.data.serverTime)
          .subtract(1, 'days')
          .valueOf();
        console.log(
          `https://api.binance.com/api/v1/klines?symbol=ETHUSDT&interval=2h&startTime=${oneDayAgo}`,
        );
        const candles = await axios.get(
          `https://api.binance.com/api/v1/klines?symbol=ETHUSDT&interval=2h&startTime=${oneDayAgo}`,
        );
        return candles.data;
      },
    },
  });
};

module.exports = {
  initialize,
};
