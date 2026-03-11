const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();
const prisma = new PrismaClient();

async function checkRecentData() {
    try {
        console.log('Checking recent FarmData entries...');
        const recentData = await prisma.farmData.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { farm: true }
        });

        if (recentData.length === 0) {
            console.log('No FarmData found.');
        } else {
            recentData.forEach((d, i) => {
                console.log(`\nEntry ${i + 1}:`);
                console.log('Farm:', d.farm.name);
                console.log('Polygon:', d.farm.polygonId);
                console.log('Created At:', d.createdAt);
                console.log('NDVI:', d.ndvi);
                console.log('Soil Moisture:', d.soilMoisture);
                console.log('Weather:', d.weather ? 'Yes' : 'No');
            });
        }
    } catch (error) {
        console.error('❌ Database Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkRecentData();
