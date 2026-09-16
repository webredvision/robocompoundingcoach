// app/api/get-model-portfolio/route.js
import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const arnId = searchParams.get("arnId");
    const modelPortfolioId = searchParams.get("modelPortfolioId");

    if (!arnId || !modelPortfolioId) {
      return NextResponse.json(
        { error: "Missing arnId or modelPortfolioId" },
        { status: 400 }
      );
    }

    // Call external API
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_DATA_API}/api/open-apis/risk-questions/get-model-portfolio`,
      {
        params: {
          apikey: process.env.NEXT_PUBLIC_API_KEY,
          arnId,
          modelPortfolioId,
        },
      }
    );

    // Return the API data using NextResponse
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetching model portfolio:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch model portfolio" },
      { status: 500 }
    );
  }
}
