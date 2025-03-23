import { NextResponse } from "next/server";
import { firestore } from "@/utils/firebaseAdmin";

const STEEM_API_URL = "https://api.steemit.com";

export async function POST(req) {
  try {
    const { username } = await req.json();
    if (!username) {
      console.warn("❌ No username provided");
      return NextResponse.json({ success: false, error: "Missing username" }, { status: 400 });
    }

    const cleanUsername = username.toLowerCase().replace(/^@/, "");
    console.log("🔍 Clean username:", cleanUsername);

    // Step 1: Firestore Query
    const ticketSnapshot = await firestore
      .collection("purchasedTickets")
      .where("username", "==", cleanUsername)
      .orderBy("timestamp", "desc")
      .limit(1)
      .get();

    if (ticketSnapshot.empty) {
      console.warn("❌ No ticket found in Firestore");
      return NextResponse.json({ success: false, error: "No ticket found for this user." });
    }

    const userEntry = ticketSnapshot.docs[0];
    const expectedMemo = userEntry.data().memo;
    console.log("🎫 Expected memo from Firestore:", expectedMemo);

    // Step 2: Steemit API Request
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
      console.error("❌ STEEM API failed:", response.statusText);
      return NextResponse.json({ success: false, error: "STEEM API error" }, { status: 500 });
    }

    const steemResponse = await response.json();
    const history = steemResponse.result;

    if (!history || history.length === 0) {
      console.warn("⚠️ No recent STEEM transactions found");
      return NextResponse.json({ success: false, error: "No recent transactions found." });
    }

    // Step 3: Look for match
    const match = history.find(([, tx]) => {
      return (
        tx.op[0] === "transfer" &&
        tx.op[1].to === "winwithsteemit" &&
        tx.op[1].memo === expectedMemo
      );
    });

    if (match) {
      console.log("✅ Matching transaction found! Updating Firestore...");
      await userEntry.ref.update({ isValid: true });
      return NextResponse.json({ success: true });
    } else {
      console.warn("❌ No matching payment found");
      return NextResponse.json({ success: false, error: "No matching payment found." });
    }
  } catch (error) {
    console.error("❌ Payment verification error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
