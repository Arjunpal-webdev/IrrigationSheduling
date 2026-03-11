const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function listFarms() {
    try {
        console.log('Listing farms and their polygon IDs...');
        const farms = await prisma.farm.findMany({
            select: { id: true, name: true, location: true, polygonId: true }
        });

        if (farms.length === 0) {
            console.log('No farms found.');
        } else {
            console.table(farms);
        }
    } catch (error) {
        console.error('❌ Database Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

listFarms();
