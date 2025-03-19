import { firestore } from "@/utils/firebaseAdmin";

export async function POST(request) {
  try {
    // Parse the JSON body from the client
    const ticketData = await request.json();
    
    // Validate required fields
    if (
      !ticketData.username ||
      !ticketData.tickets ||
      !ticketData.memo ||
      !ticketData.timestamp
    ) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Write the ticket data to Firestore in the "purchasedTickets" collection.
    await firestore.collection("purchasedTickets").add(ticketData);
    console.log("Ticket stored successfully in Firestore:", ticketData);
    
    return new Response(
      JSON.stringify({ success: true, message: "Ticket stored successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error storing ticket in Firestore:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
