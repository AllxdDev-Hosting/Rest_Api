module.exports = function (app) {
app.get('/download/likee', async (req, res) => {
        try {      
        const { apikey } = req.query;
            if (!global.apikey.includes(apikey)) return res.json({ status: false, error: 'Apikey invalid' })
            const { url } = req.query;
            if (!url) {
                return res.json({ status: false, error: 'Url is required' });
            }
            const results = await global.fetchJson(`https://fastrestapis.fasturl.cloud/downup/likeedown?url=${url}`);
            res.status(200).json({
                status: true,
                result: results.result
            });
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
});
}