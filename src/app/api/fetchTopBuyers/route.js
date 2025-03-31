import { firestore } from "@/utils/firebaseAdmin";

export async function GET() {
  try {
    const snapshot = await firestore.collection("topBuyerStats").get();

    const stats = [];
    snapshot.forEach((doc) => {
      stats.push({ username: doc.id, totalTickets: doc.data().totalTickets });
    });

    // Sort in descending order of totalTickets
    stats.sort((a, b) => b.totalTickets - a.totalTickets);

    return new Response(JSON.stringify({ topBuyerStats: stats }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Failed to fetch top buy stats:", error);
    return new Response(JSON.stringify({ topBuyerStats: [] }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
