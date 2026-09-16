import { NextResponse } from "next/server";
import axios from "axios";

// ✅ CORS headers for Safari/Chrome/macOS compatibility
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// ✅ Handle POST requests
export async function POST(req) {
  try {
    // 1️⃣ Read raw body (formData or x-www-form-urlencoded)
    const body = await req.text();

    // 2️⃣ Define your actual backend API endpoint
    const realApiUrl = `${process.env.NEXT_PUBLIC_DATA_API}/api/registration/check-account`;

    // 3️⃣ Forward request to real backend
    const apiResponse = await axios.post(realApiUrl, body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    // 4️⃣ Return backend response to frontend
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
