const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

const IIUC_NEWS_URL = 'https://www.iiuc.ac.bd/web/news';

const scrapeIIUCNews = async () => {
  try {
    const response = await axios.get(IIUC_NEWS_URL, {
      timeout: 20000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    const $ = cheerio.load(response.data);

    const news = [];

    // সব link থেকে news খোঁজা
    $('a').each((index, element) => {
      if (news.length >= 10) return false;

      const $link = $(element);

      const title = $link
        .text()
        .replace(/\s+/g, ' ')
        .trim();

      const href = $link.attr('href');

      // Invalid link বাদ
      if (!href) return;

      // খুব ছোট বা menu type text বাদ
      if (title.length < 15 || title.length > 250) return;

      // Navigation links বাদ
      const lowerTitle = title.toLowerCase();

      const ignoredTexts = [
        'home',
        'about',
        'contact',
        'login',
        'register',
        'read more',
        'view all',
        'menu',
        'search',
        'admission',
        'notice',
      ];

      if (ignoredTexts.includes(lowerTitle)) return;

      // শুধুমাত্র news related link নেওয়া
      const isNewsLink =
        href.includes('/news') ||
        href.includes('news/') ||
        href.includes('/web/news');

      if (!isNewsLink) return;

      let fullUrl = href;

      if (!href.startsWith('http')) {
        fullUrl = new URL(href, 'https://www.iiuc.ac.bd').href;
      }

      // Duplicate check
      const alreadyExists = news.some(
        (item) =>
          item.title.toLowerCase() === title.toLowerCase()
      );

      if (alreadyExists) return;

      // কাছাকাছি parent element থেকে date খোঁজা
      const parentText = $link
        .parent()
        .parent()
        .text()
        .replace(/\s+/g, ' ')
        .trim();

      // সম্ভাব্য date pattern
      const dateMatch = parentText.match(
        /(\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})|(\d{4}-\d{2}-\d{2})|(\d{1,2}\/\d{1,2}\/\d{4})/i
      );

      let date = null;

      if (dateMatch) {
        date = new Date(dateMatch[0]);

        if (isNaN(date.getTime())) {
          date = null;
        }
      }

      news.push({
        title,
        url: fullUrl,
        date: date ? date.toISOString() : null,
        source: 'IIUC Official',
      });
    });

    console.log(`✅ IIUC News scraped: ${news.length}`);

    return news;
  } catch (error) {
    console.error(
      '❌ IIUC news scraping error:',
      error.message
    );

    return [];
  }
};


// GET LATEST IIUC NEWS

router.get('/iiuc', async (req, res) => {
  try {
    const news = await scrapeIIUCNews();

    if (!news || news.length === 0) {
      return res.status(200).json({
        success: false,
        message: 'No news found',
        news: [],
      });
    }

    // Latest first
    const sortedNews = news.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;

      return new Date(b.date) - new Date(a.date);
    });

    res.json({
      success: true,
      total: sortedNews.length,
      news: sortedNews.slice(0, 6),
    });
  } catch (error) {
    console.error('News API error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch IIUC news',
      news: [],
    });
  }
});


module.exports = router;