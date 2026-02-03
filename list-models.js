// List available models for the API key
const API_KEY = 'AIzaSyDBLmBO2paGsqnbNhRf67jrDL1IZp_ivKg';

async function listModels() {
    console.log('=== LISTING AVAILABLE MODELS ===\n');

    try {
        const url = `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`;
        const response = await fetch(url);

        console.log('Status:', response.status);

        if (!response.ok) {
            const data = await response.json();
            console.error('❌ Error:', data.error?.message);
            console.error('\nThis means your API key might not be activated yet.');
            console.error('Wait 1-2 minutes after creating it, then try again.');
            return;
        }

        const data = await response.json();
        console.log('\n✅ Available models:\n');

        if (data.models && data.models.length > 0) {
            data.models.forEach(model => {
                console.log(`  📦 ${model.name}`);
                if (model.supportedGenerationMethods?.includes('generateContent')) {
                    console.log(`     ✅ Supports generateContent`);
                }
            });

            console.log('\n🎯 RECOMMENDED MODEL TO USE:');
            const recommended = data.models.find(m =>
                m.name.includes('gemini') &&
                m.supportedGenerationMethods?.includes('generateContent')
            );

            if (recommended) {
                console.log(`   ${recommended.name}`);
                console.log(`\n   Use this URL in your code:`);
                console.log(`   https://generativelanguage.googleapis.com/v1/${recommended.name}:generateContent`);
            }
        } else {
            console.log('❌ No models available. API key might not be activated.');
        }

    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
}

listModels();
