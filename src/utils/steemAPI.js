import axios from "axios";

// Steem API Endpoint
const STEEM_API = "https://api.steemit.com";
const LOTTERY_ACCOUNT = "winwithsteemit"; // The official lottery account

// ✅ Fetch Latest Transactions
export async function fetchSteemTransactions() {
  try {
    const response = await axios.get("https://api.steemscan.com/getRecentTransactions");
    const transactions = response.data;

    if (!transactions || transactions.length === 0) {
      console.warn("⚠ No transactions found.");
      return [];
    }

    return transactions
      .filter((tx) => 
        tx.to === LOTTERY_ACCOUNT && 
        tx.memo.startsWith("Lottery") // ✅ Only process memos starting with "Lottery"
      )
      .map((tx) => ({
        username: tx.from,
        tickets: parseFloat(tx.amount.split(" ")[0]), // Extract ticket count from STEEM amount
        memo: tx.memo, // Store memo for reference
      }));
  } catch (error) {
    console.error("❌ Error fetching transactions:", error);
    return [];
  }
}

// ✅ Process Transactions to Validate Entries
export function processTransactions(transactions) {
  const validEntries = [];

  transactions.forEach((tx) => {
    const { username, tickets, memo } = tx;

    // ✅ Validate Memo Format: Ensure it's encrypted correctly (e.g., "Lottery 547 x2 x20250314")
    const isValidMemo = memo.match(/^Lottery \d{3} x\d+ x\d{8}$/);

    if (tickets > 0 && isValidMemo) {
      validEntries.push({ username, tickets, memo });
    }
  });

  return validEntries;
}

// ✅ Fetch & Calculate Top Buyers
export async function fetchTopBuyers() {
  try {
    const transactions = await fetchSteemTransactions();
    const buyerStats = {};

    transactions.forEach(({ username, tickets }) => {
      if (!buyerStats[username]) {
        buyerStats[username] = 0;
      }
      buyerStats[username] += tickets;
    });

    // ✅ Sort & Return Top 5 Buyers
    return Object.entries(buyerStats)
      .sort((a, b) => b[1] - a[1]) // Sort in descending order
      .slice(0, 5) // Get Top 5
      .map(([username, tickets]) => ({ username, tickets }));
  } catch (error) {
    console.error("❌ Error fetching top buyers:", error);
    return [];
  }
}
