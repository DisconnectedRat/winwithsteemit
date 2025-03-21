import { fetchConfirmedEntrants } from '@/utils/lotteryData';

export async function GET() {
  try {
    const confirmedEntrants = await fetchConfirmedEntrants();
    return new Response(JSON.stringify({ confirmedEntrants }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("API fetchConfirmedEntrants error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
