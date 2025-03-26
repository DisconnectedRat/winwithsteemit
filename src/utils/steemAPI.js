import axios from "axios";

// Updated fetchSteemTransactions using our own API route
export async function fetchSteemTransactions() {
  try {
    console.log("🔄 [Client] Fetching transactions from /api/fetchSteemTransactions...");
    const response = await axios.get("/api/fetchSteemTransactions");
    const data = response.data;
    console.log("🔄 [Client] Received response:", data);
    
    // Ensure the response has a 'transactions' property that is an array
    if (!data || !Array.isArray(data.transactions)) {
      throw new Error("Invalid response format: 'transactions' property is missing or not an array");
    }
    
    return data;
  } catch (error) {
    console.error("❌ Error in fetchSteemTransactions:", error);
    throw error;
  }
}

// 🔹 Fetch & Calculate Top Buyers (from Firestore "purchasedTickets")
import { firestore } from "@/utils/firebaseAdmin";

export async function fetchTopBuyers() {
  try {
    const snapshot = await firestore.collection ("purchasedTickets").get();
    const buyerTotals = {};

    snapshot.forEach(doc => {
      const data = doc.data();
      const { username, ticketsBought } = data;

      if (!username || typeof ticketsBought !== "number") return;

      if (buyerTotals[username]) {
        buyerTotals[username] += ticketsBought;
      } else {
        buyerTotals[username] = ticketsBought;
      }
    });

    const sorted = Object.entries(buyerTotals)
      .map(([username, tickets]) => ({ username, tickets }))
      .sort((a, b) => b.tickets - a.tickets)
      .slice(0, 5);

    return sorted;
  } catch (error) {
    console.error("❌ Error fetching top buyers from Firestore:", error);
    return [];
  }
}

// **🔹 Send Steem Payment (Newly Added)**
export async function sendSteemPayment(username, amount, memo) {
  try {
    console.log(`✅ Sending ${amount} STEEM to ${username} with memo: ${memo}`);
    // 🚀 Placeholder: Add your actual Steemit transaction logic here.
    return { success: true, message: "Payment sent" };
  } catch (error) {
    console.error("❌ Error sending Steem payment:", error);
    return { success: false, message: "Payment failed" };
  }
}
