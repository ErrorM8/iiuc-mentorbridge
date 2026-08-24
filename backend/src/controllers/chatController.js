const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ message: 'Message required' });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.6-flash',
      systemInstruction: `You are an AI Career Mentor for IIUC MentorBridge — a platform for students and alumni of International Islamic University Chittagong (IIUC), Bangladesh.

Your role:
- Help students with career guidance, internship hunting, and job preparation
- Assist with academic topics: programming, CSE, EEE, BBA, and other IIUC departments
- Give advice on CGPA improvement, time management, and study strategies
- Help with technical topics: coding, debugging, project ideas
- Suggest resources, courses, and certifications relevant to Bangladeshi job market
- Be encouraging, practical, and culturally relevant to Bangladeshi students

Keep responses concise but helpful. Use bullet points when listing. Respond in English unless the user writes in Bengali, then respond in Bengali.`,
    });

    const chatHistory = history
      .filter(m => m.role && m.content)
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const chatSession = model.startChat({ history: chatHistory });
    const result = await chatSession.sendMessage(message);
    const reply = result.response.text();

    res.json({ reply, message: reply });
  } catch (error) {
    console.error('Gemini chat error:', error.message);
    res.status(500).json({ message: 'AI service error', error: error.message });
  }
};

module.exports = { chat };