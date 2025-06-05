const axios = require('axios');

module.exports = function (app) {
  app.get('/imagecreator/nulis', async (req, res) => {
    const { text, name, class: className } = req.query;

    if (!text || !name || !className) {
      return res.status(400).json({
        status: false,
        message: 'Parameter text, name, dan class wajib diisi. Contoh: /imagecreator/nulis?text=hai&name=fr3Devv&class=12%20A'
      });
    }

    try {
      const apiUrl = `https://api.siputzx.my.id/api/m/nulis?text=${encodeURIComponent(text)}&name=${encodeURIComponent(name)}&class=${encodeURIComponent(className)}`;
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
