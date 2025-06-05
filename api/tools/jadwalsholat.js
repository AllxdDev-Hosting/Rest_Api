const axios = require('axios');

module.exports = function (app) {
  app.get('/tools/jadwalsholat', async (req, res) => {
    const { kota } = req.query;
    if (!kota) {
      return res.status(400).json({
        status: false,
        message: 'Masukkan nama kota, contoh: /tools/jadwalsholat?kota=bandung'
      });
    }

    try {
      // Cari ID kota
      const search = await axios.get(`https://api.myquran.com/v1/sholat/kota/cari/${encodeURIComponent(kota)}`);
      const found = search.data.data.find(k => k.lokasi.toLowerCase().includes(kota.toLowerCase()));

      if (!found) {
        return res.status(404).json({ status: false, message: 'Kota tidak ditemukan' });
      }

      const today = new Date().toISOString().split('T')[0]; // format YYYY-MM-DD
      const { data } = await axios.get(`https://api.myquran.com/v1/sholat/jadwal/${found.id}/${today}`);

      const jadwal = data.data.jadwal;

      res.json({
        status: true,
        kota: found.lokasi,
        tanggal: jadwal.tanggal,
        jadwal: {
          imsak: jadwal.imsak,
          subuh: jadwal.subuh,
          dzuhur: jadwal.dzuhur,
          ashar: jadwal.ashar,
          maghrib: jadwal.maghrib,
          isya: jadwal.isya
        }
      });

    } catch (e) {
      res.status(500).json({ status: false, message: 'Gagal mengambil data jadwal sholat' });
    }
  });
};
