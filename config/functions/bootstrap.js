const WebSocket  = require('ws')

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

module.exports = () => {
    const ws = new WebSocket('wss://fstream.binance.com/ws/btcusdt@kline_3m');

    ws.on('message', async (data) => {
        if (data) {
          try {
           const bin = JSON.parse(data); 
            if (bin.k.x) {
               const betHistoryLatest = await strapi.query('bet-history').model.find({}).sort({_id: -1}).limit(1);
               const winningColor = betHistoryLatest[0].close > parseFloat(bin.k.c)
                    ? "red"
                    : "green";

              await strapi.api["bet-history"].services["bet-history"].create({
                  winning_color: winningColor,
                  open: parseFloat(bin.k.o),
                  close: parseFloat(bin.k.c),
                  high: parseFloat(bin.k.h),
                  low: parseFloat(bin.k.l)
                });
              await strapi.api["current-round"].services["current-round"].payoutPlayers(winningColor);
              await strapi.query('current-round').model.deleteMany({});
            } 
          } catch (err) {
            console.log(err)
          }
        } 
    });

    var io = require('socket.io')(strapi.server, {
        cors: {
          origin: "http://localhost:3000",
          methods: ["GET", "POST"],
          allowedHeaders: ["my-custom-header"],
          credentials: true
        }
    });

    io.on('connection', function(socket) {
          socket.on('betSocket', async ({bettingOption}, response) => {
         const gameConfig = await strapi.api["current-round"].services["current-round"].calculateOverAllTotals();
          response(gameConfig)
        })
      });
  };
