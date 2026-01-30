import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Mock database for demonstration
let cropsDatabase: any[] = [];

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Return crops for the user
        return NextResponse.json({
            crops: cropsDatabase,
            count: cropsDatabase.length
        });
    } catch (error) {
        console.error('Crops GET error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch crops' },
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
        if (!data.name || !data.type) {
            return NextResponse.json(
                { error: 'Name and type are required' },
                { status: 400 }
            );
        }

        // Create new crop entry
        const newCrop = {
            id: `crop_${Date.now()}`,
            name: data.name,
            type: data.type,
            plantingDate: data.plantingDate || new Date().toISOString(),
            area: data.area || 0,
            healthScore: 85,
            growthStage: 'Initial',
            userId: session.user?.email,
            createdAt: new Date().toISOString()
        };

        // Save to database (in a real app, this would be MongoDB/PostgreSQL)
        cropsDatabase.push(newCrop);

        return NextResponse.json({
            success: true,
            crop: newCrop
        }, { status: 201 });
    } catch (error) {
        console.error('Crops POST error:', error);
        return NextResponse.json(
            { error: 'Failed to create crop' },
            { status: 500 }
        );
    }
}
