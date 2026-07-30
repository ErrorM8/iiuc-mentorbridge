const Groq = require('groq-sdk');
const prisma = require('../prismaClient');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const chat = async (req, res) => {
  try {
    const { message } = req.body;

    // Search relevant resources
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
        resourceContext = '\n\nRelevant course resources found:\n' +
          resources.map(r => `- ${r.course?.code}: "${r.title}"\n  Summary: ${r.aiSummary?.slice(0, 300) || 'No summary available'}`).join('\n');
      }
    } catch (e) { console.log('Resource search skipped'); }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a helpful career mentor and academic assistant for IIUC students on MentorBridge platform. 
Help students with career guidance, internship advice, job searching, skill development, and course-related questions.
If course resources are available, use them to provide more accurate answers.
Keep responses concise and helpful.${resourceContext}`
        },
        { role: 'user', content: message }
      ],
      max_tokens: 600,
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ message: 'AI error', error: error.message });
  }
};

module.exports = { chat };