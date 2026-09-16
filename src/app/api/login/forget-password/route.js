import axios from 'axios';

export async function POST(request) {
  try {
    const provider = await request.json(); // Get data from request body

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_DATA_API}/api/login/forget-password`,
      provider
    );

    return new Response(JSON.stringify(response.data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Forget Password API Error:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to initiate forget password request',
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
