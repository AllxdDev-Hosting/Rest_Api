const axios = require('axios');

module.exports = function (app) {
  app.get('/imagecreator/to-hijab', async (req, res) => {
    const { imageUrl } = req.query;

    if (!imageUrl) {
      return res.status(400).json({
        status: false,
        message: 'Parameter imageUrl wajib diisi. Contoh: /imagecreator/to-hijab?imageUrl=https://example.com/image.jpg'
      });
    }

    try {
      const apiUrl = `https://api.nekorinn.my.id/tools/to-hijab?imageUrl=${encodeURIComponent(imageUrl)}`;
      const response = await axios.get(apiUrl, {
        responseType: 'arraybuffer'
      });

      res.set('Content-Type', 'image/png');
      res.send(response.data);
    } catch (err) {
      res.status(500).json({
        status: false,
        message: 'Gagal mengakses API to-hijab',
        error: err.message
      });
    }
  });
};
