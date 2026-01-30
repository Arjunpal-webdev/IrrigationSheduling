import { NextRequest, NextResponse } from 'next/server';
import { mockCrops, Crop } from '@/components/Crops/mockCropData';

// In-memory storage for user-added crops
let userCrops: Crop[] = [];
let cropIdCounter = 1000;

export async function GET(request: NextRequest) {
    try {
        // Combine mock crops with user-added crops
        const allCrops = [...mockCrops, ...userCrops];

        return NextResponse.json({
            success: true,
            crops: allCrops,
            count: allCrops.length
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
        const data = await request.json();

        // Validate required fields
        if (!data.name) {
            return NextResponse.json(
                { error: 'Crop name is required' },
                { status: 400 }
            );
        }

        // Generate unique ID
        cropIdCounter++;
        const newCropId = `user-crop-${cropIdCounter}`;

        // Calculate expected harvest date (planting date + growth duration)
        const planting = new Date(data.plantingDate || new Date());
        const harvestDate = new Date(planting);
        const growthDays = parseInt(data.growthDuration) || 120;
        harvestDate.setDate(harvestDate.getDate() + growthDays);

        // Calculate days since planting
        const today = new Date();
        const daysSincePlanting = Math.floor((today.getTime() - planting.getTime()) / (1000 * 60 * 60 * 24));

        // Create new crop object matching Crop interface
        const newCrop: Crop = {
            id: newCropId,
            name: data.name,
            fieldId: `F-${cropIdCounter}`,
            area: parseFloat(data.area) || 1.0,
            health: 100, // New crops start at 100% health
            currentStage: 'Germination',
            daysSincePlanting: Math.max(0, daysSincePlanting),
            plantingDate: planting.toISOString().split('T')[0],
            expectedHarvest: harvestDate.toISOString().split('T')[0],
            kc: 0.5 // Default crop coefficient
        };

        // Add to user crops array
        userCrops.push(newCrop);

        return NextResponse.json({
            success: true,
            crop: newCrop,
            message: 'Crop added successfully'
        }, { status: 201 });
    } catch (error) {
        console.error('Crops POST error:', error);
        return NextResponse.json(
            { error: 'Failed to create crop' },
            { status: 500 }
        );
    }
}
