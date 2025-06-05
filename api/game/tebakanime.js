const axios = require('axios');

module.exports = function (app) {
  app.get('/game/tebakanime', async (req, res) => {
    try {
      const apiUrl = 'https://api.siputzx.my.id/api/games/tebakanime';
      const response = await axios.get(apiUrl);

      res.json({
        status: true,
        game: 'Tebak Anime',
        result: response.data.result // berisi { url: ..., name: ... }
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: 'Gagal mengambil data dari API eksternal',
        error: err.message
      });
    }
  });
};
