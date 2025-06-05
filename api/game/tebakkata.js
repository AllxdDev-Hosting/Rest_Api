const axios = require('axios');

module.exports = function (app) {
  app.get('/game/tebakkata', async (req, res) => {
    try {
      const { data } = await axios.get('https://api.siputzx.my.id/api/games/tebakkata');
      res.json({ status: true, game: 'Tebak Kata', result: data.result });
    } catch (err) {
      res.status(500).json({ status: false, message: 'Gagal mengambil data tebak kata', error: err.message });
    }
  });
};
