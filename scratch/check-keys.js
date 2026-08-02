const fs = require('fs');
const path = require('path');

async function checkKeys() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env.local file not found at', envPath);
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let key = match[1];
      let value = match[2] || '';
      // Remove quotes if present
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      envVars[key] = value;
    }
  });

  const serperKey = envVars.SERPER_API_KEY;
  const openRouterKey = envVars.OPENROUTER_API_KEY;

  if (!serperKey || serperKey === 'your_actual_serper_api_key_here') {
    console.error('❌ Serper API Key is missing or not updated.');
  } else {
    try {
      const res = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': serperKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ q: "apple inc" })
      });
      if (res.ok) {
        console.log('✅ Serper API Key is working.');
      } else {
        const err = await res.text();
        console.error('❌ Serper API Key failed:', res.status, err);
      }
    } catch (e) {
      console.error('❌ Serper API request error:', e.message);
    }
  }

  if (!openRouterKey || openRouterKey === 'your_actual_openrouter_api_key_here') {
    console.error('❌ OpenRouter API Key is missing or not updated.');
  } else {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.3-70b-instruct:free',
          messages: [{ role: 'user', content: 'Hi, just a quick test. Reply "OK".' }]
        })
      });
      if (res.ok) {
        console.log('✅ OpenRouter API Key is working.');
      } else {
        const err = await res.text();
        console.error('❌ OpenRouter API Key failed:', res.status, err);
      }
    } catch (e) {
      console.error('❌ OpenRouter API request error:', e.message);
    }
  }
}

checkKeys();
