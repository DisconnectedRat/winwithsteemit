import { NextResponse } from "next/server";
import { firestore } from "@/utils/firebaseAdmin";

export async function POST(request) {
  try {
    const { newJackpot } = await request.json();

    // Write to your doc "config" in collection "dailyConfig"
    await firestore
      .collection("dailyConfig")
      .doc("config")
      .update({ jackpot: newJackpot });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error updating jackpot:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

