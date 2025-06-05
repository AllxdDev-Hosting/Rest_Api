const axios = require('axios');

module.exports = function (app) {
  app.get('/tools/text2morse', async (req, res) => {
    const { text } = req.query;

    if (!text) {
      return res.status(400).json({
        status: false,
        message: 'Parameter "text" wajib diisi. Contoh: /tools/text2morse?text=halo dunia'
      });
    }

    try {
      const apiUrl = `https://api.nekorinn.my.id/tools/text2morse?text=${encodeURIComponent(text)}`;
      const response = await axios.get(apiUrl);

      res.json({
        status: true,
        result: response.data.result || response.data
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
