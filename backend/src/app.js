const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const connectionRoutes = require('./routes/connectionRoutes');
const postRoutes = require('./routes/postRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const marketRoutes = require('./routes/marketRoutes');
const bloodRoutes = require('./routes/bloodRoutes');
const newsRoutes = require('./routes/newsRoutes');


const app = express();

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'], credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/blood', bloodRoutes);
app.use('/api/news', newsRoutes);


app.get('/', (req, res) => {
  res.json({ message: 'MentorBridge API is running!' });
});
// IIUC News proxy route
app.get('/api/news/iiuc', async (req, res) => {
  try {
    // Return curated news — real scraping needs separate service
    const news = [
      { title: 'IIUC Spring 2026 Admission Open', date: '2026-08-10', url: 'https://www.iiuc.ac.bd/web/news' },
      { title: 'Annual Sports Week Schedule Released', date: '2026-08-08', url: 'https://www.iiuc.ac.bd/web/news' },
      { title: 'New Computer Lab Inaugurated at CSE Dept', date: '2026-08-05', url: 'https://www.iiuc.ac.bd/web/news' },
      { title: 'Semester Final Exam Schedule Published', date: '2026-08-01', url: 'https://www.iiuc.ac.bd/web/news' },
    ];
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch news' });
  }
});

module.exports = app;