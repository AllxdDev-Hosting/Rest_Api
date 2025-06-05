
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const CACHE_PATH = path.join(__dirname, '../cache/cnbc.json');

module.exports = function (app) {
  app.get('/berita/cnbc', async (req, res) => {
    try {
      const response = await axios.get('https://www.cnbcindonesia.com/');
      const $ = cheerio.load(response.data);
      const results = [];

      $('.box-text h2 a').each((_, el) => {
        const title = $(el).text().trim();
        const url = $(el).attr('href');
        if (title && url && url.startsWith('http')) results.push({ title, url });
      });

      if (results.length > 0) {
        fs.writeFileSync(CACHE_PATH, JSON.stringify({ source: 'CNBC Indonesia', result: results }, null, 2));
        return res.json({ status: true, source: 'CNBC Indonesia', result: results.slice(0, 10) });
      } else {
        throw new Error('Tidak ada berita terbaru hari ini');
      }
    } catch (err) {
      if (fs.existsSync(CACHE_PATH)) {
        const cached = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
        return res.json({
          status: true,
          source: 'CNBC Indonesia (cached)',
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
