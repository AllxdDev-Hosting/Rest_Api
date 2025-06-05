const axios = require('axios');

module.exports = function (app) {
  app.get('/game/matematika', async (req, res) => {
    try {
      const { data } = await axios.get('https://api.siputzx.my.id/api/games/matematika');
      res.json({ status: true, game: 'Soal Matematika', result: data.result });
    } catch (err) {
      res.status(500).json({ status: false, message: 'Gagal mengambil soal matematika', error: err.message });
    }
  });
};
