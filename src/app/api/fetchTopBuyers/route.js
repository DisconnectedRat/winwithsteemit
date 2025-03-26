import { firestore } from "@/utils/firebaseAdmin";

export async function GET() {
  try {
    const snapshot = await firestore.collection("purchasedTickets").get();
    const buyerTotals = {};

    snapshot.forEach(doc => {
      const data = doc.data();
      const { username, ticketsBought } = data;

      if (!username || typeof ticketsBought !== "number") return;

      if (buyerTotals[username]) {
        buyerTotals[username] += ticketsBought;
      } else {
        buyerTotals[username] = ticketsBought;
      }
    });

    const sorted = Object.entries(buyerTotals)
      .map(([username, tickets]) => ({ username, tickets }))
      .sort((a, b) => b.tickets - a.tickets)
      .slice(0, 5);

    return Response.json({ topBuyers: sorted });
  } catch (error) {
    console.error("❌ Error in fetchTopBuyers API:", error);
    return new Response("Error fetching top buyers", { status: 500 });
  }
}
