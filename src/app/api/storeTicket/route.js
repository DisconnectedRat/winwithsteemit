import { firestore } from "@/utils/firebaseAdmin";

export async function POST(request) {
  try {
    // Parse the JSON body from the client
    const ticketData = await request.json();
    console.log("Received ticketData:", ticketData); // Debug: log the raw payload
    
    // Destructure required fields from the payload
    const { username, tickets, memo, timestamp } = ticketData;
    
    // Validate required fields
    if (!username || !tickets || !memo || !timestamp) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Ensure tickets is an array
    const ticketArray = Array.isArray(tickets) ? tickets : [tickets];

    // Format the data
    const formattedTicketData = {
      username,
      ticketsBought: ticketArray.length,
      ticketNumbers: ticketArray.join(", "),
      memo,
      timestamp,
    };
    
    // Write the formatted ticket data to Firestore in the "purchasedTickets" collection
    await firestore.collection("purchasedTickets").add(formattedTicketData);
    console.log("Ticket stored successfully in Firestore:", formattedTicketData);
    
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
