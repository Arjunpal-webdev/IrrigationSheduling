// Test Gemini API Key Directly
const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDBLmBO2paGsqnbNhRf67jrDL1IZp_ivKg';

async function testGeminiAPI() {
    console.log('=== GEMINI API KEY TEST ===\n');
    console.log('API Key:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'MISSING');
    console.log('API Key Length:', API_KEY?.length || 0);

    if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
        console.error('❌ No API key found!');
        console.log('\n📝 To fix:');
        console.log('1. Go to: https://makersuite.google.com/app/apikey');
        console.log('2. Create a new API key');
        console.log('3. Update .env.local with: GEMINI_API_KEY=your_key_here');
        return;
    }

    try {
        console.log('\n🧪 Testing gemini-pro model...');
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    role: 'user',
                    parts: [{ text: 'Say hello in one word' }]
                }]
            })
        });

        console.log('Status:', response.status, response.statusText);

        const data = await response.json();

        if (!response.ok) {
            console.error('\n❌ API ERROR!');
            console.error('Status:', response.status);
            console.error('Response:', JSON.stringify(data, null, 2));

            if (response.status === 403) {
                console.error('\n🚨 403 FORBIDDEN - API Key Issues:');
                console.error('1. API key is invalid or expired');
                console.error('2. API key not enabled for Gemini API');
                console.error('3. Billing not enabled (some models require it)');
                console.error('4. API restrictions (IP/referer) blocking request');
                console.error('\n👉 Fix at: https://makersuite.google.com/app/apikey');
            } else if (response.status === 429) {
                console.error('\n⚠️ RATE LIMIT - Too many requests');
            } else if (response.status === 400) {
                console.error('\n⚠️ BAD REQUEST - Check API format');
            }
        } else {
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            console.log('\n✅ SUCCESS!');
            console.log('Response:', text);
            console.log('\n🎉 Your API key is working correctly!');
        }

    } catch (error) {
        console.error('\n❌ TEST FAILED!');
        console.error('Error:', error.message);
    }
}

testGeminiAPI();
