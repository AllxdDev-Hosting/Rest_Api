const axios = require('axios');

module.exports = function (app) {
  app.get('/imagecreator/text2anime', async (req, res) => {
    const { text, ratio } = req.query;

    if (!text) {
      return res.status(400).json({
        status: false,
        message: 'Parameter "text" wajib diisi. Contoh: /ai/text2anime?text=anime girl di taman&ratio=1:1'
      });
    }

    try {
      let apiUrl = `https://api.nekorinn.my.id/ai-img/text2anime?text=${encodeURIComponent(text)}`;
      if (ratio) apiUrl += `&ratio=${encodeURIComponent(ratio)}`;

      const response = await axios.get(apiUrl, {
        responseType: 'arraybuffer'
      });

      res.set('Content-Type', 'image/png');
      res.send(response.data);
    } catch (err) {
      res.status(500).json({
        status: false,
        message: 'Gagal mengambil gambar dari API eksternal',
        error: err.message
      });
    }
  });
};
