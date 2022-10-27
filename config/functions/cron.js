const axios = require('axios');
'use strict';

/**
 * Cron config that gives you an opportunity
 * to run scheduled jobs.
 *
 * The cron format consists of:
 * [SECOND (optional)] [MINUTE] [HOUR] [DAY OF MONTH] [MONTH OF YEAR] [DAY OF WEEK]
 *
 * See more details here: https://strapi.io/documentation/developer-docs/latest/setup-deployment-guides/configurations.html#cron-tasks
 */


module.exports = {
    // '0/1 * * * * *': 
    // async () => {
    //   console.log("1 sec")
    //   try {
    //     const cronJobService = await strapi.api["cron-job"].services["cron-job"];
    //     const cronCustomData = await cronJobService.find() 

    //     if(parseInt(cronCustomData.timer) > 1 && cronCustomData.round) {
    //        cronJobService.createOrUpdate({
    //             _id: "634e4e8ef8d97314707a8dcf",
    //             timer: parseInt(cronCustomData.timer) - 1  
    //         })


    //       // if (parseInt(cronCustomData.timer) <= 1) {
    //       //    const binanceData = await axios("https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=3m" )
    //       //     const { data } = binanceData;

    //       //     const finalData = data[data.length - 1]

    //       //     const betHistoryLatest = await strapi.query('bet-history').model.find({}).sort({_id: -1}).limit(1);

    //       //       await strapi.api["bet-history"].services["bet-history"].create({
    //       //         winning_color:
    //       //         parseFloat(betHistoryLatest[0].close) > parseFloat(finalData[4])
    //       //           ? "red"
    //       //           : "green",
    //       //         open: parseFloat(finalData[1]),
    //       //         close: parseFloat(finalData[4]),
    //       //         high: parseFloat(finalData[2]),
    //       //         low: parseFloat(finalData[3]),
    //       //       });
    //       // }
    //     }
    //   } catch(err) {

    //   }
    // }
    // options: {
    //   tz: 'UTC',
    // },
};
