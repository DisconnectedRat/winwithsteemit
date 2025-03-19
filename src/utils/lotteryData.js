"use server";
import { firestore } from "@/utils/firebaseAdmin";
import { sendSteemPayment } from "@/utils/steemAPI";

// 🔹 COLLECTION NAMES (adjust if desired)
const WINNING_NUMBERS_COLLECTION = "winningNumbers";
const JACKPOT_WINNERS_COLLECTION = "jackpotWinners";
const PRIZE_HISTORY_COLLECTION = "prizeHistory";

/**
 * 🔹 Fetch confirmed lottery entrants
 *   (Placeholder or connect to Steemit API logic)
 */
export async function fetchConfirmedEntrants() {
  try {
    console.log("✅ Fetching confirmed lottery entrants...");
    // Replace with actual logic to retrieve entrants.
    // Example:
    // const response = await fetch("/api/fetchSteemTransactions");
    // const data = await response.json();
    return []; // Placeholder
  } catch (error) {
    console.error("❌ Error fetching confirmed entrants:", error);
    return [];
  }
}

/**
 * 🔹 Fetch past winning numbers
 *   Returns the most recent `days` entries in descending order
 */
export async function fetchPastWinners(days = 10) {
  try {
    console.log("🔄 Fetching past winning numbers from Firestore...");
    const snapshot = await firestore
      .collection(WINNING_NUMBERS_COLLECTION)
      .orderBy("date", "desc")
      .limit(days)
      .get();

    const history = [];
    snapshot.forEach((doc) => {
      history.push(doc.data());
    });

    // If you want them in ascending date order, reverse:
    return history.reverse();
  } catch (error) {
    console.warn("⚠️ Error fetching past winners:", error);
    return [];
  }
}

/**
 * 🔹 Generate & Store Winning Number in Firestore
 */
export async function generateWinningNumber() {
  const newNumber = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  const today = new Date().toISOString().split("T")[0];

  try {
    await firestore
      .collection(WINNING_NUMBERS_COLLECTION)
      .doc(today)
      .set({
        number: newNumber,
        date: today,
        createdAt: new Date().toISOString(),
      });

    console.log(`🎉 New Winning Number Generated: ${newNumber}`);
    return newNumber;
  } catch (error) {
    console.error("❌ Error storing winning number:", error);
    return null;
  }
}

/**
 * 🔹 Fetch stored winning number
 *   If today's doc doesn't exist, generate a new one
 */
export async function fetchWinningNumber() {
  try {
    console.log("✅ Fetching Winning Number...");
    console.log("🌍 Running in Environment:", process.env.NEXT_PUBLIC_ENV || "Unknown");

    const today = new Date().toISOString().split("T")[0];
    const docRef = firestore.collection(WINNING_NUMBERS_COLLECTION).doc(today);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      console.warn("⚠️ No winning number found for today. Generating a new one...");
      return await generateWinningNumber();
    }

    const data = docSnap.data();
    if (data.date !== today) {
      console.log("🔄 Generating New Winning Number for today...");
      return await generateWinningNumber();
    }

    console.log("🎯 Returning Winning Number:", data.number);
    return data.number;
  } catch (error) {
    console.error("❌ Error fetching winning number:", error);
    return null;
  }
}

/**
 * 🔹 Store latest jackpot winner
 *   Saves a doc in the "jackpotWinners" collection with a doc ID "latest"
 */
export async function updateJackpotWinner(username, amount) {
  try {
    await firestore
      .collection(JACKPOT_WINNERS_COLLECTION)
      .doc("latest")
      .set({
        username,
        amount,
        date: new Date().toISOString().split("T")[0],
      });

    console.log(`✅ Updated jackpot winner: ${username} - ${amount}`);
  } catch (error) {
    console.error("❌ Error updating jackpot winner:", error);
  }
}

/**
 * 🔹 Fetch latest jackpot winner
 *   Reads the doc with ID "latest" from "jackpotWinners" collection
 */
export async function fetchJackpotWinner() {
  try {
    const docRef = firestore.collection(JACKPOT_WINNERS_COLLECTION).doc("latest");
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      console.warn("⚠️ No jackpot winner found.");
      return null;
    }
    return docSnap.data();
  } catch (error) {
    console.warn("⚠️ Error fetching jackpot winner:", error);
    return null;
  }
}

/**
 * 🔹 Update total prize distributed
 *   We'll store a single doc "stats" in the "prizeHistory" collection
 */
export async function updateTotalPrize(prizes) {
  try {
    const docRef = firestore.collection(PRIZE_HISTORY_COLLECTION).doc("stats");
    const docSnap = await docRef.get();

    let existingData = { totalPrize: 0 };
    if (docSnap.exists) {
      existingData = docSnap.data();
    }

    const totalToAdd = prizes.reduce((sum, p) => sum + p.amount, 0);
    const newTotalPrize = (existingData.totalPrize || 0) + totalToAdd;

    await docRef.set({ totalPrize: newTotalPrize });
    console.log(`✅ Updated total prize: ${newTotalPrize}`);
    return newTotalPrize;
  } catch (error) {
    console.error("❌ Error updating total prize:", error);
    return 0;
  }
}

/**
 * 🔹 Fetch total prize distributed
 *   Reads the doc "stats" from "prizeHistory" collection
 */
export async function fetchTotalPrize() {
  try {
    const docRef = firestore.collection(PRIZE_HISTORY_COLLECTION).doc("stats");
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      console.warn("⚠️ No total prize doc found, returning 0.");
      return 0;
    }

    const { totalPrize } = docSnap.data();
    return totalPrize || 0;
  } catch (error) {
    console.warn("⚠️ Error fetching total prize, returning 0:", error);
    return 0;
  }
}

/**
 * 🔹 Process winners and distribute prizes
 */
export async function distributePrizes() {
  try {
    const winningNumber = await fetchWinningNumber();
    const entrants = await fetchConfirmedEntrants();
    let prizeTransactions = [];

    if (!winningNumber || entrants.length === 0) {
      console.log("🚫 No valid winning number or entrants found.");
      return;
    }

    // Identify winners
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

    // Send payments
    for (const tx of prizeTransactions) {
      await sendSteemPayment(tx.username, tx.amount, `Winning Prize for Tickets: ${tx.winningTickets.join(", ")}`);
      console.log(`✅ Sent ${tx.amount} STEEM to ${tx.username}`);
    }
  } catch (error) {
    console.error("❌ Error in prize distribution:", error);
  }
}
