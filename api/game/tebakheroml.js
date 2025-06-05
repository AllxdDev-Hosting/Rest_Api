const axios = require('axios');

module.exports = function (app) {
  app.get('/game/tebakheroml', async (req, res) => {
    try {
      const { data } = await axios.get('https://api.siputzx.my.id/api/games/tebakheroml');
      res.json({ status: true, game: 'Tebak Hero ML', result: data.result });
    } catch (err) {
      res.status(500).json({ status: false, message: 'Gagal mengambil data tebak hero ML', error: err.message });
    }
  });
};
