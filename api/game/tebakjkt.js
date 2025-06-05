const axios = require('axios');

module.exports = function (app) {
  app.get('/game/tebakjkt', async (req, res) => {
    try {
      const apiUrl = 'https://api.siputzx.my.id/api/games/tebakjkt';
      const response = await axios.get(apiUrl);
      
      res.json({
        status: true,
        game: 'Tebak Member JKT48',
        result: response.data.result // hasil dari API: { url: ..., nama: ... }
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
