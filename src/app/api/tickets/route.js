import { NextResponse } from "next/server";
import { firestore } from "@/utils/firebaseAdmin";

// Steemit API endpoint
const STEEM_API_URL = "https://api.steemit.com";

// Utility to check if a timestamp is within the last 3 days
const isWithinLast3Days = (timestamp) => {
  const ticketDate = new Date(timestamp);
  const now = new Date();
  const diffTime = now.getTime() - ticketDate.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays <= 3;
};

// Utility to check if timestamp is from today
const isToday = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
};

// 📌 POST Method: Payment verification and ticket validation
export async function POST(req) {
  try {
    const { username, memo } = await req.json();
    if (!username || !memo) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    // Step 1: Fetch recent transactions
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

    // Step 2: Match payment
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

        // ⛔ Reject if older than 3 days
        if (!isWithinLast3Days(ticketData.timestamp)) {
          await docRef.update({ isValid: false, expired: true });
          return NextResponse.json({ success: false, error: "Ticket expired (older than 3 days)." });
        }

        // ✅ Mark valid
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

// 📌 GET Method: Return valid tickets (with optional filter for today only)
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const todayOnly = url.searchParams.get("today") === "true";

    const snapshot = await firestore
      .collection("purchasedTickets")
      .where("isValid", "==", true)
      .get();

    let validTickets = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter to today's entries only if requested
    if (todayOnly) {
      validTickets = validTickets.filter((ticket) => isToday(ticket.timestamp));
    }

    return NextResponse.json({ success: true, tickets: validTickets });
  } catch (error) {
    console.error("GET /api/tickets error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
