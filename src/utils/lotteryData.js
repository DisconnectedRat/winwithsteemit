import { firestore } from "@/utils/firebaseAdmin";
import { sendSteemPayment } from "@/utils/steemAPI";

// 🔹 COLLECTION NAMES (adjust if desired)
const WINNING_NUMBERS_COLLECTION = "winningNumbers";
const JACKPOT_WINNERS_COLLECTION = "jackpotWinners";
const PRIZE_HISTORY_COLLECTION = "prizeHistory";
const PAST_WINNERS_COLLECTION = "pastWinners"; // New collection for historical records

/**
 * 🔹 Fetch confirmed lottery entrants from "purchasedTickets" for yesterday.
 *   Ensures each document has a tickets array and that each ticket is a 3-digit string.
 */
export async function fetchConfirmedEntrants() {
  try {
    // Calculate yesterday's date range in UTC.
    const now = new Date();
    // Get today's UTC midnight.
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    // Get yesterday's date by subtracting one day.
    const yesterdayUTC = new Date(todayUTC);
    yesterdayUTC.setUTCDate(todayUTC.getUTCDate() - 1);

    // Define start and end of yesterday in UTC.
    const startOfYesterday = new Date(Date.UTC(
      yesterdayUTC.getUTCFullYear(),
      yesterdayUTC.getUTCMonth(),
      yesterdayUTC.getUTCDate(), 0, 0, 0
    ));
    const endOfYesterday = new Date(Date.UTC(
      yesterdayUTC.getUTCFullYear(),
      yesterdayUTC.getUTCMonth(),
      yesterdayUTC.getUTCDate(), 23, 59, 59, 999
    ));

    // Convert date boundaries to ISO strings if your timestamp field is stored as a string.
    const startISO = startOfYesterday.toISOString();
    const endISO = endOfYesterday.toISOString();

    // Query "purchasedTickets" for documents with a timestamp within yesterday.
    const snapshot = await firestore.collection("purchasedTickets")
      .where("timestamp", ">=", startISO)
      .where("timestamp", "<=", endISO)
      .get();

    const entrants = [];
    snapshot.forEach((doc) => {
      entrants.push({ id: doc.id, ...doc.data() });
    });

    return entrants;
  } catch (error) {
    console.error("Error fetching confirmed entrants:", error);
    return [];
  }
}

/**
 * 🔹 Fetch past winning numbers
 *   Returns the most recent days entries in descending order
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
 * 🔹 Fetch Past Winner List
 *   Returns the most recent limit winners from the "pastWinners" collection.
 */
export async function fetchPastWinnerList(limit = 5) {
  try {
    console.log("Fetching past winners from Firestore...");
    const snapshot = await firestore
      .collection(PAST_WINNERS_COLLECTION)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const winners = [];
    snapshot.forEach((doc) => {
      winners.push(doc.data());
    });

    return winners;
  } catch (error) {
    console.error("Error fetching past winner list:", error);
    return [];
  }
}

/**
 * 🔹 Process winners and distribute prizes
 *   - Fetches confirmed entrants
 *   - Compares each entrant's tickets to the winning number
 *   - Calculates prizes
 *   - Sends payments via sendSteemPayment
 *   - Stores a historical record in the "pastWinners" collection
 */
export async function distributePrizes() {
  try {
    const winningNumber = await fetchWinningNumber();
    const entrantList = await fetchConfirmedEntrants();
    let prizeTransactions = [];

    if (!winningNumber || entrantList.length === 0) {
      console.log("🚫 No valid winning number or entrants found.");
      return;
    }

    // We'll calculate prizes for each ticket based on your specified conditions.
    //   1) 3 Correct Numbers (Jackpot): 50 STEEM
    //   2) 2 Correct Numbers (Exact Position): 10 STEEM
    //   3) Super Number in correct position (1st digit): 5 STEEM
    //   4) Super Number anywhere in the ticket: 1 STEAM

    entrantList.forEach(({ username, tickets, timestamp }) => {
      let totalPrize = 0;
      let winningTickets = [];

      tickets.forEach((ticket) => {
        const winningDigits = winningNumber.split("");
        const ticketDigits = ticket.split("");
        let prize = 0;

        if (ticket === winningNumber) {
          // Condition #1: All 3 digits match exactly => 50
          prize = 50;
        } else if (
          // Condition #2: Any 2 correct in the exact position => 10
          (ticketDigits[0] === winningDigits[0] && ticketDigits[1] === winningDigits[1]) ||
          (ticketDigits[0] === winningDigits[0] && ticketDigits[2] === winningDigits[2]) ||
          (ticketDigits[1] === winningDigits[1] && ticketDigits[2] === winningDigits[2])
        ) {
          prize = 10;
        } else if (ticketDigits[0] === winningDigits[0]) {
          // Condition #3: Super number in correct position => 5
          prize = 5;
        } else if (ticketDigits.slice(1).includes(winningDigits[0])) {
          // Condition #4: Super number exists anywhere else => 1
          prize = 1;
        }

        if (prize > 0) {
          winningTickets.push(ticket);
          totalPrize += prize;
        }
      });

      prizeTransactions.push({
        username,
        amount: totalPrize,
        winningTickets,
        purchasedTickets: tickets,
        purchasedAt: timestamp, // use the original ticket purchase time
      });
    });

    // Send payments and store historical records in the "pastWinners" collection.
    for (const tx of prizeTransactions) {
      if (tx.amount > 0) {
        await sendSteemPayment(
          tx.username,
          tx.amount,
          `Winning Prize for Tickets: ${tx.winningTickets.join(", ")}`
        );
        console.log(`✅ Sent ${tx.amount} STEEM to ${tx.username}`);
      } else {
        console.log(`🔸 No prize for ${tx.username}`);
      }

      // Note: We use 'purchasedAt' as the original timestamp from purchasedTickets.
      await firestore.collection(PAST_WINNERS_COLLECTION).add({
        username: tx.username,
        purchasedTickets: tx.purchasedTickets,
        winningTickets: tx.winningTickets,
        winningNumber: winningNumber,
        amount: tx.amount,
        date: new Date().toISOString().split("T")[0],
        purchasedAt: tx.purchasedAt,
      });

      console.log(`✅ Recorded prize history for ${tx.username}`);
    }
  } catch (error) {
    console.error("❌ Error in prize distribution:", error);
  }
}
