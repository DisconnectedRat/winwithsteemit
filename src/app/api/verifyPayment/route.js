import { NextResponse } from "next/server";
import { firestore } from "@/utils/firebaseAdmin";

const STEEMWORLD_ENDPOINT = "https://sds.steemworld.org/transfers_api/getTransfersByTypeTo/transfer/winwithsteemit";

export async function GET() {
  return NextResponse.json({ message: "This endpoint expects a POST with { username }." });
}

export async function POST(req) {
  try {
    const { username } = await req.json();
    if (!username) {
      console.warn("❌ Username missing from request");
      return NextResponse.json({ success: false, error: "Missing username" }, { status: 400 });
    }

    const cleanUsername = username.toLowerCase().replace(/^@/, "");
    console.log("🔍 Verifying payment via SteemWorld SDS for:", cleanUsername);

    // 1) Fetch Firestore doc for user's expected memo
    const ticketSnapshot = await firestore
      .collection("purchasedTickets")
      .where("username", "==", cleanUsername)
      .orderBy("timestamp", "desc")
      .limit(1)
      .get();

    if (ticketSnapshot.empty) {
      console.warn("❌ No ticket found in Firestore for", cleanUsername);
      return NextResponse.json({ success: false, error: "No ticket found for this user. Please Submit Entry & Retry again." });
    }

    const userEntry = ticketSnapshot.docs[0];
    const expectedMemo = userEntry.data().memo || "";
    console.log("🎯 Expected memo:", expectedMemo);

    // 2) Fetch the last 10 transfers from SDS
    // We'll use '?offset=0&limit=10&order=desc...' to limit results
    const limit = 10; // or 20 if you prefer
    const url = `${STEEMWORLD_ENDPOINT}?offset=0&limit=${limit}&order=desc&group_by=false&group_by_invert=false`;

    console.log("🔄 [Server] Checking last", limit, "transfers from SteemWorld for memo match...");

    const response = await fetch(url, { method: "GET" });
    if (!response.ok) {
      console.error("❌ Failed to fetch from SteemWorld SDS:", response.status, response.statusText);
      return NextResponse.json({ success: false, error: "SteemWorld SDS request failed" }, { status: 500 });
    }

    // The actual shape is:
    // { code: 0, result: { cols: {...}, rows: [...] } }
    const data = await response.json();
    if (!data || !data.result || !data.result.rows) {
      console.warn("⚠️ Invalid response shape from SteemWorld:", data);
      return NextResponse.json(
        { success: false, error: "Invalid SteemWorld response" },
        { status: 500 }
      );
    }

    // 3) Convert rows => array of { time, from, to, amount, memo }
    const { cols, rows } = data.result;
    const transfers = rows.map((row) => ({
      time: row[cols.time],
      from: row[cols.from],
      to: row[cols.to],
      amount: row[cols.amount],
      unit: row[cols.unit],
      memo: (row[cols.memo] || "").trim(),
    }));
    
    // 3) Look for a matching transaction
    const match = transfers.find((tx) => {
      // Adjust property names if needed
      const fromUser = (tx.from || "").toLowerCase();
      const toUser = (tx.to || "").toLowerCase();
      const memo = (tx.memo || "").trim();

      return (
        fromUser === cleanUsername &&
        toUser === "winwithsteemit" && 
        memo === expectedMemo
      );
    });

    if (match) {
      // 4) Mark user’s Firestore doc as valid
      await userEntry.ref.update({ isValid: true });
      console.log("✅ Payment matched and user marked as valid");
      // Send Steemit confirmation comment
      await postPurchaseComment(username, tickets);

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
