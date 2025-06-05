const axios = require('axios');

module.exports = function (app) {
  app.get('/tools/morse2text', async (req, res) => {
    const { morse } = req.query;

    if (!morse) {
      return res.status(400).json({
        status: false,
        message: 'Parameter "morse" wajib diisi. Contoh: /tools/morse2text?morse=.... .- .-.. ---'
      });
    }

    try {
      const apiUrl = `https://api.nekorinn.my.id/tools/morse2text?text=${encodeURIComponent(morse)}`;
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
