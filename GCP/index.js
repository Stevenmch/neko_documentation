const functions = require('@google-cloud/functions-framework');
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');

// Leer el archivo de texto que contiene el prompt
const promptFilePath = path.join(__dirname, 'prompt_agent.txt');
const systemInstructionText = fs.readFileSync(promptFilePath, 'utf8');

const ai = new GoogleGenAI({
  vertexai: true,
  project: 'documentation-456019',
  location: 'us-central1',
});

const modelName = 'gemini-2.0-flash-001';

const systemInstruction = {
  parts: [{
    text: systemInstructionText,
  }],
};

const generationConfig = {
  maxOutputTokens: 8192,
  temperature: 0.2,
  topP: 0.8,
  responseModalities: ["TEXT"],
  safetySettings: [
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'OFF' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'OFF' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'OFF' },
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'OFF' }
  ],
  systemInstruction,
};

// Mensaje de prueba, lo puedes cambiar por `req.body.code`
const defaultCode = `import requests

url = "https://callgemini-397605286686.us-central1.run.app"
params = {"name": "Juan"}

response = requests.get(url, params=params)

print(response.text)`;

functions.http('helloHttp', async (req, res) => {
  // Agregar los encabezados CORS para permitir solicitudes desde cualquier origen
  res.setHeader('Access-Control-Allow-Origin', '*'); // Permite solicitudes desde cualquier origen
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST'); // Métodos permitidos
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Encabezados permitidos

  // Si la solicitud es OPTIONS (preflight), respondemos con un 200 para permitir la solicitud
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  try {
    const codeToDocument = req.body?.code || defaultCode;

    const chat = ai.chats.create({
      model: modelName,
      config: generationConfig,
    });

    const resultStream = await chat.sendMessageStream({ message: [{ text: codeToDocument }] });

    let finalText = '';
    for await (const chunk of resultStream) {
      if (chunk.text) finalText += chunk.text;
    }

    res.status(200).send(finalText);
  } catch (error) {
    console.error('Error al generar documentación:', error);
    res.status(500).send('Error generando la documentación.');
  }
});
