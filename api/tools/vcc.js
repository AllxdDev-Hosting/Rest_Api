const axios = require('axios');

module.exports = function (app) {
  app.get('/tools/vcc', async (req, res) => {
    try {
      const response = await axios.get('https://api.siputzx.my.id/api/tools/vcc');
      res.json({
        status: true,
        message: 'Virtual Credit Card generated',
        result: response.data.result
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: 'Gagal mengambil data VCC',
        error: err.message
      });
    }
  });
};
