import axios from "axios";

// Steem API Endpoint
const STEEM_API = "https://api.steemit.com";

// Function to fetch latest transactions

export async function fetchSteemTransactions() {
  try {
    const response = await axios.get("https://api.steemscan.com/getRecentTransactions");
    const transactions = response.data;

    return transactions
      .filter((tx) => tx.memo.startsWith("Lottery")) // ✅ Only valid memos
      .map((tx) => ({
        username: tx.from,
        tickets: parseInt(tx.amount), // STEEM amount = tickets
        memo: tx.memo,
      }));
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}

// **Processing Transactions**
function processTransactions(transactions) {
  const validEntries = [];

  transactions.forEach(([_, tx]) => {
    const { op } = tx;
    if (op[0] === "transfer") {
      const { from, to, amount, memo } = op[1];

      // ✅ Ensure transaction is TO the correct account
      if (to === "winwithsteemit") {
        const steemAmount = parseFloat(amount.split(" ")[0]); // Extract STEEM amount
        const isValidMemo = /^\d{9}$/.test(memo); // Check if memo is correctly encrypted

        // ✅ Register valid lottery entry
        if (steemAmount > 0 && isValidMemo) {
          validEntries.push({ username: from, tickets: steemAmount, memo });
        }
      }
    }
  });

  return validEntries;
}

// Function to fetch and calculate top buyers
export async function fetchTopBuyers() {
  try {
    const transactions = await fetchSteemTransactions(); // Reuse transaction fetching logic
    const buyerStats = {};

    // Process each transaction
    transactions.forEach(({ username, tickets }) => {
      if (!buyerStats[username]) {
        buyerStats[username] = 0;
      }
      buyerStats[username] += tickets;
    });

    // Sort buyers by total tickets purchased
    const sortedBuyers = Object.entries(buyerStats)
      .sort((a, b) => b[1] - a[1]) // Sort in descending order
      .slice(0, 5) // Get the top 5 buyers
      .map(([username, tickets]) => ({ username, tickets }));

    return sortedBuyers;
  } catch (error) {
    console.error("Error fetching top buyers:", error);
    return [];
  }
}
