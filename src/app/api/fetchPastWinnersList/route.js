import { fetchPastWinners } from '@/utils/lotteryData';

export async function GET() {
  try {
    // Call the function with days=1 to fetch yesterday's winners.
    const pastWinners = await fetchPastWinners(1);
    return new Response(JSON.stringify({ yesterdayWinners: pastWinners }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error fetching yesterday's winners:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
