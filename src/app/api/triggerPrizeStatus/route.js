import { firestore } from "@/utils/firebaseAdmin";

// GET /api/triggerPrizeStatus?date=2025-04-05
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  if (!date) {
    return new Response(JSON.stringify({ error: "Missing date" }), {
      status: 400,
    });
  }

  try {
    // 1) We read doc with ID == date (e.g., "2025-04-05")
    //    Instead of searching for runDate == date
    const docRef = firestore.collection("prizeRuns").doc(date);
    const docSnap = await docRef.get();

    // 2) If doc does NOT exist => we have NOT run distribution => shouldTrigger is true
    const shouldTrigger = !docSnap.exists;

    // 3) Return the status
    return new Response(
      JSON.stringify({
        date,
        shouldTrigger,
        message: shouldTrigger
          ? `No distribution log found for ${date}, distribution can proceed.`
          : `Prize distribution already triggered for ${date}.`,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("🔥 Error in triggerPrizeStatus:", error);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
