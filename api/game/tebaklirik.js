const axios = require('axios');

module.exports = function (app) {
  app.get('/game/tebaklirik', async (req, res) => {
    try {
      const { data } = await axios.get('https://api.siputzx.my.id/api/games/tebaklirik');
      res.json({ status: true, game: 'Tebak Lirik Lagu', result: data.result });
    } catch (err) {
      res.status(500).json({ status: false, message: 'Gagal mengambil data tebak lirik', error: err.message });
    }
  });
};
