import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Mock database for demonstration
let fieldsDatabase: any[] = [];

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Return fields for the user
        return NextResponse.json({
            fields: fieldsDatabase,
            count: fieldsDatabase.length
        });
    } catch (error) {
        console.error('Fields GET error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch fields' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const data = await request.json();

        // Validate required fields
        if (!data.name || !data.area) {
            return NextResponse.json(
                { error: 'Name and area are required' },
                { status: 400 }
            );
        }

        // Create new field entry
        const newField = {
            id: `field_${Date.now()}`,
            name: data.name,
            area: parseFloat(data.area),
            cropType: data.cropType || 'Not specified',
            location: data.location || 'Not specified',
            userId: session.user?.email,
            status: 'Active',
            createdAt: new Date().toISOString()
        };

        // Save to database (in a real app, this would be MongoDB/PostgreSQL)
        fieldsDatabase.push(newField);

        return NextResponse.json({
            success: true,
            field: newField
        }, { status: 201 });
    } catch (error) {
        console.error('Fields POST error:', error);
        return NextResponse.json(
            { error: 'Failed to create field' },
            { status: 500 }
        );
    }
}
