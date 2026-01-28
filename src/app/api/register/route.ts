import { NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        await registerUser(email, password, name);

        return NextResponse.json(
            { message: 'User registered successfully' },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: 'Registration failed' },
            { status: 500 }
        );
    }
}
