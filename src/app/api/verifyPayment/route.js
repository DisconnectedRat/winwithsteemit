import { NextResponse } from "next/server";
import { firestore } from "@/utils/firebaseAdmin";
import { postPurchaseComment } from "@/utils/steemitCommentBot";

const STEEMWORLD_ENDPOINT =
  "https://sds.steemworld.org/transfers_api/getTransfersByTypeTo/transfer/winwithsteemit";

export async function GET() {
  return NextResponse.json({
    message: "This endpoint expects a POST with { username }.",
  });
}

export async function POST(req) {
  try {
    const { username } = await req.json();
    if (!username) {
      console.warn("❌ Username missing from request");
      return NextResponse.json(
        { success: false, error: "Missing username" },
        { status: 400 }
      );
    }

    const cleanUsername = username.toLowerCase().replace(/^@/, "");
    console.log("🔍 Verifying payment via SteemWorld SDS for:", cleanUsername);

    // 1) Fetch user's most recent purchase
    const ticketSnapshot = await firestore
      .collection("purchasedTickets")
      .where("username", "==", cleanUsername)
      .orderBy("timestamp", "desc")
      .limit(1)
      .get();

    if (ticketSnapshot.empty) {
      console.warn("❌ No ticket found in Firestore for", cleanUsername);
      return NextResponse.json({
        success: false,
        error:
          "No ticket found for this user. Please submit entry & retry again.",
      });
    }

    const userEntry = ticketSnapshot.docs[0];
    const expectedMemo = userEntry.data().memo || "";
    console.log("🎯 Expected memo:", expectedMemo);

    // 2) Fetch recent transfers
    const url = `${STEEMWORLD_ENDPOINT}?offset=0&limit=10&order=desc&group_by=false&group_by_invert=false`;
    console.log("🔄 Checking recent transfers for memo match...");

    const response = await fetch(url);
    if (!response.ok) {
      console.error(
        "❌ Failed to fetch from SteemWorld SDS:",
        response.status,
        response.statusText
      );
      return NextResponse.json(
        { success: false, error: "SteemWorld SDS request failed" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const rows = data?.result?.rows;
    if (!Array.isArray(rows)) {
      console.warn("⚠️ Invalid response shape from SteemWorld:", data);
      return NextResponse.json(
        { success: false, error: "Invalid SteemWorld response" },
        { status: 500 }
      );
    }

    // 3) Map rows into objects
    const { cols } = data.result;
    const transfers = rows.map((row) => ({
      from: row[cols.from]?.toLowerCase(),
      to: row[cols.to]?.toLowerCase(),
      memo: (row[cols.memo] || "").trim(),
    }));

    // 4) Look for the matching transfer
    const match = transfers.find(
      (tx) =>
        tx.from === cleanUsername &&
        tx.to === "winwithsteemit" &&
        tx.memo === expectedMemo
    );

    if (match) {
      // — mark valid + commented
      await userEntry.ref.update({
        isValid: true,
        commented: true,
        paidAt: new Date().toISOString(),
      });

      // — grab fresh data
      const { username: user, tickets } = userEntry.data();
      console.log("📨 Posting purchase comment for", user, tickets);

      // — post the Steemit comment
      const commentResult = await postPurchaseComment(user, tickets || []);
      console.log("🧾 Purchase comment result:", commentResult);

      return NextResponse.json({ success: true });
    } else {
      console.warn("❌ No matching payment found for memo:", expectedMemo);
      return NextResponse.json({
        success: false,
        error: "No matching payment found.",
      });
    }
  } catch (error) {
    console.error("🔥 verifyPayment failed:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
