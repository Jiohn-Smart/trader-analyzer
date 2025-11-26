import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const response = await fetch(`${BACKEND_URL}/api/test/connection`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                api_key: body.api_key,
                api_secret: body.api_secret,
                exchange: body.exchange || 'bitmex'
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.detail || 'Connection test failed' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Backend API Error:', error);
        return NextResponse.json(
            { error: 'Failed to connect to backend service' },
            { status: 500 }
        );
    }
}
