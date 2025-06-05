const axios = require('axios');

module.exports = function (app) {
  app.get('/random/cek-nomor', async (req, res) => {
    const { nomor } = req.query;

    // Validasi input
    if (!nomor) {
      return res.status(400).json({
        status: false,
        message: 'Masukkan nomor HP! Contoh: /cek-nomor?nomor=081234567890'
      });
    }

    // Pastikan nomor valid (minimal 10 digit, maksimal 14)
    const cleanNumber = nomor.replace(/\D/g, '');
    if (cleanNumber.length < 10 || cleanNumber.length > 14) {
      return res.status(400).json({
        status: false,
        message: 'Nomor HP tidak valid!'
      });
    }

    try {
      // Deteksi operator berdasarkan prefix (ini data statis)
      const prefix = cleanNumber.substring(0, 4);
      const operatorData = {
        '0811': { name: 'Telkomsel - Halo', type: 'Postpaid' },
        '0812': { name: 'Telkomsel - Simpati', type: 'Prepaid' },
        '0813': { name: 'Telkomsel - Kartu As', type: 'Prepaid' },
        '0821': { name: 'Telkomsel - Simpati', type: 'Prepaid' },
        '0822': { name: 'Telkomsel - Loop', type: 'Prepaid' },
        '0852': { name: 'Telkomsel - By.U', type: 'Prepaid' },
        '0853': { name: 'Telkomsel - Kartu As', type: 'Prepaid' },
        '0814': { name: 'Indosat - Matrix', type: 'Prepaid' },
        '0815': { name: 'Indosat - Mentari', type: 'Prepaid' },
        '0816': { name: 'Indosat - IM3', type: 'Prepaid' },
        '0817': { name: 'XL', type: 'Prepaid' },
        '0818': { name: 'XL', type: 'Prepaid' },
        '0819': { name: 'XL', type: 'Prepaid' },
        '0823': { name: 'Axis', type: 'Prepaid' },
        '0828': { name: 'Smartfren', type: 'Prepaid' },
        '0831': { name: 'Axis', type: 'Prepaid' },
        '0838': { name: 'Smartfren', type: 'Prepaid' },
        '0851': { name: 'XL', type: 'Prepaid' },
        '0855': { name: 'Indosat - IM3', type: 'Prepaid' },
        '0856': { name: 'Indosat - IM3', type: 'Prepaid' },
        '0857': { name: 'XL', type: 'Prepaid' },
        '0858': { name: 'XL', type: 'Prepaid' },
        '0859': { name: 'XL', type: 'Prepaid' },
        '0877': { name: 'XL', type: 'Prepaid' },
        '0878': { name: 'XL', type: 'Prepaid' },
        '0895': { name: '3 (Tri)', type: 'Prepaid' },
        '0896': { name: '3 (Tri)', type: 'Prepaid' },
        '0897': { name: '3 (Tri)', type: 'Prepaid' },
        '0898': { name: 'Smartfren', type: 'Prepaid' },
        '0899': { name: 'Smartfren', type: 'Prepaid' },
        '0881': { name: 'Smartfren', type: 'Prepaid' },
        '0882': { name: 'Smartfren', type: 'Prepaid' },
        '0883': { name: 'Smartfren', type: 'Prepaid' },
        '0884': { name: 'Smartfren', type: 'Prepaid' },
        '0885': { name: 'Smartfren', type: 'Prepaid' },
        '0886': { name: 'Smartfren', type: 'Prepaid' },
        '0887': { name: 'Smartfren', type: 'Prepaid' },
        '0888': { name: 'Smartfren', type: 'Prepaid' },
        '0889': { name: 'Smartfren', type: 'Prepaid' }
      };

      const operator = operatorData[prefix] || { name: 'Tidak Diketahui', type: 'Tidak Diketahui' };

      // Deteksi lokasi (kota) berdasarkan prefix (contoh sederhana)
      const locationData = {
        '0811': 'Jakarta',
        '0812': 'Jawa Barat',
        '0813': 'Jawa Tengah',
        '0821': 'Sumatera Utara',
        '0852': 'Kalimantan Timur',
        '0853': 'Bali',
        '0814': 'Sulawesi Selatan',
        '0815': 'Jawa Timur',
        '0817': 'Banten',
        '0818': 'Lampung',
        '0823': 'Sumatera Barat',
        '0838': 'Nusa Tenggara Barat',
        '0856': 'Papua',
        '0857': 'Maluku',
        '0895': 'Jawa Barat',
        '0898': 'Jakarta'
      };

      const location = locationData[prefix] || 'Tidak Diketahui';

      // Format response
      res.json({
        status: true,
        data: {
          nomor: cleanNumber,
          operator: operator.name,
          tipe: operator.type,
          lokasi_perkiraan: location,
          catatan: 'Data lokasi hanya perkiraan berdasarkan prefix nomor.'
        }
      });

    } catch (error) {
      res.status(500).json({
        status: false,
        message: 'Gagal memproses nomor HP!',
        error: error.message
      });
    }
  });
};
