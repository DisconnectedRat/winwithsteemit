// src/app/api/distributePrizes/route.js
import { distributePrizes } from '@/utils/lotteryData';

export async function POST(request) {
  try {
    await distributePrizes();
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error distributing prizes:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
