import { fetchPastWinners } from "@/utils/lotteryData";

export async function GET() {
  try {
    const pastWinners = await fetchPastWinners(1); // Fetch only yesterday's results
    return Response.json({ yesterdayWinners: pastWinners });
  } catch (error) {
    console.error("Error fetching yesterday's winners:", error);
    return Response.json({ error: "Error fetching yesterday's winners" }, { status: 500 });
  }
}
