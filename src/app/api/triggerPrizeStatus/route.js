import { firestore } from "@/utils/firebaseAdmin";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  if (!date) {
    return new Response(JSON.stringify({ error: "Missing date" }), { status: 400 });
  }

  try {
    const snapshot = await firestore
      .collection("prizeRuns")
      .where("runDate", "==", date)
      .limit(1)
      .get();

    const alreadyTriggered = !snapshot.empty;

    return new Response(
      JSON.stringify({
        date,
        alreadyTriggered,
        shouldTrigger: !alreadyTriggered,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("🔥 Error in triggerPrizeStatus:", error);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
