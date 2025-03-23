import { NextResponse } from "next/server";
import { firestore } from "@/utils/firebaseAdmin";

const STEEM_API_URL = "https://api.steemit.com";

export async function POST(req) {
  try {
    const { username } = await req.json();
    if (!username) {
      console.warn("❌ Username missing from request");
      return NextResponse.json({ success: false, error: "Missing username" }, { status: 400 });
    }

    const cleanUsername = username.toLowerCase().replace(/^@/, "");
    console.log("🔍 Verifying payment for:", cleanUsername);

    // Step 1: Fetch latest ticket entry for the user from Firestore
    const ticketSnapshot = await firestore
      .collection("purchasedTickets")
      .where("username", "==", cleanUsername)
      .orderBy("timestamp", "desc")
      .limit(1)
      .get();

    console.log("✅ Firestore fetch done");

    if (ticketSnapshot.empty) {
      console.warn("❌ No ticket found in Firestore for", cleanUsername);
      return NextResponse.json({ success: false, error: "No ticket found for this user." });
    }

    const userEntry = ticketSnapshot.docs[0];
    const expectedMemo = userEntry.data().memo;
    console.log("🎯 Expected memo:", expectedMemo);

    // Step 2: Fetch latest 20 transactions TO winwithsteemit
    const response = await fetch(STEEM_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: 1,
        jsonrpc: "2.0",
        method: "condenser_api.get_account_history",
        params: ["winwithsteemit", -1, 20], // use lottery account!
      }),
    });

    if (!response.ok) {
      console.error("❌ STEEM API returned non-200 status:", response.status);
      return NextResponse.json({ success: false, error: "STEEM API error" }, { status: 502 });
    }

    const steemResponse = await response.json();
    const history = steemResponse.result;

    console.log("🔎 Raw STEEM API response:", JSON.stringify(steemResponse, null, 2));

    if (!history || !Array.isArray(history)) {
      console.error("❌ Invalid STEEM history format:", history);
      return NextResponse.json({ success: false, error: "Invalid STEEM API format" }, { status: 500 });
    }

    console.log("🔍 Searching for matching memo in", history.length, "transactions");

    // Step 3: Match payment by sender, recipient, and memo
    const match = history.find(([, tx]) => {
      return (
        tx.op[0] === "transfer" &&
        tx.op[1].from === cleanUsername &&
        tx.op[1].to === "winwithsteemit" &&
        tx.op[1].memo === expectedMemo
      );
    });

    // Step 4: Update Firestore if found
    if (match) {
      await userEntry.ref.update({ isValid: true });
      console.log("✅ Payment matched and user marked as valid");
      return NextResponse.json({ success: true });
    } else {
      console.warn("❌ No matching payment found for memo:", expectedMemo);
      return NextResponse.json({ success: false, error: "No matching payment found." });
    }
  } catch (error) {
    console.error("🔥 verifyPayment failed:", error.message);
    console.error(error.stack);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
