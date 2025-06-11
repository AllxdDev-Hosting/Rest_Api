// A more secure and maintainable approach to your QRIS generation and payment status API.

// Import necessary modules.
// 'axios' is for making HTTP requests to external APIs.
// 'crypto' is for generating secure random values.
// 'qrcode' is for generating QR code images.
// 'node-upload-images' is for uploading the generated QR code.
const axios = require('axios');
const crypto = require('crypto');
const QRCode = require('qrcode');
const { ImageUploadService } = require('node-upload-images');

/**
 * Calculates the CRC-16/X-25 checksum for a given string.
 * This is a crucial part of the QRIS standard to ensure data integrity.
 * @param {string} str The input string to checksum.
 * @returns {string} The 4-character hexadecimal representation of the CRC checksum.
 */
function calculateCRC16(str) {
    let crc = 0xFFFF;
    for (let c = 0; c < str.length; c++) {
        crc ^= str.charCodeAt(c) << 8;
        for (let i = 0; i < 8; i++) {
            if (crc & 0x8000) {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc <<= 1;
            }
        }
    }
    // Ensure the output is a 4-digit hex string, padded with leading zeros if necessary.
    return ("000" + (crc & 0xFFFF).toString(16).toUpperCase()).slice(-4);
}

/**
 * Generates a more unique transaction ID.
 * Combines a static prefix with a timestamp and random bytes for better collision avoidance.
 * @returns {string} A unique transaction ID.
 */
function generateTransactionId() {
    const timestamp = Date.now();
    const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `ALLXD-DEV-${timestamp}-${randomPart}`;
}

/**
 * Calculates the expiration time for a transaction.
 * @param {number} minutes The number of minutes from now when the QR code should expire.
 * @returns {Date} The expiration date and time.
 */
function generateExpirationTime(minutes = 30) {
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + minutes);
    return expirationTime;
}

/**
 * Asynchronously uploads an image buffer to an image hosting service.
 * @param {Buffer} buffer The image data to upload.
 * @returns {Promise<string>} A promise that resolves to the direct URL of the uploaded image.
 */
async function uploadImage(buffer) {
    try {
        // Renamed from the obscure 'elxyzFile' to be more descriptive.
        const service = new ImageUploadService('pixhost.to');
        const { directLink } = await service.uploadFromBinary(buffer, 'qris-payment.png');
        return directLink;
    } catch (error) {
        console.error('🚫 Image Upload Failed:', error);
        // Re-throw the error to be handled by the calling function.
        throw new Error('Failed to upload QR code image.');
    }
}

/**
 * Generates a dynamic QRIS code by injecting a specific amount into a base QRIS string.
 * This function consolidates the logic from the original `generateQRIS` and `createQRIS`.
 *
 * @param {string} baseQrisData The static QRIS string from your payment provider.
 * @param {number|string} amount The transaction amount.
 * @returns {Promise<object>} An object containing the transaction details and the QR image URL.
 */
async function createDynamicQRIS(baseQrisData, amount) {
    if (!baseQrisData || typeof baseQrisData !== 'string' || baseQrisData.length < 10) {
        throw new Error('Invalid base QRIS data provided.');
    }
     if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid amount provided. Must be a positive number.');
    }

    try {
        // Prepare the QRIS data string for amount injection.
        // The QRIS standard requires a specific format for dynamic amounts.
        let processedQris = baseQrisData.slice(0, -4); // Remove original CRC checksum.
        processedQris = processedQris.replace("010211", "010212"); // Mark as dynamic QR.

        const parts = processedQris.split("5802ID");
        if (parts.length !== 2) {
            throw new Error('QRIS data string has an unexpected format.');
        }

        // Format the amount field according to the QRIS standard (Tag '54').
        const amountStr = amount.toString();
        const amountField = "54" + ("0" + amountStr.length).slice(-2) + amountStr;

        // Reassemble the final QRIS string.
        const finalQrisString = parts[0] + amountField + "5802ID" + parts[1];

        // Calculate the new CRC checksum for the final string.
        const crc = calculateCRC16(finalQrisString);

        // Generate the QR code image buffer.
        const qrBuffer = await QRCode.toBuffer(finalQrisString + crc);

        // Upload the image and get the URL.
        const imageUrl = await uploadImage(qrBuffer);

        // Return a standardized response object.
        return {
            transactionId: generateTransactionId(),
            amount: Number(amount),
            expiresAt: generateExpirationTime(30), // Expires in 30 minutes.
            qrImageUrl: imageUrl
        };
    } catch (error) {
        console.error('Error generating dynamic QRIS code:', error);
        throw error; // Propagate the error up.
    }
}

