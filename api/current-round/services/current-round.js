'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {
  calculateOverAllTotals: async () => {
    console.log('calculateOverAllTotals')
    const currentRounds = await strapi.query('current-round').model.find();

    let greenTotal = 0;
    let redTotal = 0;
     currentRounds.forEach((rounds) => {
        switch(rounds.bet_color) {
          case "green":
            greenTotal = greenTotal + rounds.amount
          break;
          case "red":
            redTotal = redTotal + rounds.amount
          break;
        }
      });

      const totalBets = greenTotal + redTotal;

      const greenDivided = totalBets / greenTotal;
      const redDivided = totalBets / redTotal;

      const redSubtracted = greenDivided - 0.10;
      const greenSubtracted = redDivided - 0.10;

      const redPayout = redSubtracted * 100;
      const greenPayout = greenSubtracted * 100;


    return {
      greenTotal,
      redTotal,
      redPayout,
      greenPayout
    }
  },

  payoutPlayers: async (winningBet) => {
    console.log('payoutPlayers')
    try {
      const currentRounds = await strapi.query('current-round').model.find({
        bet_color: winningBet
      });
       const allCurrentRounds = await strapi.query('current-round').model.find();

        let greenTotal = 0;
        let redTotal = 0;
        allCurrentRounds.forEach((rounds) => {
            switch(rounds.bet_color) {
              case "green":
                greenTotal = greenTotal + rounds.amount
              break;
              case "red":
                redTotal = redTotal + rounds.amount
              break;
            }
        });

      const totalBets = greenTotal + redTotal;
      const winningBets =  winningBet === 'green' ? greenTotal : redTotal;
      const divided = totalBets / winningBets;
      const subtracted = divided - 0.10;
      const payout = subtracted * 100;

      currentRounds.forEach(async (round) => {
        const user = await strapi.query('user', 'users-permissions').find({id: round.user_details});
        const dividedPayout = payout / 100;
        const winningPayout =  dividedPayout * round.amount
        const userCredits = user[0].credits;
        await strapi.query('user', 'users-permissions').update({id: round.user_details}, {credits: userCredits + winningPayout});
      })

      return true
    } catch(err){
      return false
    }
   
  }
};
