import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body; 
  

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4', 
      messages: [
    { role: 'system', content: 'You are a helpful assistant in a journaling app.' },
    ...messages,
  ],
    });

    const reply = response.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error('OpenAI API error:', err?.response?.data || err.message || err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

console.log('API Key:', process.env.OPENAI_API_KEY);

