import axios from "axios";

// Updated fetchSteemTransactions using our own API route
export async function fetchSteemTransactions() {
  try {
    console.log("🔄 [Client] Fetching transactions from /api/fetchSteemTransactions...");
    const response = await axios.get("/api/fetchSteemTransactions");
    console.log("🔄 [Client] Received response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error in fetchSteemTransactions:", error);
    throw error;
  }
}

// **🔹 Fetch & Calculate Top Buyers**
export async function fetchTopBuyers() {
  try {
    const { transactions } = await fetchSteemTransactions();
    const buyerStats = {};

    transactions.forEach(({ username, tickets }) => {
      buyerStats[username] = (buyerStats[username] || 0) + tickets;
    });

    // Sort & Return Top 5 Buyers
    return Object.entries(buyerStats)
      .sort((a, b) => b[1] - a[1]) // Sort in descending order
      .slice(0, 5) // Get Top 5
      .map(([username, tickets]) => ({ username, tickets }));
  } catch (error) {
    console.error("❌ Error fetching top buyers:", error);
    return [];
  }
}

// **🔹 Send Steem Payment (Newly Added)**
export async function sendSteemPayment(username, amount, memo) {
  try {
    console.log(`✅ Sending ${amount} STEEM to ${username} with memo: ${memo}`);
    // 🚀 Add Steemit transaction logic here.
    // Placeholder return for now:
    return { success: true, message: "Payment sent" };
  } catch (error) {
    console.error("❌ Error sending Steem payment:", error);
    return { success: false, message: "Payment failed" };
  }
}
