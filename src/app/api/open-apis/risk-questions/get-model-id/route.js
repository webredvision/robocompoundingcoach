// app/api/get-model-id/route.js
import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // Extract query parameters if needed
    const { searchParams } = new URL(req.url);
    const arnId = searchParams.get("arnId") || "9"; // default to 9
    const deskType = searchParams.get("deskType") || "advisor"; // default to advisor

    // Call external API
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_DATA_API}/api/open-apis/risk-questions/get-model-id`,
      {
        params: {
          apikey: process.env.NEXT_PUBLIC_API_KEY,
          arnId,
          deskType,
        },
      }
    );

    // Return the response using NextResponse
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetching model ID:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch model ID" },
      { status: 500 }
    );
  }
}
