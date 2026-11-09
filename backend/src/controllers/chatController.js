const { GoogleGenerativeAI } = require('@google/generative-ai');

const SYSTEM_PROMPT = `You are an AI Career Mentor for IIUC MentorBridge — a platform for students and alumni of International Islamic University Chittagong (IIUC), Bangladesh.

Your role:
- Help students with career guidance, internship hunting, and job preparation
- Assist with academic topics: programming, CSE, EEE, BBA, and other IIUC departments
- Give advice on CGPA improvement, time management, and study strategies
- Help with technical topics: coding, debugging, project ideas
- Suggest resources, courses, and certifications relevant to the Bangladeshi job market
- Be encouraging, practical, and culturally relevant to Bangladeshi students

Keep responses concise but helpful. Use bullet points when listing. Respond in English unless the user writes in Bengali, then respond in Bengali.`;

// Models are tried in order; the first one that works is used.
const MODELS = [
  process.env.GEMINI_MODEL || 'gemini-3.6-flash',
  'gemini-2.5-flash',
];

// Gemini requires: history starts with a 'user' turn, and roles alternate.
const cleanHistory = (history) => {
  const mapped = (Array.isArray(history) ? history : [])
    .filter(m => m && m.content && String(m.content).trim())
    .map(m => ({
      role: (m.role === 'assistant' || m.role === 'model') ? 'model' : 'user',
      parts: [{ text: String(m.content) }],
    }));

  // drop leading model messages (e.g. the welcome greeting)
  while (mapped.length && mapped[0].role !== 'user') mapped.shift();

  // merge consecutive messages with the same role
  const result = [];
  for (const m of mapped) {
    const last = result[result.length - 1];
    if (last && last.role === m.role) {
      last.parts[0].text += '\n' + m.parts[0].text;
    } else {
      result.push(m);
    }
  }

  // history must end with a 'model' turn, because the new message is a 'user' turn
  while (result.length && result[result.length - 1].role !== 'model') result.pop();

  return result;
};

const chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message || !String(message).trim()) {
      return res.status(400).json({ message: 'Message required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY is not set');
      return res.status(503).json({ message: 'AI service not configured' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const chatHistory = cleanHistory(history);

    let lastError = null;
    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: SYSTEM_PROMPT,
        });
        const session = model.startChat({ history: chatHistory });
        const result = await session.sendMessage(String(message));
        const reply = result.response.text();
        return res.json({ reply, message: reply });
      } catch (err) {
        lastError = err;
        console.error(`Gemini [${modelName}] failed:`, err.message);
      }
    }

    // all models failed
    res.status(500).json({
      message: 'AI service error',
      error: lastError?.message || 'Unknown error',
    });
  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ message: 'AI service error', error: error.message });
  }
};

module.exports = { chat };