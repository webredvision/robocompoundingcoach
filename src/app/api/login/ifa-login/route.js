import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req) {
  try {
    const body = await req.json();
 

    const apiResponse = await axios.post(
      `${process.env.NEXT_PUBLIC_DATA_API}/api/login/ifa-login`,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
          // Add other headers here if needed (e.g., API key)
        },
      }
    );

    return NextResponse.json(apiResponse.data, { status: apiResponse.status });
  } catch (error) {
    console.error('Proxy error:', error?.response?.data || error.message);

    return NextResponse.json(
      {
        message: 'Internal Server Error',
        error: error?.response?.data || error.message,
      },
      { status: error?.response?.status || 500 }
    );
  }
}
