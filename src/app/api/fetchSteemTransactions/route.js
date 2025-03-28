// src/app/api/fetchSteemTransactions/route.js
import axios from "axios";

const STEEMWORLD_ENDPOINT = "https://sds.steemworld.org/transfers_api/getTransfersByTypeTo/transfer/winwithsteemit";

export async function GET(request) {
  try {
    console.log("🔄 [Server] Fetching last 10 transfers from SteemWorld for @winwithsteemit...");

    const url = `${STEEMWORLD_ENDPOINT}?offset=0&limit=10&order=desc&group_by=false&group_by_invert=false`;

    const response = await axios.get(url);

    // Let's assume it returns an object with a `result` array:
    if (!response.data || !response.data.result) {
      console.warn("⚠️ No result found in SteemWorld response:", response.data);
      return new Response(JSON.stringify({ success: true, transactions: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const rawTransfers = response.data.result;

    // Filter or parse as needed
    const filteredTransfers = rawTransfers.map((tx) => ({
      // Adjust field names as found in the real data
      from: tx.from,
      to: tx.to,
      amount: tx.amount,
      memo: tx.memo?.trim() || "",
      timestamp: tx.timestamp,
      // Possibly more fields, e.g. block_num, tx_id, etc.
    }));

    console.log(`✅ Fetched ${filteredTransfers.length} transfers from SteemWorld SDS.`);
    
    return new Response(
      JSON.stringify({ success: true, transactions: filteredTransfers }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Error fetching last 10 transfers from SteemWorld:", error);
    return new Response(JSON.stringify({ success: false, transactions: [] }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
