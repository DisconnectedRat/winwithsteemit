// src/app/api/yesterdayWinners/route.js
import { firestore } from "@/utils/firebaseAdmin";

export async function GET() {
  try {
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yDateString = yesterday.toISOString().split("T")[0];

    const snapshot = await firestore
      .collection("pastWinners")
      .where("date", "==", yDateString)
      .get();

    const winners = [];
    snapshot.forEach((doc) => {
      winners.push(doc.data());
    });

    return new Response(JSON.stringify(winners), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error fetching yesterday's winners:", error);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
