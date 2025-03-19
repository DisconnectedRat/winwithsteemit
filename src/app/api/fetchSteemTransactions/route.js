import axios from "axios";

const PRIMARY_API = "https://api.steemit.com"; // Official Steemit API
const LOTTERY_ACCOUNT = "winwithsteemit"; // The official lottery account

export async function GET(request) {
  try {
    console.log(`🔄 [Server] Fetching latest transactions from ${PRIMARY_API} for ${LOTTERY_ACCOUNT}...`);
    const limit = 5; // Reduced fetch limit
    const response = await axios.post(PRIMARY_API, {
      jsonrpc: "2.0",
      method: "condenser_api.get_account_history",
      params: [LOTTERY_ACCOUNT, -1, limit],
      id: 1,
    });

    const transactions = response.data.result;
    
    // Log the timestamp of the latest transaction (if exists)
    console.log("Latest transaction timestamp:", transactions[0]?.timestamp);

    if (!transactions || transactions.length === 0) {
      console.warn("⚠️ [Server] No transactions found.");
      return new Response(JSON.stringify({ success: true, transactions: [] }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      });
    }

    // Filter only "transfer" transactions with valid lottery memo, including timestamp
    const filteredTransactions = transactions
      .map(([_, tx]) => tx)
      .filter((tx) => tx.op[0] === "transfer")
      .map((tx) => {
        const { from, to, amount, memo } = tx.op[1];
        const timestamp = tx.timestamp; // Assuming this is an ISO string
        const cleanedMemo = memo.trim();
        const isValidMemo = /^Lottery\s\d+$/.test(cleanedMemo);
        if (to === LOTTERY_ACCOUNT && isValidMemo) {
          return {
            username: from,
            tickets: parseFloat(amount.split(" ")[0]),
            memo: cleanedMemo,
            timestamp, // include timestamp for further processing if needed
          };
        }
        return null;
      })
      .filter((entry) => entry !== null);

    return new Response(JSON.stringify({ success: true, transactions: filteredTransactions }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("❌ [Server] Error fetching transactions:", error);
    return new Response(JSON.stringify({ success: false, transactions: [] }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  }
}
