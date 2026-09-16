// app/api/fund-performance/route.js

import axios from "axios";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySchemes = searchParams.get("categorySchemes");

    if (!categorySchemes) {
      return new Response(JSON.stringify({ error: "Missing categorySchemes" }), {
        status: 400,
      });
    }

    // Construct full API URL
    const apiUrl = `${process.env.NEXT_PUBLIC_DATA_API}/api/open-apis/fund-performance/fp-data?categorySchemes=${encodeURIComponent(categorySchemes)}&apikey=${process.env.NEXT_PUBLIC_API_KEY}`;

    const response = await axios.get(apiUrl);

    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });

  } catch (error) {
    console.error("Fund performance fetch error:", error.message);
    return new Response(JSON.stringify({ error: "Failed to fetch fund performance" }), {
      status: 500,
    });
  }
}