/**
 * Checks the latest transaction status from the payment gateway.
 * @param {string} merchantId Your merchant ID.
 * @param {string} apiKey Your API key for the payment gateway.
 * @returns {Promise<object>} The latest transaction data.
 */
async function checkLatestTransaction(merchantId, apiKey) {
    try {
        const apiUrl = `https://gateway.okeconnect.com/api/mutasi/qris/${merchantId}/${apiKey}`;
        const response = await axios.get(apiUrl);

        if (response.data && response.data.success && response.data.data.length > 0) {
             // Assuming the first item is the latest transaction.
            return response.data.data[0];
        } else {
            return null; // No transactions found or API error.
        }
    } catch (error) {
        console.error('Error checking transaction status:', error.message);
        throw new Error('Could not fetch transaction status from the gateway.');
    }
}


// --- Express API Route Definitions ---
// This function sets up the API endpoints in your Express application.
module.exports = function(app) {
    /**
     * NOTE on API Key Management:
     * Storing API keys in a global variable is not recommended for production.
     * Use environment variables (e.g., process.env.API_KEYS) and a proper
     * configuration management system for better security.
     * For this example, we will keep the 'global.apikey' check to match the original code.
     */

    // Endpoint to create a new payment QRIS.
    app.get('/orderkuota/createpayment', async (req, res) => {
        const { apikey, amount, codeqr } = req.query;

        // --- Input Validation ---
        if (!global.apikey || !global.apikey.includes(apikey)) {
            return res.status(401).json({ status: false, error: 'Unauthorized: Invalid API key' });
        }
        if (!amount) {
            return res.status(400).json({ status: false, error: 'Bad Request: Amount is required' });
        }
        if (!codeqr) {
            return res.status(400).json({ status: false, error: 'Bad Request: Base QRIS code (codeqr) is required' });
        }

        try {
            // Generate the dynamic QRIS data.
            const qrData = await createDynamicQRIS(codeqr, amount);
            res.status(200).json({
                status: true,
                message: 'QRIS payment created successfully.',
                result: qrData
            });
        } catch (error) {
            // Send a generic server error message to the client.
            res.status(500).json({ status: false, error: 'Internal Server Error', message: error.message });
        }
    });

    // Endpoint to check the status of the latest transaction.
    app.get('/orderkuota/cekstatus', async (req, res) => {
        const { merchant, keyorkut, apikey } = req.query;

        // --- Input Validation ---
        if (!global.apikey || !global.apikey.includes(apikey)) {
             return res.status(401).json({ status: false, error: 'Unauthorized: Invalid API key' });
        }
        if (!merchant) {
            return res.status(400).json({ status: false, error: 'Bad Request: Merchant ID is required' });
        }
        if (!keyorkut) {
            return res.status(400).json({ status: false, error: 'Bad Request: Gateway API key (keyorkut) is required' });
        }

        try {
            const latestTransaction = await checkLatestTransaction(merchant, keyorkut);

            if (latestTransaction) {
                res.status(200).json({
                    status: true,
                    message: 'Latest transaction retrieved successfully.',
                    result: latestTransaction
                });
            } else {
                res.status(404).json({
                    status: false,
                    message: 'No transactions found.'
                });
            }
        } catch (error) {
            res.status(500).json({ status: false, error: 'Internal Server Error', message: error.message });
        }
    });
};
