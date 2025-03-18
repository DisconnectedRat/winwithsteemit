"use server";
import { sendSteemPayment } from "@/utils/steemAPI";
import fs from "fs/promises";
import path from "path";

const JACKPOT_WINNER_FILE = path.join(process.cwd(), "src/data/jackpotWinner.json");
const PRIZE_HISTORY_FILE = path.join(process.cwd(), "src/data/prizeHistory.json");
const WINNING_NUMBER_FILE = path.join(process.cwd(), "src/data/winningNumber.json");

// **🔹 Ensure directory exists before writing**
async function ensureFileExists(filePath, defaultContent) {
  try {
    await fs.access(filePath);
  } catch {
    console.warn(`⚠️ File missing: ${filePath}, creating new file...`);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(defaultContent, null, 2));
  }
}

// **🔹 Fetch confirmed lottery entrants (Newly Added)**
export async function fetchConfirmedEntrants() {
  try {
    console.log("✅ Fetching confirmed lottery entrants...");
    
    // 🚀 Replace this with actual logic to get entrants from Steemit API
    // Example:
    // const response = await fetch("/api/fetchSteemTransactions");
    // const data = await response.json();
    
    return []; // Placeholder return
  } catch (error) {
    console.error("❌ Error fetching confirmed entrants:", error);
    return [];
  }
}

// **🔹 Fetch past winning numbers**
export async function fetchPastWinners(days = 10) {
  try {
    console.log("🔄 Fetching past winning numbers...");
    await ensureFileExists(WINNING_NUMBER_FILE, []);

    const data = await fs.readFile(WINNING_NUMBER_FILE, "utf8");
    let history = JSON.parse(data);

    if (!Array.isArray(history)) {
      console.error("❌ Error: winningNumber.json is not an array. Resetting...");
      history = [];
    }

    return history.slice(-days);
  } catch (error) {
    console.warn("⚠️ Error fetching past winners:", error);
    return [];
  }
}

// **🔹 Generate & Store Winning Number**
export async function generateWinningNumber() {
  const newNumber = Math.floor(100 + Math.random() * 900).toString();
  const today = new Date().toISOString().split("T")[0];

  try {
    await ensureFileExists(WINNING_NUMBER_FILE, []);

    const data = await fs.readFile(WINNING_NUMBER_FILE, "utf8");
    let history = JSON.parse(data);

    if (!Array.isArray(history)) {
      console.warn("⚠️ Winning Number file was not an array. Resetting...");
      history = [];
    }

    history.push({ number: newNumber, date: today });
    history = history.slice(-10);

    await fs.writeFile(WINNING_NUMBER_FILE, JSON.stringify(history, null, 2));
    console.log(`🎉 New Winning Number Generated: ${newNumber}`);
    return newNumber;
  } catch (error) {
    console.error("❌ Error storing winning number:", error);
    return null;
  }
}

// **🔹 Fetch stored winning number**
export async function fetchWinningNumber() {
  try {
    console.log("✅ Fetching Winning Number...");
    console.log("🌍 Running in Environment:", process.env.NEXT_PUBLIC_ENV || "Unknown");
    
    await ensureFileExists(WINNING_NUMBER_FILE, []);

    const data = await fs.readFile(WINNING_NUMBER_FILE, "utf8");
    let history = JSON.parse(data);

    if (!Array.isArray(history)) {
      console.error("❌ Error: winningNumber.json is not an array. Returning null.");
      return null;
    }

    const latestEntry = history.length > 0 ? history[history.length - 1] : null;
    if (!latestEntry) {
      console.warn("⚠️ No winning number found. Generating a new one...");
      return await generateWinningNumber();
    }

    const today = new Date().toISOString().split("T")[0];
    if (latestEntry.date !== today) {
      console.log("🔄 Generating New Winning Number for today...");
      return await generateWinningNumber();
    }

    console.log("🎯 Returning Winning Number:", latestEntry.number);
    return latestEntry.number;
  } catch (error) {
    console.error("❌ Error fetching winning number:", error);
    return null;
  }
}

// **🔹 Store latest jackpot winner**
export async function updateJackpotWinner(username, amount) {
  try {
    await ensureFileExists(JACKPOT_WINNER_FILE, {});
    const jackpotData = { username, amount, date: new Date().toISOString().split("T")[0] };
    await fs.writeFile(JACKPOT_WINNER_FILE, JSON.stringify(jackpotData, null, 2));
  } catch (error) {
    console.error("❌ Error updating jackpot winner:", error);
  }
}

// **🔹 Fetch latest jackpot winner**
export async function fetchJackpotWinner() {
  try {
    await ensureFileExists(JACKPOT_WINNER_FILE, {});
    const data = await fs.readFile(JACKPOT_WINNER_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.warn("⚠️ No jackpot winner found.");
    return null;
  }
}

// **🔹 Update total prize distributed**
export async function updateTotalPrize(prizes) {
  try {
    await ensureFileExists(PRIZE_HISTORY_FILE, { totalPrize: 0 });

    const data = await fs.readFile(PRIZE_HISTORY_FILE, "utf8");
    const existingData = JSON.parse(data);

    const totalPrize = existingData.totalPrize + prizes.reduce((sum, p) => sum + p.amount, 0);
    await fs.writeFile(PRIZE_HISTORY_FILE, JSON.stringify({ totalPrize }, null, 2));

    return totalPrize;
  } catch (error) {
    console.error("❌ Error updating total prize:", error);
    return 0;
  }
}

// **🔹 Fetch total prize distributed**
export async function fetchTotalPrize() {
  try {
    await ensureFileExists(PRIZE_HISTORY_FILE, { totalPrize: 0 });

    const data = await fs.readFile(PRIZE_HISTORY_FILE, "utf8");
    const { totalPrize } = JSON.parse(data);
    return totalPrize;
  } catch (error) {
    console.warn("⚠️ Total prize file missing, returning 0.");
    return 0;
  }
}

// **🔹 Process winners and distribute prizes**
export async function distributePrizes() {
  try {
    const winningNumber = await fetchWinningNumber();
    const entrants = await fetchConfirmedEntrants();
    let prizeTransactions = [];

    if (!winningNumber || entrants.length === 0) {
      console.log("🚫 No valid winning number or entrants found.");
      return;
    }

    let jackpotWinners = [];
    entrants.forEach(({ username, tickets }) => {
      tickets.forEach((ticket) => {
        if (ticket === winningNumber) {
          jackpotWinners.push(username);
        }
      });
    });

    const jackpotAmount = 50;
    const jackpotPrizePerWinner = jackpotWinners.length > 0 ? jackpotAmount / jackpotWinners.length : 0;

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
      }
    });

    for (const tx of prizeTransactions) {
      await sendSteemPayment(tx.username, tx.amount, `Winning Prize for Tickets: ${tx.winningTickets.join(", ")}`);
      console.log(`✅ Sent ${tx.amount} STEEM to ${tx.username}`);
    }
  } catch (error) {
    console.error("❌ Error in prize distribution:", error);
  }
}
