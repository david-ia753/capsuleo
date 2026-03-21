const https = require('https');
require("dotenv").config();

const apiKey = process.env.GEMINI_API_KEY;
const data = JSON.stringify({
  contents: [{ parts: [{ text: "Hello" }] }]
});

const options = {
  hostname: 'generativelanguage.googleapis.com',
  port: 443,
  path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  let body = '';
  res.on('data', (d) => { body += d; });
  res.on('end', () => {
    try {
      console.log('Body:', JSON.stringify(JSON.parse(body), null, 2));
    } catch(e) {
      console.log('Body:', body);
    }
  });
});

req.on('error', (e) => {
  console.error('Error:', e);
});

req.write(data);
req.end();
