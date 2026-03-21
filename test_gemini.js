const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("No API Key found in .env");
    return;
  }
  console.log("Testing API Key:", apiKey.substring(0, 10) + "...");
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello, respond with ONE WORD 'READY'");
    console.log("Result:", result.response.text());
  } catch (err) {
    console.error("Gemini Test Error:", err);
  }
}

testGemini();
