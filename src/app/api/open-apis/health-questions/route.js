import axios from 'axios';

export async function GET() {
  try {
    const apiBase = process.env.NEXT_PUBLIC_DATA_API;
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;

    const url = `${apiBase}/api/open-apis/health-questions?apikey=${apiKey}`;

    const response = await axios.get(url);

    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Health Questions API Error:", error?.message);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch health questions' }),
      { status: 500 }
    );
  }
}
