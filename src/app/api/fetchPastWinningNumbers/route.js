import { fetchPastWinners } from "@/utils/lotteryData";

export async function GET() {
  try {
    const pastWinningNumbers = await fetchPastWinners(10); // Get last 10 days
    return Response.json({ pastWinningNumbers });
  } catch (error) {
    console.error("Error fetching past winning numbers:", error);
    return Response.json({ error: "Error fetching past winning numbers" }, { status: 500 });
  }
}
