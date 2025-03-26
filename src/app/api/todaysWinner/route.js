import { firestore } from "@/utils/firebaseAdmin";

export async function GET() {
  try {
    const todayUTC = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

    const snapshot = await firestore
      .collection("pastWinners")
      .where("date", "==", todayUTC)
      .get();

    const docs = [];
    snapshot.forEach(doc => docs.push(doc.data()));

    if (docs.length === 0) {
      return Response.json({ winner: null, message: "No winners for today yet." });
    }

    // Find top prize entry
    const topWinner = docs.reduce((best, current) =>
      current.amount > best.amount ? current : best
    );

    return Response.json({
      winner: {
        date: topWinner.date,
        winningNumber: topWinner.winningNumber,
        winner: topWinner.username,
        amount: topWinner.amount,
      },
    });
  } catch (error) {
    console.error("❌ Error in /api/todaysWinner:", error);
    return new Response("Failed to fetch today's winner", { status: 500 });
  }
}
