import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { schemeCode, arn_id } = body;

    // Call the external API
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_DATA_API}/api/get-minimum-amount`,
      { schemeCode, arn_id },
      { headers: { "Content-Type": "application/json" } }
    );



    return NextResponse.json({
      success: true,
      data: res.data,
    });
  } catch (error) {
    console.error("Error in proxy API:", error.response?.data || error.message);
    return NextResponse.json(
      {
        success: false,
        message: error.response?.data?.message || "Failed to fetch minimum amount",
      },
      { status: error.response?.status || 500 }
    );
  }
}
