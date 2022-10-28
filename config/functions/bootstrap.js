const WebSocket  = require('ws')
const axios = require('axios');

'use strict';
/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 *
 * See more details here: https://strapi.io/documentation/developer-docs/latest/setup-deployment-guides/configurations.html#bootstrap
 */

module.exports = async () => {
    const ws = new WebSocket('wss://fstream.binance.com/ws/btcusdt@kline_3m');
    const countBetHistory = await strapi.api["current-round"].services["current-round"].count();

    console.log(strapi.config.server.CUSTOMENV)

    if(countBetHistory <= 0) {
      const binanceData = await axios("https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=3m" )
      const { data } = binanceData;

      const finalData = data[data.length - 1]

      await strapi.api["bet-history"].services["bet-history"].create({
        winning_color:
        parseFloat(data[data.length - 1][4]) > parseFloat(finalData[4])
          ? "red"
          : "green",
        open: parseFloat(finalData[1]),
        close: parseFloat(finalData[4]),
        high: parseFloat(finalData[2]),
        low: parseFloat(finalData[3]),
      });
    }

    ws.on('message', async (data) => {
        if (data) {
              console.log('data is true')
          try {
          console.log('tryyy')
           const bin = JSON.parse(data); 
           if(countBetHistory > 0) {
              console.log('countBetHistory greater than 0')
            if (bin.k.x) {
              console.log('bin.k.x is true')
              console.log('adding history start')
               const betHistoryLatest = await strapi.query('bet-history').model.find({}).sort({_id: -1}).limit(1);
               const winningColor = betHistoryLatest[0].close > parseFloat(bin.k.c)? "red" : "green";

                await strapi.api["bet-history"].services["bet-history"].create({
                  winning_color: winningColor,
                  open: parseFloat(bin.k.o),
                  close: parseFloat(bin.k.c),
                  high: parseFloat(bin.k.h),
                  low: parseFloat(bin.k.l)
                });
              await strapi.api["current-round"].services["current-round"].payoutPlayers(winningColor);
              await strapi.query('current-round').model.deleteMany({});
              console.log(strapi.query('current-round').model)
              console.log('=============================')
              console.log('adding history end')
            } 
           }
          } catch (err) {
            console.log(err)
          }
        } 
    });

    var io = require('socket.io')(strapi.server, {
        cors: {
          origin: strapi.config.server.CUSTOMENV.FRONT_END_URL,
          methods: ["GET", "POST"],
          allowedHeaders: ["my-custom-header"],
          credentials: true
        }
    });

    io.on('connection', function(socket) {
          socket.on('betSocket', async ({bettingOption}, response) => {
         const gameConfig = await strapi.api["current-round"].services["current-round"].calculateOverAllTotals();
          console.log('web sockeeeeeeeeeeeet')

          response(gameConfig)
        })
      });
  };
