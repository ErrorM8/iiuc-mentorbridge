const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const chat = async (req, res) => {
  try {
    const { message } = req.body;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a helpful career mentor assistant for university students and alumni on MentorBridge platform. 
          Help students with career guidance, internship advice, job searching, skill development, and connecting with seniors.
          Keep responses concise and helpful.`
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 500,
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ message: 'AI error', error: error.message });
  }
};

module.exports = { chat };