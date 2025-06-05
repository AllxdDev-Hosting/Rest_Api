
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const CACHE_PATH = path.join(__dirname, '../cache/jkt48.json');

module.exports = function (app) {
  app.get('/berita/jkt48', async (req, res) => {
    try {
      const response = await axios.get('https://jkt48.com/news/list?lang=id');
      const $ = cheerio.load(response.data);
      const results = [];

      $('.newsList li').each((_, el) => {
        const title = $(el).find('a').text().trim();
        const href = $(el).find('a').attr('href');
        if (title && href) {
          results.push({ title, url: 'https://jkt48.com' + href });
        }
      });

      if (results.length > 0) {
        fs.writeFileSync(CACHE_PATH, JSON.stringify({ source: 'JKT48 News', result: results }, null, 2));
        return res.json({ status: true, source: 'JKT48 News', result: results.slice(0, 10) });
      } else {
        throw new Error('Tidak ada berita terbaru hari ini');
      }
    } catch (err) {
      if (fs.existsSync(CACHE_PATH)) {
        const cached = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
        return res.json({
          status: true,
          source: 'JKT48 News (cached)',
          cached: true,
          result: cached.result.slice(0, 10)
        });
      }

      res.status(500).json({
        status: false,
        message: 'Gagal ambil data & tidak ada cache',
        error: err.message
      });
    }
  });
};
