import { firestore } from "@/utils/firebaseAdmin";

export async function POST(req) {
  try {
    const { username, tickets, memo, timestamp } = await req.json();

    // ✅ Validate input
    if (!username || !tickets || tickets.length === 0 || !memo) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid data" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // ✅ Prepare data
    const ticketNumbers = tickets.join(", ");
    const ticketsBought = tickets.length;

    // ✅ Store data in Firestore with isValid: false
    const docRef = await firestore.collection("purchasedTickets").add({
      username,
      tickets,
      ticketNumbers,
      ticketsBought,
      memo,
      timestamp,
      isValid: false, // 🚨 Ensures ticket will be verified later
    });

    // ✅ Return success response
    return new Response(
      JSON.stringify({ success: true, docId: docRef.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error in storeTicket:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
