import { NextResponse } from "next/server";
import { firestore } from "@/utils/firebaseAdmin";

const STEEM_API_URL = "https://api.steemit.com";

export async function POST(req) {
  try {
    const { username } = await req.json();
    if (!username) {
      return NextResponse.json({ success: false, error: "Missing username" }, { status: 400 });
    }

    const cleanUsername = username.toLowerCase().replace(/^@/, "");

    // 🔹 Fetch the most recent ticket entry from Firestore for the given username
    const ticketSnapshot = await firestore
      .collection("purchasedTickets")
      .where("username", "==", cleanUsername)
      .orderBy("timestamp", "desc")
      .limit(1)
      .get();

    if (ticketSnapshot.empty) {
      return NextResponse.json({ success: false, error: "No ticket found for this user." });
    }

    const userEntry = ticketSnapshot.docs[0];
    const expectedMemo = userEntry.data().memo;

    // 🔹 Fetch last 100 transactions of the user from Steem blockchain
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

    const steemResponse = await response.json();
    const history = steemResponse.result;

    if (!history || history.length === 0) {
      return NextResponse.json({ success: false, error: "No recent transactions found." });
    }

    // 🔹 Look for a matching transfer with the expected memo
    const match = history.find(([, tx]) => {
      return (
        tx.op[0] === "transfer" &&
        tx.op[1].to === "winwithsteemit" &&
        tx.op[1].memo === expectedMemo
      );
    });

    if (match) {
      await userEntry.ref.update({ isValid: true });
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: "No matching payment found." });
    }
  } catch (error) {
    console.error("❌ Payment verification error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
