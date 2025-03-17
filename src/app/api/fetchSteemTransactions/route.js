import { fetchSteemTransactions } from "@/utils/steemAPI";

export async function GET() {
  try {
    const transactions = await fetchSteemTransactions();
    
    return Response.json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error("❌ Error fetching Steem transactions:", error);
    return Response.json({ success: false, error: "Error fetching transactions" }, { status: 500 });
  }
}
