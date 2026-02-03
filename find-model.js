// Test different Gemini models and API versions
const API_KEY = 'AIzaSyDBLmBO2paGsqnbNhRf67jrDL1IZp_ivKg';

async function testModel(version, model) {
    console.log(`\n🧪 Testing ${model} with ${version}...`);
    const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    role: 'user',
                    parts: [{ text: 'Hello' }]
                }]
            })
        });

        console.log(`   Status: ${response.status}`);

        if (response.ok) {
            const data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            console.log(`   ✅ SUCCESS! Response: ${text?.substring(0, 50)}`);
            return true;
        } else {
            const data = await response.json();
            console.log(`   ❌ ${response.status}: ${data.error?.message?.substring(0, 80)}`);
            return false;
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        return false;
    }
}

async function findWorkingModel() {
    console.log('=== FINDING WORKING MODEL ===');

    const tests = [
        { version: 'v1', model: 'gemini-pro' },
        { version: 'v1beta', model: 'gemini-1.5-flash' },
        { version: 'v1beta', model: 'gemini-1.5-pro' },
        { version: 'v1', model: 'gemini-1.5-flash' },
        { version: 'v1', model: 'gemini-1.5-pro' },
        { version: 'v1beta', model: 'gemini-pro' },
    ];

    for (const test of tests) {
        const success = await testModel(test.version, test.model);
        if (success) {
            console.log(`\n\n🎉 FOUND WORKING CONFIGURATION:`);
            console.log(`   API Version: ${test.version}`);
            console.log(`   Model: ${test.model}`);
            console.log(`\n   Use this in your code:`);
            console.log(`   https://generativelanguage.googleapis.com/${test.version}/models/${test.model}:generateContent`);
            return;
        }
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between requests
    }

    console.log('\n❌ No working model found. Check API key permissions.');
}

findWorkingModel();
