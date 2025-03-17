import { fetchTotalPrize } from "@/utils/lotteryData";

export async function GET() {
  try {
    const totalPrize = await fetchTotalPrize();
    return Response.json({ totalPrize });
  } catch (error) {
    console.error("Error fetching total prize:", error);
    return Response.json({ error: "Error fetching total prize" }, { status: 500 });
  }
}
