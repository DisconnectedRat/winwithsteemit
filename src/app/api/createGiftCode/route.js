import { NextResponse } from "next/server";
import { firestore } from "@/utils/firebaseAdmin";

export async function POST(request) {
  try {
    const { giver, recipient, reason, ticketCount } = await request.json();

    if (!giver || !recipient || !ticketCount) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Generate code: "GIFT-ABCD"
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `GIFT-${randomPart}`;

    await firestore.collection("giftCodes").doc(code).set({
      giver,
      recipient,
      reason,
      used: false,
      paid: false,
      ticketCount: ticketCount, // store how many tickets
      code,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ code });
  } catch (error) {
    console.error("❌ Error creating gift code:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
