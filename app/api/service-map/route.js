import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const response = await fetch('http://localhost:8000/api/service-map', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to FastAPI backend' },
      { status: 500 }
    );
  }
}
