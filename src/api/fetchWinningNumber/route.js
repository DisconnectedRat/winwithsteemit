import { fetchWinningNumber, fetchJackpotWinner, fetchTotalPrize, fetchPastWinners } from "@/utils/lotteryData";

export async function GET() {
  try {
    const winningNumber = await fetchWinningNumber();
    const jackpot = 50; // Placeholder until jackpot logic is applied
    const totalPrize = await fetchTotalPrize();
    const latestJackpotWinner = await fetchJackpotWinner();
    const yesterdayWinners = await fetchPastWinners(1); // Fetch yesterday’s winners
    const pastWinningNumbers = await fetchPastWinners(10); // Fetch last 10 days

    return Response.json({
      winningNumber,
      jackpot,
      totalPrize,
      latestJackpotWinner,
      yesterdayWinners,
      pastWinningNumbers,
    });
  } catch (error) {
    return Response.json({ error: "Error fetching results" }, { status: 500 });
  }
}
