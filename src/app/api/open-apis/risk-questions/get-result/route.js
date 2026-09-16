import axios from "axios";
import { NextResponse } from "next/server";


export async function GET(req) {
  try {
    // Extract query parameters from the incoming request
    const { searchParams } = new URL(req.url);
    const arnId = searchParams.get("arnId");
    const deskType = searchParams.get("deskType");

    // Make request to external API
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_DATA_API}/api/open-apis/risk-questions/get-result`,
      {
        params: {
          apikey: process.env.NEXT_PUBLIC_API_KEY,
          arnId,
          deskType,
        },
      }
    );
    return new NextResponse(JSON.stringify(response.data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch data" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
