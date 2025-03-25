export const dynamic = 'force-dynamic';

import { fetchPastWinnerList } from '@/utils/lotteryData';

export async function POST (req) {
  console.log("POST /api/fetchPastWinnerList called"); // Debug logging

  try {
    // Fetch the top 5 past winners from the historical winners collection.
    const pastWinnerList = await fetchPastWinnerList(5);
    return new Response(JSON.stringify({ pastWinnerList }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error fetching past winner list:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
