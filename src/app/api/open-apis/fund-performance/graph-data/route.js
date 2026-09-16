import axios from "axios";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const pcode = searchParams.get("pcode");

    if (!pcode) {
      return new Response(JSON.stringify({ error: "Missing pcode" }), {
        status: 400,
      });
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_DATA_API}/api/open-apis/fund-performance/graph-data?pcode=${encodeURIComponent(
      pcode
    )}&apikey=${process.env.NEXT_PUBLIC_API_KEY}`;

    const response = await axios.get(apiUrl);

    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Graph data fetch error:", error.message);
    return new Response(
      JSON.stringify({ error: "Failed to fetch graph data" }),
      { status: 500 }
    );
  }
}
