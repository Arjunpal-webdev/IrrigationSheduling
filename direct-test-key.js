// Test Gemini API Key - WITH HARDCODED KEY FOR TESTING
// Replace YOUR_ACTUAL_KEY_HERE with your actual API key from .env.local

const API_KEY = 'AIzaSyDBLmBO2paGsqnbNhRf67jrDL1IZp_ivKg'; // <-- Paste your new key here if different

async function testGeminiAPI() {
    console.log('=== GEMINI API KEY TEST ===\n');
    console.log('Testing key:', API_KEY.substring(0, 15) + '...');
    console.log('Key length:', API_KEY.length);

    try {
        console.log('\n🧪 Testing gemini-pro model...\n');
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    role: 'user',
                    parts: [{ text: 'Say hello in exactly one word' }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 50
                }
            })
        });

        console.log('HTTP Status:', response.status, response.statusText);

        const data = await response.json();

        if (!response.ok) {
            console.error('\n❌ API ERROR!\n');
            console.error('Full response:', JSON.stringify(data, null, 2));

            if (response.status === 403) {
                console.error('\n🚨 403 FORBIDDEN ERRORS:');
                console.error('');
                console.error('Most common causes:');
                console.error('1. ❌ API key is INVALID or EXPIRED');
                console.error('2. ❌ Gemini API not ENABLED in your project');
                console.error('3. ❌ BILLING not enabled (required for some usage)');
                console.error('4. ❌ API key has IP/referer RESTRICTIONS');
                console.error('');
                console.error('🔧 HOW TO FIX:');
                console.error('');
                console.error('Step 1: Go to https://aistudio.google.com/app/apikey');
                console.error('Step 2: Click "Create API Key" → Create in NEW project');
                console.error('Step 3: Copy the new key');
                console.error('Step 4: Paste it in .env.local as GEMINI_API_KEY=your_key');
                console.error('Step 5: Restart your dev server (npm run dev)');
                console.error('');
                console.error('📚 More help: https://ai.google.dev/gemini-api/docs/api-key');
            } else if (response.status === 429) {
                console.error('\n⚠️ 429 RATE LIMIT - Too many requests, wait a bit');
            } else if (response.status === 400) {
                console.error('\n⚠️ 400 BAD REQUEST - Request format issue');
                console.error('Error details:', data.error?.message);
            }

            return false;

        } else {
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            console.log('\n✅ ✅ ✅ SUCCESS! ✅ ✅ ✅\n');
            console.log('AI Response:', text);
            console.log('\n🎉 Your API key is WORKING!');
            console.log('');
            console.log('✅ The chatbot should work now.');
            console.log('✅ Make sure this SAME key is in .env.local');
            console.log('✅ Restart your server: npm run dev');
            console.log('');

            return true;
        }

    } catch (error) {
        console.error('\n❌ NETWORK ERROR!');
        console.error('Error:', error.message);
        console.error('\nCheck your internet connection.');
        return false;
    }
}

testGeminiAPI();
