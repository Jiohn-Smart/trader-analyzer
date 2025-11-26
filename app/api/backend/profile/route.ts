import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const response = await fetch(`${BACKEND_URL}/api/analyze/profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                credentials: {
                    api_key: body.credentials?.api_key,
                    api_secret: body.credentials?.api_secret,
                    exchange: body.credentials?.exchange || 'bitmex'
                },
                symbol: body.symbol || 'BTC/USD',
                days: body.days || 365
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.detail || 'Profile analysis failed' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Backend Profile API Error:', error);
        return NextResponse.json(
            { error: 'Failed to get profile analysis from backend' },
            { status: 500 }
        );
    }
}
