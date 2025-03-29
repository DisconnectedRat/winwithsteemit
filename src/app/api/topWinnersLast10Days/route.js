import { firestore } from "@/utils/firebaseAdmin";

export async function GET() {
  try {
    const snapshot = await firestore
      .collection("pastWinners")
      .orderBy("date", "desc")
      .get();

    const raw = [];
    snapshot.forEach(doc => raw.push(doc.data()));

    // Group by date & keep the highest winner
    const grouped = {};
    raw.forEach(entry => {
      const { date, username, amount, winningNumber } = entry;
      if (!grouped[date] || amount > grouped[date].amount) {
        grouped[date] = {
          date,
          winner: username,
          amount,
          winningNumber,
        };
      }
    });

    const topWinners = Object.values(grouped)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10); // Only latest 10 days

    return Response.json({ topWinners });
  } catch (error) {
    console.error("❌ Error in /api/topWinnersLast10Days:", error);
    return new Response("Failed to fetch top winners", { status: 500 });
  }
}
