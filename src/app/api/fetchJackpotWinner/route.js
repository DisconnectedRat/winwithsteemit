import { fetchJackpotWinner } from "@/utils/lotteryData";

export async function GET() {
  try {
    const jackpotWinner = await fetchJackpotWinner();
    return Response.json({ jackpotWinner });
  } catch (error) {
    console.error("Error fetching jackpot winner:", error);
    return Response.json({ error: "Error fetching jackpot winner" }, { status: 500 });
  }
}
