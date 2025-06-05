const axios = require('axios');

module.exports = function (app) {
  app.get('/tools/convert-uang', async (req, res) => {
    const { from, to, amount } = req.query;

    // Validasi input
    if (!from || !to || !amount) {
      return res.status(400).json({
        status: false,
        message: 'Parameter kurang! Contoh: /tools/convert-uang?from=USD&to=IDR&amount=100'
      });
    }

    try {
      // Pakai ExchangeRate-API (gratis)
      const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${from}`);
      const rate = response.data.rates[to];
      
      if (!rate) {
        return res.status(400).json({
          status: false,
          message: 'Mata uang tidak didukung!'
        });
      }

      const result = (amount * rate).toFixed(2);

      res.json({
        status: true,
        data: {
          from: from,
          to: to,
          amount: amount,
          rate: rate,
          result: result
        }
      });

    } catch (error) {
      res.status(500).json({
        status: false,
        message: 'Gagal konversi mata uang',
        error: error.message
      });
    }
  });
};
