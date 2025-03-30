import { distributePrizes } from "@/utils/lotteryData";

export const dynamic = 'force-dynamic';

// GET method — for browser use
export async function GET() {
  return await runDistribute();
}

// Shared handler
async function runDistribute() {
  try {
    await distributePrizes();
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error distributing prizes:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
