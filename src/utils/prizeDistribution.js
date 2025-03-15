"use server";
import { sendSteemPayment } from "@/utils/steemAPI";
import { fetchWinningNumber, fetchConfirmedEntrants, updateTotalPrize, updateJackpotWinner } from "@/utils/lotteryData";

// Function to process winners and distribute prizes
export async function distributePrizes() {
  try {
    const winningNumber = await fetchWinningNumber();
    const entrants = await fetchConfirmedEntrants();
    let totalPayouts = [];
    let jackpotWinners = [];
    let jackpotPrizePerWinner = 0;
    const jackpotAmount = 50; // Default jackpot

    if (!winningNumber || entrants.length === 0) {
      console.log("No valid winning number or entrants found.");
      return;
    }

    // Step 1: Determine Jackpot Winners
    entrants.forEach(({ username, tickets }) => {
      tickets.forEach((ticket) => {
        if (ticket === winningNumber) {
          jackpotWinners.push(username);
        }
      });
    });

    // Step 2: Split Jackpot if Multiple Winners
    if (jackpotWinners.length > 0) {
      jackpotPrizePerWinner = jackpotAmount / jackpotWinners.length;
      const latestJackpotWinner = jackpotWinners[0]; // Select first winner for display

      // **Update Latest Jackpot Winner**
      await updateJackpotWinner(latestJackpotWinner, jackpotPrizePerWinner);
    }

    // Step 3: Calculate Prizes for All Participants
    entrants.forEach(({ username, tickets }) => {
      let totalPrize = 0;
      let winningTickets = [];

      tickets.forEach((ticket) => {
        let matchCount = 0;
        let superNumberMatch = false;
        const ticketArray = ticket.split("");
        const winningArray = winningNumber.split("");

        // **Jackpot Condition (Already Processed Above)**
        if (ticket === winningNumber) {
          totalPrize += jackpotPrizePerWinner;
          winningTickets.push(ticket);
        }

        // **Check for 2 Correct Numbers in Exact Position**
        ticketArray.forEach((digit, index) => {
          if (digit === winningArray[index]) {
            matchCount++;
          }
        });

        if (matchCount === 2) {
          totalPrize += 10;
          winningTickets.push(ticket);
        }

        // **Check for Super Number (First Digit Match)**
        if (ticketArray[0] === winningArray[0]) {
          totalPrize += 5;
          superNumberMatch = true;
          winningTickets.push(ticket);
        }

        // **Check if Super Number Appears Anywhere**
        if (!superNumberMatch && winningArray.includes(ticketArray[0])) {
          totalPrize += 1;
          winningTickets.push(ticket);
        }
      });

      if (totalPrize > 0) {
        totalPayouts.push({ username, amount: totalPrize, winningTickets });
      }
    });

    // **Step 4: Update Total Prize Pool**
    await updateTotalPrize(totalPayouts);

    // **Step 5: Process Payments**
    for (const tx of totalPayouts) {
      await sendSteemPayment(tx.username, tx.amount, `Winning Prize for Tickets: ${tx.winningTickets.join(", ")}`);
      console.log(`✅ Sent ${tx.amount} STEEM to ${tx.username}`);
    }
  } catch (error) {
    console.error("Error in prize distribution:", error);
  }
}
