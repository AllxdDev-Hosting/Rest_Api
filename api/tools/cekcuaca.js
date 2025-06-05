const axios = require('axios');

module.exports = function (app) {
  app.get('/tools/cekcuaca', async (req, res) => {
    const { kota } = req.query;
    if (!kota) return res.status(400).json({ status: false, message: 'Masukkan nama kota, contoh: /tools/cekcuaca?kota=bandung' });

    try {
      const { data } = await axios.get(`https://wttr.in/${encodeURIComponent(kota)}?format=j1`);

      const cuaca = data.current_condition[0];
      const kondisi = cuaca.weatherDesc[0].value;

      res.json({
        status: true,
        lokasi: kota,
        kondisi: kondisi,
        suhu: `${cuaca.temp_C}°C`,
        kelembaban: `${cuaca.humidity}%`,
        angin: `${cuaca.windspeedKmph} km/h`,
        info: 'Data diperoleh dari wttr.in'
      });

    } catch (e) {
      res.status(500).json({ status: false, message: 'Gagal mengambil data cuaca' });
    }
  });
};
