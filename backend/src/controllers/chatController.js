const Groq = require('groq-sdk');
const prisma = require('../prismaClient');
const multer = require('multer');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

const chat = async (req, res) => {
  try {
    const { message } = req.body;

    let resourceContext = '';
    try {
      const resources = await prisma.resource.findMany({
        where: {
          OR: [
            { course: { code: { contains: message.split(' ')[0], mode: 'insensitive' } } },
            { title: { contains: message, mode: 'insensitive' } },
            { course: { name: { contains: message, mode: 'insensitive' } } }
          ]
        },
        include: { course: true },
        take: 3
      });

      if (resources.length > 0) {
        resourceContext = '\n\nRelevant course resources:\n' +
          resources.map(r => `- ${r.course?.code}: "${r.title}"\n  Summary: ${r.aiSummary?.slice(0, 300) || 'No summary'}`).join('\n');
      }
    } catch (e) { console.log('Resource search skipped'); }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a helpful career mentor and academic assistant for IIUC students on MentorBridge. Help with career guidance, internship advice, courses, and university life. Keep responses helpful and concise.${resourceContext}`
        },
        { role: 'user', content: message }
      ],
      max_tokens: 600,
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ message: 'AI error', error: error.message });
  }
};

const chatWithFile = async (req, res) => {
  try {
    const { message } = req.body;
    let fileContext = '';

    if (req.file) {
      if (req.file.mimetype === 'application/pdf') {
        try {
          const pdfParse = require('pdf-parse');
          const pdfData = await pdfParse(req.file.buffer);
          fileContext = `\n\nUser uploaded a PDF file. Content:\n${pdfData.text.slice(0, 3000)}`;
        } catch (e) {
          fileContext = `\n\nUser uploaded a PDF file named: ${req.file.originalname}`;
        }
      } else if (req.file.mimetype.startsWith('image/')) {
        fileContext = `\n\nUser uploaded an image file named: ${req.file.originalname}. Please acknowledge and help them.`;
      }
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a helpful career mentor and academic assistant for IIUC students. Analyze any provided files and help students understand the content.${fileContext}`
        },
        { role: 'user', content: message || 'Please analyze this file and explain what it contains.' }
      ],
      max_tokens: 800,
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ message: 'AI error', error: error.message });
  }
};

module.exports = { chat, chatWithFile, upload };