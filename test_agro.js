const axios = require('axios');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config(); // Fallback to .env

const API_KEY = process.env.AGROMONITORING_API_KEY;
const BASE_URL = 'https://api.agromonitoring.com/agro/1.0';

if (!API_KEY) {
    console.error('❌ AGROMONITORING_API_KEY is missing in environment variables.');
    process.exit(1);
}

async function testAgro() {
    try {
        console.log('Testing AgroMonitoring API key...');
        const response = await axios.get(`${BASE_URL}/polygons?appid=${API_KEY}`);
        console.log('✅ Connection Successful!');
        console.log('Polygons count:', response.data.length);

        if (response.data.length > 0) {
            const polyId = response.data[0].id;
            console.log('First Polygon ID:', polyId);

            console.log(`\nTesting weather for polygon ${polyId}...`);
            const weatherRes = await axios.get(`${BASE_URL}/weather?polyid=${polyId}&appid=${API_KEY}`);
            console.log('✅ Weather Success!');

            console.log(`\nTesting NDVI for polygon ${polyId}...`);
            const now = Math.floor(Date.now() / 1000);
            const start = now - 30 * 24 * 60 * 60;
            const ndviRes = await axios.get(`${BASE_URL}/ndvi/history?polyid=${polyId}&start=${start}&end=${now}&appid=${API_KEY}`);
            console.log('✅ NDVI Success!');
            console.log('NDVI records:', ndviRes.data.length);
        } else {
            console.log('⚠️ No polygons found for this account.');
        }
    } catch (error) {
        if (error.response) {
            console.error('❌ API Error:', error.response.status, JSON.stringify(error.response.data));
        } else {
            console.error('❌ Error:', error.message);
        }
    }
}

testAgro();
