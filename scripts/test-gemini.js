const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "votre_cle_ici") {
    console.error("ERREUR: Clé API non configurée ou valeur par défaut détectée.");
    return;
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    // Note: The SDK might not have a direct listModels, but we can try to hit an endpoint
    // Actually, usually we can use the model directly.
    // Let's try to generate a tiny content with gemini-1.5-flash
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hi");
    console.log("TEST gemini-1.5-flash: SUCCESS");
    console.log(result.response.text());
  } catch (err) {
    console.error("TEST gemini-1.5-flash: FAILED");
    console.error(err.message);
    
    console.log("\nTentative avec gemini-pro...");
    try {
      const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
      const resultPro = await modelPro.generateContent("Hi");
      console.log("TEST gemini-pro: SUCCESS");
    } catch (errPro) {
      console.error("TEST gemini-pro: FAILED");
      console.error(errPro.message);
    }
  }
}

main();
