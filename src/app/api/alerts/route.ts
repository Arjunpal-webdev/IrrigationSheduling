import { NextRequest, NextResponse } from 'next/server';
import { ThresholdManager } from '@/lib/alerts/thresholdManager';
import { Alert } from '@/types';

// Mock alert storage (in production, use database)
let mockAlerts: Alert[] = [
    {
        id: 'alert_1',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        type: 'irrigation_due',
        severity: 'high',
        severityScore: 65,
        title: 'Irrigation Recommended Today',
        message: 'Based on AI analysis, irrigation is recommended today for optimal crop health.',
        actionRequired: true,
        read: false
    },
    {
        id: 'alert_2',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        type: 'weather_warning',
        severity: 'medium',
        severityScore: 45,
        title: 'Weather Advisory',
        message: 'High temperatures expected tomorrow. Monitor soil moisture closely.',
        actionRequired: false,
        read: true
    }
];

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const unreadOnly = searchParams.get('unreadOnly') === 'true';

        let alerts = [...mockAlerts];

        if (unreadOnly) {
            alerts = alerts.filter(a => !a.read);
        }

        // Sort by timestamp (newest first)
        alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return NextResponse.json({
            alerts,
            unreadCount: mockAlerts.filter(a => !a.read).length
        });
    } catch (error) {
        console.error('Alerts API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch alerts' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const action = body.action;

        if (action === 'markAsRead') {
            const alertId = body.alertId;
            const alert = mockAlerts.find(a => a.id === alertId);
            if (alert) {
                alert.read = true;
            }
            return NextResponse.json({ success: true });
        }

        if (action === 'create') {
            // Create new alert based on conditions
            const { type, severity, severityScore, context } = body;

            const newAlert = ThresholdManager.createAlert(
                type,
                severity,
                severityScore,
                context
            );

            // Check if should deduplicate
            if (!ThresholdManager.shouldDeduplicateAlert(newAlert, mockAlerts)) {
                mockAlerts.push(newAlert);
            }

            return NextResponse.json({ alert: newAlert, success: true });
        }

        return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Alert action error:', error);
        return NextResponse.json(
            { error: 'Failed to process alert action' },
            { status: 500 }
        );
    }
}
