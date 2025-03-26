import { fetchPastWinnerList } from "@/utils/lotteryData";

export const dynamic = "force-dynamic";

export async function GET(req) {
  console.log("GET /api/fetchPastWinnerList called");
  try {
    const pastWinnerList = await fetchPastWinnerList(); // now filtered by date
    return new Response(JSON.stringify({ pastWinnerList }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching past winner list:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
