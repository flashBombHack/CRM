import { NextRequest, NextResponse } from 'next/server';

const getApiBaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://democrm-rsqo.onrender.com';
  if (url.startsWith('http://') && url.includes('onrender.com')) {
    return url.replace('http://', 'https://');
  }
  return url;
};

const API_BASE_URL = getApiBaseUrl();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/api/Auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        isSuccess: false,
        message: `HTTP ${response.status}: ${response.statusText}`,
        data: null,
        errors: [`HTTP ${response.status}: ${response.statusText}`],
        responseCode: 0,
      }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      {
        isSuccess: false,
        message: error.message || 'An error occurred',
        data: null,
        errors: [error.message || 'An error occurred'],
        responseCode: 0,
      },
      { status: 500 }
    );
  }
}

