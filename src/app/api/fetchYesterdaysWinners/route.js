import { NextResponse } from "next/server";
import { fetchPastWinners } from "@/utils/lotteryData";

export async function GET() {
  try {
    const pastWinners = await fetchPastWinners(1); // 1 = yesterday
    console.log("✅ API Returning Winners:", pastWinners);
    return NextResponse.json({ yesterdayWinners: pastWinners });
  } catch (error) {
    console.error("❌ Error fetching yesterday's winners:", error);
    return NextResponse.json({ error: "Error fetching yesterday's winners" }, { status: 500 });
  }
}
