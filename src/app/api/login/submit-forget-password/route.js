import axios from 'axios';

export async function POST(request) {
  try {
    const body = await request.json(); // Parse JSON body from incoming request

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_DATA_API}/api/login/submit-forget-password`,
      body
    );

    return new Response(JSON.stringify(response.data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Password Reset API Error:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to submit forgot password request',
        message: error?.response?.data || error.message,
      }),
      {
        status: error?.response?.status || 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
