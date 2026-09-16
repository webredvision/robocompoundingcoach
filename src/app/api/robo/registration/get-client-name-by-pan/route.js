import { NextResponse } from "next/server";
import axios from "axios";

// ✅ Optional CORS headers (keeps it compatible across browsers)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ Handle OPTIONS (for CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// ✅ Handle POST request
export async function POST(req) {
  try {
    // 1️⃣ Get raw body text to keep the same format (form-urlencoded)
    const body = await req.text();

    // 2️⃣ Build real API endpoint
    const realApiUrl = `${process.env.NEXT_PUBLIC_DATA_API}/api/registration/get-client-name-by-pan`;

    // 3️⃣ Forward request to actual backend
    const apiResponse = await axios.post(realApiUrl, body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    // 4️⃣ Send back backend response to frontend
    return new NextResponse(JSON.stringify(apiResponse.data), {
      status: apiResponse.status,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Proxy error:", error.message);
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: error.response?.data || error.message,
      }),
      {
        status: error.response?.status || 500,
        headers: corsHeaders,
      }
    );
  }
}
