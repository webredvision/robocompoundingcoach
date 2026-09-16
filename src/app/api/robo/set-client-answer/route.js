import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req) {
  try {
    // 1️⃣ Read JSON body from request
    const payload = await req.json();

    // 2️⃣ Send to the external API (the real backend)
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_DATA_API}/api/set-client-answer`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
        // Important: no credentials to avoid CORS issue
        withCredentials: false,
      }
    );

    // 3️⃣ Return backend response to frontend
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("❌ Proxy API error:", error.message);

    return NextResponse.json(
      {
        error: true,
        message: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
