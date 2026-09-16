import axios from 'axios';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('categorySchemes');

    const apiUrl = `${process.env.NEXT_PUBLIC_DATA_API}/api/open-apis/fund-performance/fpsub-category`;
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;

    const response = await axios.get(`${apiUrl}?categorySchemes=${encodeURIComponent(category)}&apikey=${apiKey}`);

    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("fpsub-category API Error:", error?.message);
    return new Response(JSON.stringify({ error: "Failed to fetch fund performance sub-category" }), {
      status: 500,
    });
  }
}

