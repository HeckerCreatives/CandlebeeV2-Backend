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
    let counter = 0

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
          try {
           const bin = JSON.parse(data); 
           if(countBetHistory > 0) {
            if (bin.k.x) {
              console.log("start")
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
              // await strapi.query('current-round').model.deleteMany({});
              console.log("finish")
            } 
           }
          } catch (err) {
            console.log(err)
          }
        } 
    });

    var io = require('socket.io')(strapi.server, {
        cors: {
          // origin: strapi.config.server.CUSTOMENV.FRONT_END_URL,
          origin: 'http://localhost:3000',
          methods: ["GET", "POST"],
          allowedHeaders: ["my-custom-header"],
          credentials: true
        }
    });

    io.on('connection', function(socket) {
          socket.on('betSocket', async ({dd, user_id}, response) => {
           // const userBenInCurrentRound = await strapi.query('current-round').model.find({}).sort({user_details: -1}).limit(1);
            // strapi.api["current-round"].services["current-round"].createOrUpdate({
            //     _id: "634e4e8ef8d97314707a8dcf",
            //     timer: parseInt(cronCustomData.timer) - 1  
            // })
            if (user_id) {
              console.log(user_id)
               const userCurrentBet = await strapi.query('current-round').model.find({user_details: user_id});
                  if (dd.id.length !== 0) {
                    if (counter === 0) { 
                    counter = 1 
                    const bet = await strapi.query('current-round').model.find({user_details: dd.id});
                    if (bet.length === 0) {
                        await strapi.query('user', 'users-permissions').update({id: dd.id}, {credits: dd.credits});
                        await strapi.api["current-round"].services["current-round"].create({
                          user_details: dd.id,
                          amount: dd.bettingAmount,
                          bet_color: dd.bet
                        });
                          counter = 0 
                    } else {
                        await strapi.query('current-round').model.find({user_details: dd.id}).updateOne({
                          user_details: dd.id,
                          amount: dd.bettingAmount,
                          bet_color: dd.bet
                        });
                        counter = 0 
                      }
                    }
                  }
                console.log(userCurrentBet)

                const gameConfig = await strapi.api["current-round"].services["current-round"].calculateOverAllTotals();
                response(gameConfig)
            }
       
        })
      });
  };
