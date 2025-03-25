// Remove "use server"; from here

export const dynamic = 'force-dynamic';

import { distributePrizes } from "@/utils/lotteryData";

export async function POST(req) {
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
