import { fetchPastWinners } from "@/utils/lotteryData";

export async function GET() {
  try {
    const pastWinners = await fetchPastWinners(10); // Fetch last 10 winning numbers
    return Response.json({ pastWinners });
  } catch (error) {
    console.error("❌ Error fetching past winners:", error);
    return Response.json({ error: "Error fetching past winners" }, { status: 500 });
  }
}

