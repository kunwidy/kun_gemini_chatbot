import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 

const app = express();
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
const GEMINI_MODEL = "gemini-2.5-flash-lite";

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));


//app start here
app.post('/api/chat', async (req, res) => {
  const { conversation } = req.body;

  try {
    if (!Array.isArray(conversation)) throw new Error('Conversation must be an array of messages!');

    const contents = conversation.map(({ role, text }) => ({ 
        role, 
        parts: [{ text }] 
    }));

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        temperature: 0.9,
        systemInstructions: 'Jawab akurat untuk topik desain grafis, UI/UX, dan teknologi terkait. Jika tidak tahu jawabannya, katakan saja tidak tahu.',
      },
    });

    res.status(200).json({ result: response.text });

  } catch (error) {
    //console.error('Error generating content:', error);
    res.status(500).json({ error: error.message });
  }
});


const PORT = 3000;
app.listen(PORT, () => console.log(`server ready on http://localhost:${PORT}`));