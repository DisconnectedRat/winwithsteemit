import { NextResponse } from "next/server";
import { firestore } from "@/utils/firebaseAdmin";

// Example: using Steem API via `steem-js` or raw fetch (adjust as needed)
const STEEM_API_URL = "https://api.steemit.com";

export async function POST(req) {
  try {
    const { username, memo } = await req.json();
    if (!username || !memo) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    // Step 1: Fetch recent transactions to @winwithsteemit
    const result = await fetch(STEEM_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: 1,
        jsonrpc: "2.0",
        method: "condenser_api.get_account_history",
        params: [username, -1, 100], // last 100 txns
      }),
    });

    const { result: history } = await result.json();

    // Step 2: Scan for payment to @winwithsteemit with matching memo
    const match = history.find(([, tx]) => {
      return (
        tx.op[0] === "transfer" &&
        tx.op[1].to === "winwithsteemit" &&
        tx.op[1].memo === memo
      );
    });

    if (match) {
      // Step 3: Update the document in Firestore
      const snapshot = await firestore
        .collection("purchasedTickets")
        .where("username", "==", username)
        .where("memo", "==", memo)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;
        await docRef.update({ isValid: true });

        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json({ success: false, error: "No matching payment found." });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
