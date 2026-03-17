const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // The listModels method is actually available on the genAI object or via a client
    // In @google/generative-ai, it's not directly on genAI.
    // However, we can try to use a model name that is confirmed to be working in v1beta.
    
    // Alternative: use a direct fetch to the discovery endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.models) {
      console.log("Modèles disponibles :");
      data.models.forEach(m => console.log(`- ${m.name}`));
    } else {
      console.log("Aucun modèle trouvé ou erreur de clé.");
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error("Erreur lors du listing:", err.message);
  }
}

main();
