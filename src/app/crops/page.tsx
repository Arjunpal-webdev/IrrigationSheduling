'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Dashboard/Sidebar';
import DashboardHeader from '@/components/Dashboard/DashboardHeader';
import CropSelector from '@/components/Crops/CropSelector';
import CropDetailsPanel from '@/components/Crops/CropDetailsPanel';
import { mockCrops, Crop } from '@/components/Crops/mockCropData';
import dashboardStyles from '../dashboard/dashboard.module.css';
import styles from './crops.module.css';

export default function CropsPage() {
    const [selectedCrop, setSelectedCrop] = useState<Crop | null>(mockCrops[0]);
    const [crops, setCrops] = useState<Crop[]>(mockCrops);
    const [loading, setLoading] = useState(false);

    // Fetch crop data when selectedCrop changes
    useEffect(() => {
        if (selectedCrop) {
            fetchCropData(selectedCrop.id);
        }
    }, [selectedCrop]);

    const fetchCropData = async (cropId: string) => {
        setLoading(true);
        try {
            // In a real application, this would fetch crop-specific data from API
            // For now, we're using mock data which is already loaded
            console.log('Fetching data for crop:', cropId);
        } catch (error) {
            console.error('Error fetching crop data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCrop = async () => {
        const newCropData = {
            name: prompt('Enter crop name:'),
            type: prompt('Enter crop type:'),
            plantingDate: new Date().toISOString(),
            area: parseFloat(prompt('Enter area in hectares:') || '0')
        };

        if (!newCropData.name || !newCropData.type) {
            alert('Please provide valid crop details');
            return;
        }

        try {
            const response = await fetch('/api/crops', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCropData)
            });

            if (response.ok) {
                const data = await response.json();
                alert('Crop added successfully!');
                // Refresh crop list
                refreshCropList();
            } else {
                alert('Failed to add crop');
            }
        } catch (error) {
            console.error('Error adding crop:', error);
            alert('Error adding crop');
        }
    };

    const refreshCropList = async () => {
        try {
            const response = await fetch('/api/crops');
            if (response.ok) {
                const data = await response.json();
                setCrops(data.crops || mockCrops);
            }
        } catch (error) {
            console.error('Error refreshing crops:', error);
        }
    };

    return (
        <div className={dashboardStyles.dashboardLayout}>
            <Sidebar />
            <div className={dashboardStyles.mainContent}>
                <DashboardHeader userName="Farmer" />
                <main className={dashboardStyles.contentArea}>
                    <div className={dashboardStyles.pageHeader}>
                        <div>
                            <h2 className={dashboardStyles.pageTitle}>🌾 Crop Management</h2>
                            <p className={dashboardStyles.pageSubtitle}>
                                AI-powered crop monitoring with growth stage insights
                            </p>
                        </div>
                        <button className="btn-primary" onClick={handleAddCrop}>+ Add New Crop</button>
                    </div>

                    <div className={styles.cropManagementLayout}>
                        <div className={styles.cropSelectorPanel}>
                            <CropSelector
                                crops={crops}
                                selectedCrop={selectedCrop}
                                onSelectCrop={setSelectedCrop}
                            />
                        </div>
                        <div className={styles.cropDetailsPanel}>
                            {loading ? (
                                <div>Loading crop data...</div>
                            ) : (
                                <CropDetailsPanel crop={selectedCrop} />
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
