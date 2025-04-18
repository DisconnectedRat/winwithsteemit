import { firestore } from "@/utils/firebaseAdmin";

export async function POST(req) {
  try {
    const { username, tickets, memo, timestamp, promoCode } = await req.json();

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

    const ticketNumbers = tickets.join(", ");
    const ticketsBought = tickets.length;
    let isValid = false;

    // ✅ Promo Code Flow
    if (promoCode) {
      // Step 1: Validate against promoCode collection
      const promoSnap = await firestore
        .collection("promoCode")
        .where("username", "==", username)
        .where("memo", "==", promoCode)
        .limit(1)
        .get();

      if (promoSnap.empty) {
        return new Response(
          JSON.stringify({ success: false, error: "Promo Code Invalid" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }

      // Step 2: Enforce 1 ticket rule
      if (tickets.length !== 1) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Promo code is valid for 1 free ticket only.",
          }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }

      // Step 3: Check for duplicate use
      const existingPromoTicket = await firestore
        .collection("purchasedTickets")
        .where("username", "==", username)
        .where("memo", "==", promoCode)
        .limit(1)
        .get();

      if (!existingPromoTicket.empty) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Promo code already used by this user.",
          }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }

      isValid = true; // ✅ Accept as free + valid
    }

    // ✅ Store in Firestore
    const docRef = await firestore.collection("purchasedTickets").add({
      username,
      tickets,
      ticketNumbers,
      ticketsBought,
      memo,
      timestamp,
      isValid,
    });

    // ✅ Update or create Top Buy Accumulator
      const statRef = firestore.collection("topBuyerStats").doc(username);
        await firestore.runTransaction(async (tx) => {
          const snap = await tx.get(statRef);
        if (!snap.exists) {
            tx.set(statRef, {
            username,
            totalTickets: ticketsBought,
            lastUpdated: timestamp,
          });
        } else {
      const current = snap.data().totalTickets || 0;
          tx.update(statRef, {
            totalTickets: current + ticketsBought,
            lastUpdated: timestamp,
          });
        }
      });

    return NextResponse.json({ success: true, docId: docRef.id });

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
