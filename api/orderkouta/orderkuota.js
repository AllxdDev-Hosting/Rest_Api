// Import necessary libraries
const axios = require('axios');
const crypto = require("crypto");
const QRCode = require('qrcode');
const sharp = require('sharp'); // <-- Added for image manipulation
const { ImageUploadService } = require('node-upload-images');

/**
 * Calculates the CRC16 checksum for a given string.
 * This is part of the QRIS standard.
 * @param {string} str The input string.
 * @returns {string} The 4-character uppercase hex representation of the CRC16.
 */
function convertCRC16(str) {
    let crc = 0xFFFF;
    const strlen = str.length;

    for (let c = 0; c < strlen; c++) {
        crc ^= str.charCodeAt(c) << 8;
        for (let i = 0; i < 8; i++) {
            if (crc & 0x8000) {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc = crc << 1;
            }
        }
    }

    let hex = crc & 0xFFFF;
    hex = ("000" + hex.toString(16).toUpperCase()).slice(-4);
    return hex;
}

/**
 * Generates a unique transaction ID.
 * @returns {string} A formatted transaction ID.
 */
function generateTransactionId() {
    return `AllxdDev-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
}

/**
 * Generates an expiration timestamp 30 minutes from now.
 * @returns {Date} The expiration date and time.
 */
function generateExpirationTime() {
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 30);
    return expirationTime;
}

/**
 * Uploads a file buffer to an image hosting service.
 * @param {Buffer} buffer The image buffer to upload.
 * @returns {Promise<string>} The direct link to the uploaded image.
 */
async function elxyzFile(buffer) {
    return new Promise(async (resolve, reject) => {
        try {
            const service = new ImageUploadService('pixhost.to');
            // Uploads the buffer with a specified filename
            let { directLink } = await service.uploadFromBinary(buffer, 'qris-with-logo.png');
            resolve(directLink);
        } catch (error) {
            console.error('🚫 Upload Failed:', error);
            reject(error);
        }
    });
}

/**
 * Generates a QRIS code string with a dynamic amount.
 * @param {string} baseCode The base QRIS string without amount and CRC.
 * @param {string|number} amount The transaction amount.
 * @returns {string} The final, valid QRIS string.
 */
function constructQRISString(baseCode, amount) {
    // Ensure amount is a string
    const amountStr = String(amount);
    
    // Per QRIS standard, the amount is encoded in tag '54'
    // Format: [Tag '54'][Length of amount][Amount]
    const amountTag = "54" + ("0" + amountStr.length).slice(-2) + amountStr;

    // Reconstruct the QRIS string with the dynamic amount
    const qrisParts = baseCode.split("5802ID");
    const stringToHash = qrisParts[0] + amountTag + "5802ID" + qrisParts[1];
    
    // Calculate the new CRC16 checksum and append it
    const finalQRIS = stringToHash + convertCRC16(stringToHash);

    return finalQRIS;
}


/**
 * Generates a QR code, overlays a logo in the center, and returns the image as a buffer.
 * @param {string} qrisString The full QRIS string to encode.
 * @param {string} logoUrl The URL of the logo to overlay.
 * @returns {Promise<Buffer>} A buffer of the final PNG image.
 */
async function createQRImageWithLogo(qrisString, logoUrl) {
    try {
        // 1. Generate the QR code buffer with the highest error correction level.
        // This is crucial to ensure the QR code is still readable after adding a logo.
        const qrCodeBuffer = await QRCode.toBuffer(qrisString, {
            errorCorrectionLevel: 'H',
            type: 'png',
            margin: 1,
            scale: 8,
        });

        // 2. Fetch the logo image from the provided URL.
        const logoResponse = await axios.get(logoUrl, {
            responseType: 'arraybuffer'
        });
        const logoBuffer = Buffer.from(logoResponse.data, 'binary');

        // 3. Composite the logo onto the QR code using sharp.
        const qrImage = sharp(qrCodeBuffer);
        const metadata = await qrImage.metadata();
        
        // Resize logo to be ~25% of the QR code's width
        const logoWidth = Math.floor(metadata.width * 0.25);

        const finalImageBuffer = await qrImage
            .composite([{
                input: await sharp(logoBuffer).resize(logoWidth).toBuffer(),
                gravity: 'center', // Place the logo in the center
            }, ])
            .toBuffer();

        return finalImageBuffer;

    } catch (error) {
        console.error('Error creating QR image with logo:', error);
        throw error;
    }
}


/**
 * Main function to create a QRIS payment object.
 * It generates the QR code with a logo, uploads it, and returns the transaction details.
 * @param {string|number} amount The transaction amount.
 * @param {string} codeqr The static QRIS code string.
 * @returns {Promise<object>} An object containing transaction details and the QR image URL.
 */
async function createQRIS(amount, codeqr) {
    try {
        // Prepare the base QRIS string by removing the old CRC and setting it to dynamic (010212)
        const baseCode = codeqr.slice(0, -4).replace("010211", "010212");
        
        // Construct the full QRIS string with the new amount and CRC
        const finalQRISString = constructQRISString(baseCode, amount);
        
        // URL for your logo
        const logoUrl = 'https://chek-status-qris.vercel.app/logo.png';
        
        // Generate the QR code image buffer with the logo
        const imageBufferWithLogo = await createQRImageWithLogo(finalQRISString, logoUrl);
        
        // Upload the final image
        const uploadedFileUrl = await elxyzFile(imageBufferWithLogo);

        // Return the final transaction object
        return {
            idtransaksi: generateTransactionId(),
            jumlah: String(amount),
            expired: generateExpirationTime(),
            imageqris: {
                url: uploadedFileUrl
            }
        };
    } catch (error) {
        console.error('Error in createQRIS process:', error);
        throw error;
    }
}


// This function remains for checking mutation status. No changes needed here.
async function checkQRISStatus() {
    try {
        const apiUrl = `https://gateway.okeconnect.com/api/mutasi/qris/isi pakai merchant orkut/apikey orkut`;
        const response = await axios.get(apiUrl);
        const result = response.data;
        const data = result.data;
        let capt = '*Q R I S - M U T A S I*\n\n';
        if (data.length === 0) {
            capt += 'Tidak ada data mutasi.';
        } else {
            data.forEach(entry => {
                capt += '```Tanggal:```' + ` ${entry.date}\n`;
                capt += '```Issuer:```' + ` ${entry.brand_name}\n`;
                capt += '```Nominal:```' + ` Rp ${entry.amount}\n\n`;
            });
        }
        return capt;
    } catch (error) {
        console.error('Error checking QRIS status:', error);
        throw error;
    }
}


// Module export for use in an Express-like framework
module.exports = {
    name: 'Create Payment',
    desc: 'Create qr payment to orkut with a logo',
    category: 'Order Kuota',
    params: ['amount', 'codeqr'],
    async run(req, res) {
        const { amount, codeqr } = req.query;
        if (!amount) return res.status(400).json({ status: false, error: 'Amount is required' });
        if (!codeqr) return res.status(400).json({ status: false, error: 'QrCode is required' });
        
        try {
            // Call the main creation function
            const qrData = await createQRIS(amount, codeqr);
            res.status(200).json({
                status: true,
                result: qrData
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
};
