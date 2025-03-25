// Calculate prize per entrant
entrants.forEach(({ username, tickets }) => {
  let totalPrize = 0;
  let winningTickets = [];

  tickets.forEach((ticket) => {
    if (ticket === winningNumber) {
      totalPrize += jackpotPrizePerWinner;
      winningTickets.push(ticket);
    }
  });

  if (totalPrize > 0) {
    prizeTransactions.push({ username, amount: totalPrize, winningTickets });
  } else {
    // Record a "no win" entry to show a message like "Better luck next time"
    prizeTransactions.push({ username, amount: 0, winningTickets: [] });
  }
});
