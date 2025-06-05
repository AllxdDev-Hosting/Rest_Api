const axios = require('axios');

module.exports = function (app) {
  app.get('/orderkouta/ceksaldo', async (req, res) => {
    const { memberID, pin, password } = req.query;

    if (!memberID || !pin || !password) {
      return res.status(400).json({
        status: false,
        message: 'Parameter memberID, pin, dan password wajib diisi'
      });
    }

    try {
      const url = `https://watashi.my.id/trx/balance?memberID=${memberID}&pin=${pin}&password=${password}`;
      const response = await axios.get(url);
      const rawText = response.data;

      // Ekstrak angka dari teks mentah
      const match = rawText.match(/Saldo\s([\d.]+)/i);
      if (!match) {
        return res.status(500).json({
          status: false,
          message: 'Gagal mengambil atau memproses data saldo'
        });
      }

      const saldo = parseFloat(match[1]);

      res.json({
        status: true,
        saldo: saldo,
        creator: 'allxddev'
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: 'Terjadi kesalahan saat mengambil data',
        error: error.message
      });
    }
  });
};
