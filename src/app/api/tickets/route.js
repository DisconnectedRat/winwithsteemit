import { NextResponse } from "next/server";
import { firestore } from "@/utils/firebaseAdmin";

const STEEM_API_URL = "https://api.steemit.com";

const isWithinLast3Days = (timestamp) => {
  const ticketDate = new Date(timestamp);
  const now = new Date();
  const diffTime = now.getTime() - ticketDate.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays <= 3;
};

export async function POST(req) {
  try {
    const { username, memo } = await req.json();
    if (!username || !memo) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    const result = await fetch(STEEM_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: 1,
        jsonrpc: "2.0",
        method: "condenser_api.get_account_history",
        params: [username, -1, 100],
      }),
    });

    const { result: history } = await result.json();

    const match = history.find(([, tx]) => {
      return (
        tx.op[0] === "transfer" &&
        tx.op[1].to === "winwithsteemit" &&
        tx.op[1].memo === memo
      );
    });

    if (match) {
      const snapshot = await firestore
        .collection("purchasedTickets")
        .where("username", "==", username)
        .where("memo", "==", memo)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const docRef = doc.ref;
        const ticketData = doc.data();

        if (!isWithinLast3Days(ticketData.timestamp)) {
          await docRef.update({ isValid: false, expired: true });
          return NextResponse.json({ success: false, error: "Ticket expired (older than 3 days)." });
        }

        await docRef.update({ isValid: true });
        return NextResponse.json({ success: true, message: "Ticket validated." });
      }
    }

    return NextResponse.json({ success: false, error: "No matching payment found." });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// ✅ UPDATED: Simplified GET method with timestamp normalization
export async function GET(req) {
  try {
    const snapshot = await firestore
      .collection("purchasedTickets")
      .where("isValid", "==", true)
      .get();

    const tickets = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate?.() ?? data.timestamp, // Normalize Firestore Timestamp
      };
    });

    console.log("🎯 Raw tickets from Firestore:", tickets);

    return NextResponse.json({ success: true, tickets });
  } catch (error) {
    console.error("GET /api/tickets error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
