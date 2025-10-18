import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("\nERROR: API_KEY environment variable is not set.");
  console.error("Please set your Google AI API Key and restart the server.\n");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let phoneClient = null;
const displayClients = new Set();

wss.on('connection', (ws, req) => {
  const role = new URL(req.url, `http://${req.headers.host}`).searchParams.get('role');

  if (role === 'phone') {
    console.log('Phone client connected.');
    phoneClient = ws;
    ws.on('close', () => {
      console.log('Phone client disconnected.');
      phoneClient = null;
    });
  } else {
    console.log('Display client connected.');
    displayClients.add(ws);
    ws.on('close', () => {
      console.log('Display client disconnected.');
      displayClients.delete(ws);
    });
  }

  ws.on('message', async (message) => {
    if (ws === phoneClient) {
      const base64Image = message.toString().split(',')[1];
      
      try {
        const resultText = await identifyImage(base64Image);
        const payload = JSON.stringify({
          image: message.toString(),
          result: resultText,
        });
        
        displayClients.forEach(client => {
          if (client.readyState === 1) { // WebSocket.OPEN
            client.send(payload);
          }
        });

      } catch (error) {
        console.error("Error during AI processing:", error.message);
        const errorPayload = JSON.stringify({ error: "AI processing failed." });
         displayClients.forEach(client => {
          if (client.readyState === 1) {
            client.send(errorPayload);
          }
        });
      }
    }
  });
});

async function identifyImage(base64Data) {
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Data,
    },
  };

  const textPart = {
    text: "What food item is in this image? If it's not a food item, respond with 'Not food'.",
  };
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [textPart, imagePart] },
  });

  return response.text;
}

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Open the above URL in your browser to see the display and QR code.`);
});