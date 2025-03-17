import axios from "axios";

// ✅ New Working APIs
const PRIMARY_API = "https://api.steemit.com"; // Official Steemit API
const BACKUP_API = "https://api.justyy.workers.dev/api/steemit/transfer-history";
const LOTTERY_ACCOUNT = "winwithsteemit"; // The official lottery account

// **🔹 Fetch Latest Transactions using Steemit API**
export async function fetchSteemTransactions(account = LOTTERY_ACCOUNT, limit = 50) {
  try {
    console.log(`🔄 Fetching latest ${limit} transactions from ${PRIMARY_API}...`);

    const response = await axios.post(PRIMARY_API, {
      jsonrpc: "2.0",
      method: "condenser_api.get_account_history",
      params: [account, -1, limit], // Fetch last 'limit' transactions
      id: 1,
    });

    const transactions = response.data.result;

    if (!transactions || transactions.length === 0) {
      console.warn("⚠️ No transactions found. Trying backup API...");
      return await fetchSteemTransactionsBackup(); // Use backup API if first one fails
    }

    // ✅ Filter only "transfer" transactions with valid lottery memo
    return transactions
      .map(([_, tx]) => tx)
      .filter((tx) => tx.op[0] === "transfer") // Keep only transfers
      .map((tx) => {
        const { from, to, amount, memo } = tx.op[1];

        if (to === LOTTERY_ACCOUNT && memo.startsWith("Lottery")) {
          return {
            username: from,
            tickets: parseFloat(amount.split(" ")[0]), // STEEM amount = tickets
            memo,
          };
        }
        return null;
      })
      .filter((entry) => entry !== null); // Remove null values

  } catch (error) {
    console.error("❌ Error fetching transactions:", error);
    return [];
  }
}

// **🔹 Backup API (Alternative Source)**
async function fetchSteemTransactionsBackup() {
  try {
    console.log(`🔄 Fetching transactions from backup API ${BACKUP_API}...`);
    
    const response = await axios.get(`${BACKUP_API}/${LOTTERY_ACCOUNT}`);

    if (!response.data || !Array.isArray(response.data)) {
      console.error("❌ Backup API did not return a valid transaction list.");
      return [];
    }

    return response.data
      .filter((tx) => tx.memo && tx.memo.startsWith("Lottery")) // Ensure valid memo
      .map((tx) => ({
        username: tx.from,
        tickets: parseInt(tx.amount),
        memo: tx.memo,
      }));
  } catch (error) {
    console.error("❌ Error fetching transactions from backup:", error);
    return [];
  }
}

// **🔹 Fetch & Calculate Top Buyers**
export async function fetchTopBuyers() {
  try {
    const transactions = await fetchSteemTransactions();
    const buyerStats = {};

    transactions.forEach(({ username, tickets }) => {
      buyerStats[username] = (buyerStats[username] || 0) + tickets;
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

// **🔹 Send Steem Payment (Newly Added)**
export async function sendSteemPayment(username, amount, memo) {
  try {
    console.log(`✅ Sending ${amount} STEEM to ${username} with memo: ${memo}`);
    
    // 🚀 Add Steemit transaction logic here
    // This would typically involve using a Steem library like steem.js or SteemConnect API.
    // Placeholder return for now:

    return { success: true, message: "Payment sent" };
  } catch (error) {
    console.error("❌ Error sending Steem payment:", error);
    return { success: false, message: "Payment failed" };
  }
}
