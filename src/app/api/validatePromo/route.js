import { firestore } from "@/utils/firebaseAdmin";

export async function POST(req) {
  try {
    const { username, promoCode } = await req.json();

    if (!username || !promoCode) {
      return new Response(JSON.stringify({ valid: false }), { status: 400 });
    }

    const snapshot = await firestore
      .collection("promoCode")
      .where("username", "==", username)
      .where("memo", "==", promoCode)
      .limit(1)
      .get();

    const valid = !snapshot.empty;

    return new Response(JSON.stringify({ valid }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error validating promo code:", error);
    return new Response(JSON.stringify({ valid: false }), { status: 500 });
  }
}
