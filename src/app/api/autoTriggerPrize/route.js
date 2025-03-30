import { distributePrizes } from "@/utils/lotteryData";

export const dynamic = "force-dynamic"; // if needed by Vercel caching

export async function GET() {
  const today = new Date().toISOString().split("T")[0];

  try {
    console.log(`📅 Checking triggerPrizeStatus for ${today}`);

    const res = await fetch(`https://winwithsteemit.com/api/triggerPrizeStatus?date=${today}`);
    const data = await res.json();

    if (!data.shouldTrigger) {
      console.log(`⏸ Prize already distributed for ${today}`);
      return Response.json({ success: false, skipped: true, message: "Already distributed" });
    }

    console.log("✅ Prize is eligible to be distributed. Running distributePrizes...");
    await distributePrizes();

    return Response.json({ success: true, message: "Prize distributed successfully" });

  } catch (error) {
    console.error("❌ Error in autoTriggerPrize:", error);
    return new Response("Failed to auto trigger prize", { status: 500 });
  }
}
