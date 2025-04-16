import { NextResponse } from "next/server";
import { firestore } from "@/utils/firebaseAdmin";

export async function POST(request) {
  try {
    const { giftCode, username, tickets } = await request.json();

    if (!giftCode || !username || !Array.isArray(tickets) || tickets.length === 0) {
      return NextResponse.json({ error: "Invalid request data." }, { status: 400 });
    }

    const docRef = firestore.collection("giftCodes").doc(giftCode);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Gift code not found." }, { status: 404 });
    }

    const codeData = docSnap.data();

    if (!codeData.paid) {
      return NextResponse.json({ error: "Gift code is not paid yet." }, { status: 400 });
    }
    if (codeData.used) {
      return NextResponse.json({ error: "Gift code already used." }, { status: 400 });
    }

    // Single redemption approach:
    if (tickets.length !== codeData.ticketCount) {
      return NextResponse.json({
        error: `You must pick exactly ${codeData.ticketCount} ticket(s).`,
      }, { status: 400 });
    }

    // 4) Create the purchasedTickets doc
    await firestore.collection("purchasedTickets").add({
      username,
      tickets,        // array of strings
      isValid: true,  // skip payment
      giftCode,
      timestamp: new Date().toISOString(),
    });

    // 5) Mark code as used
    await docRef.update({
      used: true,
      redeemedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Gift code redeemed successfully! Enjoy your ${tickets.length} ticket(s).`,
    });
  } catch (error) {
    console.error("❌ Error redeeming gift code:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
