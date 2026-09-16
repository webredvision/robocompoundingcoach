import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request) {
  try {
    // 1️⃣ Parse incoming JSON
    const body = await request.json();

    // 2️⃣ Convert JSON → x-www-form-urlencoded
    const formBody = new URLSearchParams();
    for (const key in body) {
      if (body[key] !== undefined && body[key] !== null) {
        formBody.append(key, body[key]);
      }
    }

    // 3️⃣ Remote API endpoint
    const realApiUrl = `${process.env.NEXT_PUBLIC_DATA_API}/api/registration/verify-o-t-p`;

    // 4️⃣ Send to backend
    const axiosResponse = await axios.post(realApiUrl, formBody.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    // 5️⃣ Return backend response to frontend
    return NextResponse.json(axiosResponse.data, { status: axiosResponse.status });
  } catch (error) {
    console.error("❌ Proxy Error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    return NextResponse.json(
      {
        success: false,
        message:
          error.response?.data?.message ||
          error.response?.data ||
          "Internal Server Error at proxy",
      },
      { status: error.response?.status || 500 }
    );
  }
}
