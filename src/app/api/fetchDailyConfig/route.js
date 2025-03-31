import { firestore } from "@/utils/firebaseAdmin";

export async function GET() {
  try {
    const docRef = firestore.collection("dailyConfig").doc("config");
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return new Response(JSON.stringify({ error: "No config found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const config = snapshot.data();
    return new Response(JSON.stringify(config), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error fetching daily config:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch config" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
