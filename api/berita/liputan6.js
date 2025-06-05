
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const CACHE_PATH = path.join(__dirname, '../cache/liputan6.json');

module.exports = function (app) {
  app.get('/berita/liputan6', async (req, res) => {
    try {
      const response = await axios.get('https://www.liputan6.com/');
      const $ = cheerio.load(response.data);
      const results = [];

      $('article a').each((_, el) => {
        const title = $(el).find('img').attr('alt');
        const url = $(el).attr('href');
        if (title && url && url.startsWith('https://')) results.push({ title, url });
      });

      if (results.length > 0) {
        fs.writeFileSync(CACHE_PATH, JSON.stringify({ source: 'Liputan6', result: results }, null, 2));
        return res.json({ status: true, source: 'Liputan6', result: results.slice(0, 10) });
      } else {
        throw new Error('Tidak ada berita terbaru hari ini');
      }
    } catch (err) {
      if (fs.existsSync(CACHE_PATH)) {
        const cached = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
        return res.json({
          status: true,
          source: 'Liputan6 (cached)',
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
