"use server";
import { sendSteemPayment } from "@/utils/steemAPI";
import { fetchConfirmedEntrants } from "@/utils/lotteryData";
import fs from "fs/promises";
import path from "path";

const JACKPOT_WINNER_FILE = path.join(process.cwd(), "src/data/jackpotWinner.json");
const PRIZE_HISTORY_FILE = path.join(process.cwd(), "src/data/prizeHistory.json");
const WINNING_NUMBER_FILE = path.join(process.cwd(), "src/data/winningNumber.json");

// **🔹 Store latest jackpot winner**
export async function updateJackpotWinner(username, amount) {
  try {
    const jackpotData = { username, amount, date: new Date().toISOString().split("T")[0] };
    await fs.writeFile(JACKPOT_WINNER_FILE, JSON.stringify(jackpotData));
  } catch (error) {
    console.error("Error updating jackpot winner:", error);
  }
}

// **🔹 Fetch latest jackpot winner**
export async function fetchJackpotWinner() {
  try {
    const data = await fs.readFile(JACKPOT_WINNER_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.warn("No jackpot winner found.");
    return null;
  }
}

// **🔹 Update total prize distributed**
export async function updateTotalPrize(prizes) {
  try {
    let existingData = { totalPrize: 0 };

    // Read the existing prize data
    try {
      const data = await fs.readFile(PRIZE_HISTORY_FILE, "utf8");
      existingData = JSON.parse(data);
    } catch (error) {
      console.warn("No existing prize data found, initializing...");
    }

    // Add new prize distribution
    const totalPrize = existingData.totalPrize + prizes.reduce((sum, p) => sum + p.amount, 0);

    await fs.writeFile(PRIZE_HISTORY_FILE, JSON.stringify({ totalPrize }));
    return totalPrize;
  } catch (error) {
    console.error("Error updating total prize:", error);
    return 0;
  }
}

// **🔹 Fetch total prize distributed**
export async function fetchTotalPrize() {
  try {
    const data = await fs.readFile(PRIZE_HISTORY_FILE, "utf8");
    const { totalPrize } = JSON.parse(data);
    return totalPrize;
  } catch (error) {
    console.warn("Total prize file missing, returning 0.");
    return 0;
  }
}

// **🔹 Generate and Store Winning Number**
async function generateWinningNumber() {
  const newNumber = Math.floor(100 + Math.random() * 900).toString(); // Generate a 3-digit number

  try {
    await fs.writeFile(
      WINNING_NUMBER_FILE,
      JSON.stringify({ number: newNumber, date: new Date().toISOString().split("T")[0] })
    );
    return newNumber;
  } catch (error) {
    console.error("Error storing winning number:", error);
    return null;
  }
}

// **🔹 Fetch stored winning number**
export async function fetchWinningNumber() {
  try {
    const data = await fs.readFile(WINNING_NUMBER_FILE, "utf8");
    const { number, date } = JSON.parse(data);
    
    // **✅ If it's a new day, generate a new number**
    const today = new Date().toISOString().split("T")[0];
    if (date !== today) {
      return generateWinningNumber();
    }

    return number;
  } catch (error) {
    console.error("Error fetching winning number:", error);
    return generateWinningNumber(); // If file missing, generate a new number
  }
}

// **🔹 Process winners and distribute prizes**
export async function distributePrizes() {
  try {
    const winningNumber = await fetchWinningNumber();
    const entrants = await fetchConfirmedEntrants();
    let prizeTransactions = [];

    if (!winningNumber || entrants.length === 0) {
      console.log("No valid winning number or entrants found.");
      return;
    }

    // **✅ Track jackpot winners**
    let jackpotWinners = [];
    entrants.forEach(({ username, tickets }) => {
      tickets.forEach((ticket) => {
        if (ticket === winningNumber) {
          jackpotWinners.push(username);
        }
      });
    });

    // **✅ Calculate split jackpot**
    const jackpotAmount = 50; // Base Jackpot
    const jackpotPrizePerWinner = jackpotWinners.length > 0 ? jackpotAmount / jackpotWinners.length : 0;

    // **✅ Process each entrant**
    entrants.forEach(({ username, tickets }) => {
      let totalPrize = 0;
      let winningTickets = [];

      tickets.forEach((ticket) => {
        let matchCount = 0;
        let superNumberMatch = false;
        const ticketArray = ticket.split("");
        const winningArray = winningNumber.split("");

        // **🏆 Jackpot Split Logic**
        if (ticket === winningNumber) {
          totalPrize += jackpotPrizePerWinner;
          winningTickets.push(ticket);
        }

        // **🏆 Check other prize conditions**
        ticketArray.forEach((digit, index) => {
          if (digit === winningArray[index]) {
            matchCount++;
          }
        });

        if (matchCount === 2) {
          totalPrize += 10;
          winningTickets.push(ticket);
        }

        if (ticketArray[0] === winningArray[0]) {
          totalPrize += 5;
          superNumberMatch = true;
          winningTickets.push(ticket);
        }

        if (!superNumberMatch && winningArray.includes(ticketArray[0])) {
          totalPrize += 1;
          winningTickets.push(ticket);
        }
      });

      if (totalPrize > 0) {
        // **💰 Push Prize Transaction**
        prizeTransactions.push({ username, amount: totalPrize, winningTickets });
      }
    });

    // **💸 Process Payments**
    for (const tx of prizeTransactions) {
      await sendSteemPayment(tx.username, tx.amount, `Winning Prize for Tickets: ${tx.winningTickets.join(", ")}`);
      console.log(`✅ Sent ${tx.amount} STEEM to ${tx.username}`);
    }
  } catch (error) {
    console.error("Error in prize distribution:", error);
  }
}
