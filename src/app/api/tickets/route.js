import { firestore } from "@/utils/firebaseAdmin";

export async function GET(request) {
  try {
    // Fetch all purchased ticket documents from Firestore
    const snapshot = await firestore.collection("purchasedTickets").get();
    let tickets = [];
    snapshot.forEach((doc) => {
      // Each document is expected to have at least a 'timestamp' field (as an ISO string)
      tickets.push(doc.data());
    });

    const now = new Date();
    // Define the current UTC day's start and end
    const startOfTodayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const endOfTodayUTC = new Date(startOfTodayUTC.getTime() + 24 * 60 * 60 * 1000);

    // Filter tickets for the current 24-hour window
    const todaysTickets = tickets.filter((ticket) => {
      const ticketTime = new Date(ticket.timestamp);
      return ticketTime >= startOfTodayUTC && ticketTime < endOfTodayUTC;
    });

    // Cleanup: Remove tickets older than 3 days
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    // Prepare a batch for deletion
    const batch = firestore.batch();
    snapshot.forEach((doc) => {
      const data = doc.data();
      const ticketTime = new Date(data.timestamp);
      if (ticketTime < threeDaysAgo) {
        batch.delete(doc.ref);
      }
    });
    await batch.commit();

    return new Response(JSON.stringify(todaysTickets), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error fetching stored tickets:", error);
    return new Response(JSON.stringify({ error: "Error fetching stored tickets" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
