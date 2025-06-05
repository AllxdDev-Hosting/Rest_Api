const axios = require('axios');

module.exports = function (app) {
  app.get('/game/tebaknegara', async (req, res) => {
    try {
      const { data } = await axios.get('https://api.siputzx.my.id/api/games/tebaknegara');
      res.json({ status: true, game: 'Tebak Negara', result: data.result });
    } catch (err) {
      res.status(500).json({ status: false, message: 'Gagal mengambil data tebak negara', error: err.message });
    }
  });
};
