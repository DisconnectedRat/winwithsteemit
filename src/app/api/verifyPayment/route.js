import { NextResponse } from "next/server";
import { firestore } from "@/utils/firebaseAdmin";

const STEEM_API_URL = "https://api.steemit.com";

export async function POST(req) {
  try {
    console.log("✅ verifyPayment route hit");

    const cleanUsername = "disconnect"; // hardcoded
    console.log("🔍 Using test username:", cleanUsername);

    const ticketSnapshot = await firestore
      .collection("purchasedTickets")
      .where("username", "==", cleanUsername)
      .orderBy("timestamp", "desc")
      .limit(1)
      .get();

    if (ticketSnapshot.empty) {
      console.warn("❌ No ticket found in Firestore");
      return NextResponse.json({ success: false, error: "No ticket found." });
    }

    const userEntry = ticketSnapshot.docs[0];
    const expectedMemo = userEntry.data().memo;

    console.log("🧾 Fetched memo from Firestore:", expectedMemo);

    const response = await fetch(STEEM_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: 1,
        jsonrpc: "2.0",
        method: "condenser_api.get_account_history",
        params: [cleanUsername, -1, 100],
      }),
    });

    if (!response.ok) {
      console.error("❌ Steem API request failed", response.status);
      return NextResponse.json({ success: false, error: "STEEM API error" });
    }

    const steemResponse = await response.json();
    console.log("🔁 STEEM API response received");

    const history = steemResponse.result;
    if (!history || history.length === 0) {
      return NextResponse.json({ success: false, error: "No recent transactions" });
    }

    const match = history.find(([, tx]) => {
      return (
        tx.op[0] === "transfer" &&
        tx.op[1].to === "winwithsteemit" &&
        tx.op[1].memo === expectedMemo
      );
    });

    if (match) {
      console.log("🎯 Match found! Memo verified. Updating Firestore...");
      await userEntry.ref.update({ isValid: true });
      return NextResponse.json({ success: true });
    } else {
      console.warn("❌ Memo not found in transactions");
      return NextResponse.json({ success: false, error: "No matching memo" });
    }
  } catch (err) {
    console.error("❌ Hardcoded test error:", err);
    return NextResponse.json({ success: false, error: "Server error in hardcoded test" }, { status: 500 });
  }
}
