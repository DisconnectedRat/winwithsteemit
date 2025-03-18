// src/app/api/fetchSteemTransactions/route.js
import axios from "axios";

export async function GET(request) {
  try {
    const PRIMARY_API = "https://api.steemit.com";
    const LOTTERY_ACCOUNT = "winwithsteemit";
    const limit = 20;

    console.log(`🔄 [API] Fetching latest ${limit} transactions for ${LOTTERY_ACCOUNT}...`);

    const response = await axios.post(PRIMARY_API, {
      jsonrpc: "2.0",
      method: "condenser_api.get_account_history",
      params: [LOTTERY_ACCOUNT, -1, limit],
      id: 1,
    });

    const transactions = response.data.result;

    if (!transactions || transactions.length === 0) {
      console.warn("⚠️ [API] No transactions found.");
      return new Response(JSON.stringify({ success: true, transactions: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Filter only "transfer" transactions with valid lottery memo
    const filteredTransactions = transactions
      .map(([_, tx]) => tx)
      .filter((tx) => tx.op[0] === "transfer")
      .map((tx) => {
        const { from, to, amount, memo } = tx.op[1];
        const isValidMemo = /^Lottery\s\d+$/.test(memo);
        if (to === LOTTERY_ACCOUNT && isValidMemo) {
          return {
            username: from,
            tickets: parseFloat(amount.split(" ")[0]),
            memo,
          };
        }
        return null;
      })
      .filter((entry) => entry !== null);

    return new Response(JSON.stringify({ success: true, transactions: filteredTransactions }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ [API] Error fetching transactions:", error);
    return new Response(JSON.stringify({ success: false, transactions: [] }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
