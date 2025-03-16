import { fetchWinningNumber, fetchJackpotWinner, fetchTotalPrize, fetchPastWinners } from "@/utils/lotteryData";

export async function GET() {
  try {
    const winningNumber = await fetchWinningNumber();
    const jackpot = 50; // Placeholder until dynamic jackpot logic is implemented
    const totalPrize = await fetchTotalPrize();
    const latestJackpotWinner = await fetchJackpotWinner();
    const yesterdayWinners = await fetchPastWinners(1); // Fetch yesterday’s winners
    const pastWinningNumbers = await fetchPastWinners(10); // Fetch last 10 days

    return new Response(JSON.stringify({
      winningNumber,
      jackpot,
      totalPrize,
      latestJackpotWinner,
      yesterdayWinners,
      pastWinningNumbers,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error fetching winning number:", error);

    return new Response(JSON.stringify({ error: "Error fetching results" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
