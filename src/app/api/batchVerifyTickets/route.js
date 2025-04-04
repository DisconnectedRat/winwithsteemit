import { NextResponse } from "next/server";
import { getTodayDateUTC } from "@/utils/dateUtils";
import { fetchSteemitTransactions } from "@/utils/steemAPI";
import { firestore } from "@/utils/firebaseAdmin";

export async function GET() {
  try {
    const todayUTC = getTodayDateUTC();
    const snapshot = await firestore.collection("purchasedTickets")
      .where("timestamp", ">=", `${todayUTC}T00:00:00Z`)
      .where("confirmed", "==", "⏳")
      .get();

    const unconfirmedEntries = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const steemTransfers = await fetchSteemitTransactions();

    const confirmed = [];

    for (const entry of unconfirmedEntries) {
      const match = steemTransfers.find(tx =>
        tx.memo.includes(entry.memo) && tx.amount === 5 && tx.to === "winwithsteemit"
      );

      if (match) {
        await firestore.collection("purchasedTickets").doc(entry.id).update({
          confirmed: "✅"
        });
        confirmed.push(entry.username);
      }
    }

    return NextResponse.json({ success: true, confirmed });
  } catch (error) {
    console.error("Batch verification failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
