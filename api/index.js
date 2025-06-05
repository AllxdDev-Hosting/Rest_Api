const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  const filePath = path.join(__dirname, '../index.html');
  try {
    const html = fs.readFileSync(filePath, 'utf8');
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (err) {
    res.status(500).json({ status: false, message: 'Error loading homepage' });
  }
};
